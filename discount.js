const { PRODUCTS, SHIPPING, cents, getDiscount, priceOrder } = require('./_shared');

// Checks a discount code and returns the new total. The real price is always recomputed in create-payment.js.
module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch (e) { return res.status(400).json({ error: 'Invalid request.' }); }
  b = b || {};
  const bad = m => res.status(400).json({ valid: false, error: m });

  if (!Array.isArray(b.lines) || !b.lines.length || b.lines.length > 20) return bad('Your cart is empty.');
  let subtotal = 0;
  for (const l of b.lines) {
    const q = Number(l && l.qty);
    if (!l || !(l.id in PRODUCTS) || !Number.isInteger(q) || q < 1 || q > 50) return bad('Invalid cart.');
    subtotal += cents(PRODUCTS[l.id]) * q;
  }
  const zone = SHIPPING[String(b.country || '')];
  if (!zone) return bad('We do not deliver to that country.');
  const shipping = cents(zone[b.method === 'pickup' ? 'pickup' : 'home'].price);

  const disc = getDiscount(b.code);
  if (!disc) return bad('This discount code is not valid.');
  const { discount, total } = priceOrder(subtotal, shipping, disc);
  res.status(200).json({ valid: true, code: disc.code, discount: discount / 100, total: total / 100 });
};
