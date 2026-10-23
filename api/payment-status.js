module.exports = async (req, res) => {
  const key = process.env.MOLLIE_API_KEY;
  const id = String((req.query && req.query.id) || '');
  if (!key) return res.status(500).json({ error: 'Online payment is not set up yet.' });
  if (!/^tr_[A-Za-z0-9]{4,40}$/.test(id)) return res.status(400).json({ error: 'Invalid payment id.' });
  try {
    const r = await fetch(`https://api.mollie.com/v2/payments/${id}`, { headers: { Authorization: `Bearer ${key}` } });
    const data = await r.json();
    if (!r.ok) return res.status(404).json({ error: 'Payment not found.' });
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ status: data.status });   // open | pending | paid | failed | canceled | expired
  } catch (e) {
    res.status(502).json({ error: 'Could not check the payment.' });
  }
};
