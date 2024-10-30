// netlify/functions/republishSite.js

exports.handler = async function(event, context) {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.WEBFLOW_API_KEY;
    const siteId = process.env.WEBFLOW_SITE_ID; // The ID of your Webflow site
    const url = `https://api.webflow.com/v2/sites/${siteId}/publish`;
  
    // Define allowed origins
    const allowedOrigins = ['https://jimag.webflow.io', 'https://www.ji-mag.com']; // Add any additional allowed origins here
  
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
      headers['Access-Control-Allow-Origin'] = allowedOrigins[0]; // Default to first allowed origin or use '*' (not recommended for production)
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
          domains: ['www.ji-mag.com'], // Add any other domains for your Webflow site here
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
  
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Site republished successfully', data }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }
  };
  