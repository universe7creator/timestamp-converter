// Timestamp Converter Pro - LemonSqueezy Webhook Handler
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  if (!secret) return true;
  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-signature'];
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (secret && signature && !verifySignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { meta, data } = req.body;

    if (!meta || !meta.event_name) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const event = meta.event_name;
    console.log(`Webhook received: ${event}`);

    switch (event) {
      case 'order_created':
      case 'order_paid':
        console.log('Order paid:', data?.attributes?.customer_email);
        break;

      case 'subscription_created':
        console.log('Subscription created:', data?.attributes?.customer_email);
        break;

      case 'subscription_cancelled':
        console.log('Subscription cancelled:', data?.attributes?.customer_email);
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    return res.json({ received: true, event });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};