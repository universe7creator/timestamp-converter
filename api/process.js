// Timestamp Converter Pro - API Endpoint
// Supports: Unix timestamp, ISO 8601, Human-readable conversion

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input, format, targetFormat } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    let date;
    let parsedFormat = format;

    // Auto-detect format if not specified
    if (!format) {
      if (/^\d+$/.test(input)) {
        parsedFormat = 'unix';
        const num = parseInt(input);
        // Detect if milliseconds or seconds
        date = new Date(num > 9999999999 ? num : num * 1000);
      } else if (/^\d{4}-\d{2}-\d{2}/.test(input)) {
        parsedFormat = 'iso';
        date = new Date(input);
      } else {
        parsedFormat = 'human';
        date = new Date(input);
      }
    } else {
      // Parse based on specified format
      switch (format.toLowerCase()) {
        case 'unix':
        case 'timestamp':
          const num = parseInt(input);
          date = new Date(num > 9999999999 ? num : num * 1000);
          break;
        case 'iso':
        case 'iso8601':
          date = new Date(input);
          break;
        case 'human':
        case 'string':
          date = new Date(input);
          break;
        default:
          date = new Date(input);
      }
    }

    // Validate date
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        input,
        detectedFormat: parsedFormat
      });
    }

    // Get current time for relative calculation
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Generate relative time string
    let relativeTime;
    if (Math.abs(diffSeconds) < 60) {
      relativeTime = diffSeconds > 0 ? 'in a few seconds' : 'just now';
    } else if (Math.abs(diffMinutes) < 60) {
      relativeTime = diffMinutes > 0 ? `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}` : `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffHours) < 24) {
      relativeTime = diffHours > 0 ? `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}` : `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffDays) < 30) {
      relativeTime = diffDays > 0 ? `in ${diffDays} day${diffDays !== 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      relativeTime = diffMonths > 0 ? `in ${diffMonths} month${diffMonths !== 1 ? 's' : ''}` : `${Math.abs(diffMonths)} month${Math.abs(diffMonths) !== 1 ? 's' : ''} ago`;
    }

    // Build response
    const response = {
      success: true,
      input,
      detectedFormat: parsedFormat,
      results: {
        unix: Math.floor(date.getTime() / 1000),
        unixMs: date.getTime(),
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toString(),
        date: date.toDateString(),
        time: date.toTimeString(),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        milliseconds: date.getMilliseconds(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        relative: relativeTime,
        isPast: diffMs < 0,
        isFuture: diffMs > 0
      },
      formatted: {
        short: date.toLocaleDateString(),
        long: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        timeOnly: date.toLocaleTimeString(),
        datetime: date.toLocaleString()
      }
    };

    // If target format specified, include converted value
    if (targetFormat) {
      switch (targetFormat.toLowerCase()) {
        case 'unix':
          response.converted = Math.floor(date.getTime() / 1000);
          break;
        case 'iso':
          response.converted = date.toISOString();
          break;
        case 'human':
          response.converted = date.toUTCString();
          break;
      }
    }

    return res.json(response);

  } catch (error) {
    console.error('Timestamp conversion error:', error);
    return res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
};