// Open https://YOUR-SITE/api/health to check that the payment functions are deployed.
// It never shows the key itself.
module.exports = (req, res) => {
  const k = process.env.MOLLIE_API_KEY || '';
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    functionsDeployed: true,
    mollieKeyConfigured: k.length > 0,
    mollieKeyType: k.startsWith('live_') ? 'live' : k.startsWith('test_') ? 'test' : k ? 'unknown' : null,
  });
};
