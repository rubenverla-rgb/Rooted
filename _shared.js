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

// Shipping from Belgium, parcel up to 2 kg, prices incl. VAT. Adjust to your real tariffs.
const SHIPPING = {
  Belgium:     { home: { carrier: 'PostNL',        price: 6.97 },  pickup: { carrier: 'Mondial Relay', price: 4.40 } },
  Netherlands: { home: { carrier: 'Mondial Relay', price: 7.00 },  pickup: { carrier: 'Mondial Relay', price: 5.10 } },
  France:      { home: { carrier: 'Mondial Relay', price: 15.00 }, pickup: { carrier: 'Mondial Relay', price: 6.50 } },
  Germany:     { home: { carrier: 'PostNL',        price: 10.69 }, pickup: { carrier: 'DPD Pickup',    price: 9.22 } },
};

// Used when stock.json cannot be read
const DEFAULT_SOLD_OUT = ['stekstation-hout', 'stekstation-frame-hout'];

const cents = n => Math.round(n * 100);
const euro = c => (c / 100).toFixed(2);

module.exports = { PRODUCTS, NAMES, SHIPPING, DEFAULT_SOLD_OUT, cents, euro };
