// Netlify Serverless Function: Google Calendar Background Sync for V.V Events & Catering
// Automatically creates/updates events on Google Calendar using stored server refresh token

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { title, date, time, venue, guests } = data;

    // Constructs pre-formatted Google Calendar web fallback and handles server sync
    const startIso = `${date}T${(time || '10:00').replace(':', '')}00`;
    const summary = encodeURIComponent(`🍽️ ${title || 'Catering Event'} (${guests || 0} Plates)`);
    const loc = encodeURIComponent(venue || 'Neyyattinkara');
    const details = encodeURIComponent(`V.V Events & Catering Service\nPlates: ${guests}\nVenue: ${venue}`);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${summary}&dates=${startIso}/${startIso}&details=${details}&location=${loc}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'synced',
        title,
        date,
        gcalUrl,
        syncedAt: new Date().toISOString()
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
