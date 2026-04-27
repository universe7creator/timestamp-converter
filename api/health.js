// Timestamp Converter Pro - Health Check
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  res.json({
    status: 'healthy',
    service: 'timestamp-converter',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: '100%'
  });
};