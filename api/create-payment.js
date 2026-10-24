const crypto = require('crypto');
const { PRODUCTS, NAMES, SHIPPING, DEFAULT_SOLD_OUT, cents, euro, getDiscount, priceOrder } = require('./_shared');

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const fail = (res, code, error) => res.status(code).json({ error });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');

  const key = process.env.MOLLIE_API_KEY;
  if (!key) return fail(res, 500, 'Online payment is not set up yet.');

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch (e) { return fail(res, 400, 'Invalid request.'); }
  b = b || {};

  // ---- cart ----
  if (!Array.isArray(b.lines) || !b.lines.length || b.lines.length > 20) return fail(res, 400, 'Your cart is empty.');
  const qty = {};
  for (const l of b.lines) {
    const q = Number(l && l.qty);
    if (!l || !(l.id in PRODUCTS) || !Number.isInteger(q) || q < 1 || q > 50) return fail(res, 400, 'Invalid cart.');
    qty[l.id] = (qty[l.id] || 0) + q;
  }

  // ---- sold out? ----
  let soldOut = DEFAULT_SOLD_OUT;
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const r = await fetch(`https://${host}/stock.json`, { headers: { 'cache-control': 'no-cache' } });
    if (r.ok) soldOut = (await r.json()).soldOut || [];
  } catch (e) { /* keep default */ }
  const gone = Object.keys(qty).filter(id => soldOut.includes(id));
  if (gone.length) return fail(res, 409, `${NAMES[gone[0]]} is sold out. Please remove it from your cart.`);

  // ---- customer & delivery ----
  const c = b.customer || {}, a = b.address || {}, d = b.delivery || {};
  const customer = { first: clean(c.first, 60), last: clean(c.last, 60), email: clean(c.email, 120), phone: clean(c.phone, 30) };
  const address = { street: clean(a.street, 80), number: clean(a.number, 15), postal: clean(a.postal, 12), city: clean(a.city, 60), country: clean(a.country, 20) };
  if (!customer.first || !customer.last || !/^\S+@\S+\.\S+$/.test(customer.email)) return fail(res, 400, 'Please check your name and email.');
  if (!address.street || !address.number || !address.postal || !address.city) return fail(res, 400, 'Please check your delivery address.');
  const zone = SHIPPING[address.country];
  if (!zone) return fail(res, 400, 'We do not deliver to that country.');
  const method = d.method === 'pickup' ? 'pickup' : 'home';
  const pickupPoint = clean(d.pickupPoint, 160);
  if (method === 'pickup' && !pickupPoint) return fail(res, 400, 'Please enter your chosen pickup point.');
  const ship = zone[method];

  // ---- amount (computed here, never trusted from the browser) ----
  const subtotal = Object.entries(qty).reduce((s, [id, q]) => s + cents(PRODUCTS[id]) * q, 0);
  const shipping = cents(ship.price);
  const codeIn = clean(b.code, 40);
  const disc = codeIn ? getDiscount(codeIn) : null;
  if (codeIn && !disc) return fail(res, 400, 'This discount code is not valid.');
  const { discount, total } = priceOrder(subtotal, shipping, disc);

  const orderId = 'ROOT-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
  const host = req.headers['x-forwarded-host'] || req.headers.host;

  // Mollie metadata is limited to ~1 kB: keep it compact (this is what you see in your Mollie dashboard)
  const meta = {
    order: orderId,
    items: Object.entries(qty).map(([id, q]) => `${q}x ${NAMES[id]}`).join('; '),
    name: `${customer.first} ${customer.last}`,
    email: customer.email,
    phone: customer.phone,
    ship: method === 'pickup' ? `PICKUP ${ship.carrier}: ${pickupPoint}` : `HOME ${ship.carrier}`,
    to: `${address.street} ${address.number}, ${address.postal} ${address.city}, ${address.country}`,
    note: clean(b.note, 200),
    ...(disc ? { code: disc.code, discount: euro(discount) } : {}),
  };
  while (Buffer.byteLength(JSON.stringify(meta)) > 950 && meta.note) meta.note = meta.note.slice(0, Math.max(0, meta.note.length - 20));

  let r, data;
  try {
    r = await fetch('https://api.mollie.com/v2/payments?include=details.qrCode', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: { currency: 'EUR', value: euro(total) },
        description: `Rooted order ${orderId}`,
        redirectUrl: `https://${host}/?order=${orderId}`,
        webhookUrl: `https://${host}/api/mollie-webhook`,
        method: 'bancontact',
        locale: 'en_GB',
        metadata: meta,
      }),
    });
    data = await r.json();
  } catch (e) {
    return fail(res, 502, 'Could not reach the payment provider. Please try again.');
  }
  if (!r.ok) {
    console.error('Mollie error', r.status, data && (data.detail || data.title));
    // Mollie's own explanation (e.g. "payment method not enabled", "amount too low") contains no secrets
    const why = data && (data.detail || data.title) ? String(data.detail || data.title).slice(0, 220) : '';
    return fail(res, 502, 'Could not start the payment' + (why ? ' (Mollie: ' + why + ')' : '') + '. Please try again or contact us.');
  }

  res.status(200).json({
    paymentId: data.id,
    orderId,
    subtotal: subtotal / 100,
    shipping: shipping / 100,
    discount: discount / 100,
    total: total / 100,
    carrier: ship.carrier,
    qr: data.details && data.details.qrCode ? data.details.qrCode.src : null,
    checkoutUrl: data._links && data._links.checkout ? data._links.checkout.href : null,
    expiresAt: data.expiresAt || null,
  });
};
