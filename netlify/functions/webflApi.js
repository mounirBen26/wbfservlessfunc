// netlify/functions/webflow-collection-items.js

exports.handler = async function(event, context) {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.WEBFLOW_API_KEY;
    const collectionId = process.env.collectionId;
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items`;

    // Define allowed origins
    const allowedOrigins = ['https://jimag.webflow.io', 'https://www.ji-mag.com'];
    const origin = event.headers.origin;
    
    // Set CORS headers based on allowed origins
    const headers = {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    // Handle preflight OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: 'OK',
        };
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};