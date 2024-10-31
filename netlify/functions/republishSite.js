// netlify/functions/republishSite.js
exports.handler = async function(event, context) {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.WEBFLOW_API_KEY;
    const siteId = process.env.WEBFLOW_SITE_ID; // The ID of your Webflow site
    const url = `https://api.webflow.com/sites/${siteId}/publish`; // Note: Using /v1 if required
  
    // Define allowed origins
    const allowedOrigins = ['https://jimag.webflow.io', 'https://www.ji-mag.com'];
  
    // CORS headers
    const headers = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    // Check if the request origin is allowed
    const origin = event.headers.origin;
    if (allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    } else {
      headers['Access-Control-Allow-Origin'] = allowedOrigins[0];
    }
  
    // Handle preflight OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: 'OK',
      };
    }
  
    // Ensure method is POST for publishing
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: ['www.ji-mag.com'], // Ensure this domain is in Webflow's site settings
        }),
      });
  
      const responseData = await response.json();
      if (!response.ok) {
        // Detailed error logging for failed requests
        throw new Error(`Webflow API Error ${response.status}: ${responseData.msg || response.statusText}`);
      }
  
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Site republished successfully', data: responseData }),
      };
    } catch (error) {
      // Log error message with specific response details if available
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      };
    }
};
