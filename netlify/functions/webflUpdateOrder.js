exports.handler = async function(event, context) {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.WEBFLOW_API_KEY;
    const collectionId = process.env.collectionId;

    // Define allowed origins for CORS
    const allowedOrigins = ['https://jimag.webflow.io', 'https://www.ji-mag.com'];
    const origin = event.headers.origin;

    // Set up headers with CORS and response settings
    const headers = {
        'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
    };

    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    // Handle OPTIONS preflight request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: 'OK',
        };
    }

    // Only handle PATCH requests
    if (event.httpMethod !== 'PATCH') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    try {
        // Parse itemId and newOrderValue from request body
        const { itemId, newOrderValue } = JSON.parse(event.body);
        
        if (!itemId || newOrderValue === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Missing itemId or newOrderValue in request body.' }),
            };
        }

        // Construct the API endpoint for updating the item
        const url = `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`;

        // Make a PATCH request to update the item
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    "order": newOrderValue  // Using "order" as the specific field key
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error updating item: ${response.status} - ${errorData}`);
        }

        const updatedData = await response.json();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Order updated successfully', 
                data: updatedData 
            }),
        };
    } catch (error) {
        console.error('Error details:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: error.message,
                details: 'Failed to update item in Webflow'
            }),
        };
    }
};
