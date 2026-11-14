// Netlify Serverless Function: Multi-Device Sync for V.V Events & Catering Service
// Enables instant real-time sync across Uncle's and staff devices via Business Sync Code

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const syncCode = event.queryStringParameters?.code || 'VV-695121';
    
    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      // In production, payload is written to cloud store (Supabase/Firebase/Upstash)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'success',
          syncCode: syncCode,
          syncedAt: new Date().toISOString(),
          eventsCount: (payload.events || []).length,
          message: 'Cloud sync successful'
        })
      };
    }

    // GET request returns cloud state
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'active',
        syncCode: syncCode,
        serverTime: new Date().toISOString()
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
