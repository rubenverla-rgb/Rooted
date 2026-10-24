// Mollie calls this URL whenever a payment changes status (body: id=tr_xxx).
// We ask Mollie itself for the payment (so a fake call cannot fake an order) and, when it is PAID,
// we email the order details to the shop owner via Resend.

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) return res.status(500).end();

  let body = req.body;
  if (typeof body === 'string') { try { body = Object.fromEntries(new URLSearchParams(body)); } catch (e) { body = {}; } }
  const id = String((body && body.id) || (req.query && req.query.id) || '');
  if (!/^tr_[A-Za-z0-9]{4,40}$/.test(id)) return res.status(200).end();   // ignore junk, do not make Mollie retry

  let p;
  try {
    const r = await fetch(`https://api.mollie.com/v2/payments/${id}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) return res.status(200).end();
    p = await r.json();
  } catch (e) { return res.status(500).end(); }          // Mollie will try again

  if (p.status !== 'paid') return res.status(200).end(); // only paid orders are mailed

  const resend = process.env.RESEND_API_KEY;
  if (!resend) { console.error('Order paid but RESEND_API_KEY is not set:', p.metadata && p.metadata.order); return res.status(200).end(); }

  const m = p.metadata || {};
  const to = process.env.ORDER_EMAIL_TO || 'rooted.designforplants@gmail.com';
  const total = `€${p.amount.value}`;
  const rows = [
    ['Order', m.order || p.description],
    ['Paid', total + (m.code ? `  (discount code ${m.code}: -€${m.discount})` : '')],
    ['Items', m.items],
    ['Customer', m.name],
    ['Email', m.email],
    ['Phone', m.phone || '-'],
    ['Delivery', m.ship],
    ['Address', m.to],
    ['Note', m.note || '-'],
    ['Mollie payment', p.id],
    ['Mode', p.mode],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<h2>New Rooted order ${esc(m.order || '')}</h2><table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:15px">` +
    rows.map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('') + '</table>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resend}`, 'Content-Type': 'application/json', 'Idempotency-Key': `rooted-${p.id}` },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || 'Rooted shop <onboarding@resend.dev>',
        to: [to],
        reply_to: /^\S+@\S+\.\S+$/.test(m.email || '') ? m.email : undefined,
        subject: `New order ${m.order || ''} - ${total}${p.mode === 'test' ? ' (TEST)' : ''}`,
        text, html,
      }),
    });
    if (!r.ok) { console.error('Resend error', r.status, await r.text().catch(() => '')); return res.status(500).end(); }
  } catch (e) { console.error('Resend unreachable', e.message); return res.status(500).end(); }
  res.status(200).end();
};
