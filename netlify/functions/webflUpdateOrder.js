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
        // Parse itemId and currentOrder from request body
        const { itemId, currentOrder } = JSON.parse(event.body);
        
        if (!itemId || currentOrder === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Missing itemId or currentOrder in request body.' }),
            };
        }

        // Calculate new order value by incrementing current value
        const newOrderValue = parseInt(currentOrder) + 1;

        // Construct the API endpoint for updating the item
        const url = `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`;

        const requestBody = {
            fields: {
                "order": newOrderValue
            }
        };

        // Make a PATCH request to update the item
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to update item',
                    status: response.status,
                    details: errorText
                })
            };
        }

        const updatedData = await response.json();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Order updated successfully', 
                data: updatedData,
                previousOrder: currentOrder,
                newOrder: newOrderValue
            }),
        };
    } catch (error) {
        console.error('Error details:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Server error',
                details: error.message
            }),
        };
    }
};
