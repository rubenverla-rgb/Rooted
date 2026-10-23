// Shared server-side data. The SERVER decides prices, so a visitor cannot change what they pay.
// Keep SHIPPING in sync with the SHIP table in index.html (that one is only used to display prices).

const PRODUCTS = {
  'stekstation-groen': 14.99,
  'stekstation-bruin': 14.99,
  'muurvaasjes-groen': 9.99,
  'muurvaasjes-bruin': 9.99,
  'muurvaasjes-mix': 9.99,
  'type-2-muurvaasjes-groen': 9.99,
  'type-2-muurvaasjes-bruin': 9.99,
  'stekstation-hout': 17.99,
  'stekstation-frame-hout': 19.99,
};

const NAMES = {
  'stekstation-groen': 'Propagation station green',
  'stekstation-bruin': 'Propagation station brown',
  'muurvaasjes-groen': 'Wall vases green',
  'muurvaasjes-bruin': 'Wall vases brown',
  'muurvaasjes-mix': 'Wall vases mix',
  'type-2-muurvaasjes-groen': 'Type 2 wall vases green',
  'type-2-muurvaasjes-bruin': 'Type 2 wall vases brown',
  'stekstation-hout': 'Wooden propagation station',
  'stekstation-frame-hout': 'Wooden frame propagation station',
};

// Shipping from Belgium, parcel up to 2 kg, prices incl. 21% VAT. Adjust to your real tariffs.
//  Belgium: bpost (online label)       Netherlands: PostNL (small-sender tariff 2026, excl. energy surcharge)
//  France: Mondial Relay               Germany: DPD
const SHIPPING = {
  Belgium:     { home: { carrier: 'bpost',         price: 7.10 },  pickup: { carrier: 'bpost',         price: 5.40 } },
  Netherlands: { home: { carrier: 'PostNL',        price: 10.59 }, pickup: { carrier: 'PostNL',        price: 10.29 } },
  France:      { home: { carrier: 'Mondial Relay', price: 15.00 }, pickup: { carrier: 'Mondial Relay', price: 6.50 } },
  Germany:     { home: { carrier: 'DPD',           price: 11.09 }, pickup: { carrier: 'DPD Pickup',    price: 9.22 } },
};

// Used when stock.json cannot be read
const DEFAULT_SOLD_OUT = ['stekstation-hout', 'stekstation-frame-hout'];

const cents = n => Math.round(n * 100);
const euro = c => (c / 100).toFixed(2);

// ---- discount codes ----
// Codes live in the DISCOUNT_CODES environment variable on the host (Vercel), NOT in this repository,
// so nobody can read them here. Format: CODE=type:value, separated by commas. Example:
//   TESTPAY=total:0.01,WELCOME10=percent:10,FIVEOFF=off:5
//  percent:N  -> N% off the products (not the shipping)
//  off:X      -> X euro off the products (never below 0)
//  total:X    -> the WHOLE order (products + shipping) costs only X euro. Handy to test real payments.
function getDiscount(code) {
  const wanted = String(code || '').trim().toUpperCase();
  if (!wanted || wanted.length > 40) return null;
  for (const part of String(process.env.DISCOUNT_CODES || '').split(',')) {
    const m = part.trim().match(/^([^=\s]+)\s*=\s*(percent|off|total)\s*:\s*([0-9]+(?:[.,][0-9]+)?)$/i);
    if (!m || m[1].toUpperCase() !== wanted) continue;
    const value = parseFloat(m[3].replace(',', '.'));
    if (!(value >= 0)) return null;
    return { code: wanted, type: m[2].toLowerCase(), value };
  }
  return null;
}

// All amounts in cents. Never returns a total below 2 cents (Mollie's minimum for Bancontact is EUR 0.02).
function priceOrder(subtotal, shipping, disc) {
  let discount = 0;
  if (disc) {
    if (disc.type === 'percent') discount = Math.round(subtotal * Math.min(disc.value, 100) / 100);
    else if (disc.type === 'off') discount = Math.min(cents(disc.value), subtotal);
    else if (disc.type === 'total') discount = Math.max(0, subtotal + shipping - cents(disc.value));
  }
  let total = subtotal + shipping - discount;
  if (total < 2) { discount -= 2 - total; total = 2; }
  return { discount, total };
}

module.exports = { PRODUCTS, NAMES, SHIPPING, DEFAULT_SOLD_OUT, cents, euro, getDiscount, priceOrder };
