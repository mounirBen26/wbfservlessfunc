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
        // Log the incoming request body
        console.log('Incoming request body:', event.body);
        
        // Parse itemId and newOrderValue from request body
        const { itemId, newOrderValue } = JSON.parse(event.body);
        
        // Log parsed values
        console.log('Parsed values:', { itemId, newOrderValue, collectionId });
        
        if (!itemId || newOrderValue === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Missing itemId or newOrderValue in request body.' }),
            };
        }

        // Construct the API endpoint for updating the item
        const url = `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`;
        
        // Log the request details
        console.log('Making request to:', url);
        const requestBody = {
            fields: {
                "order": parseInt(newOrderValue)  // Ensure number type
            }
        };
        console.log('Request body:', JSON.stringify(requestBody));

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

        // Log the response status and headers
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to update item',
                    status: response.status,
                    details: errorText,
                    requestUrl: url,
                    requestBody: requestBody
                })
            };
        }

        const updatedData = await response.json();
        console.log('Success response:', updatedData);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Order updated successfully', 
                data: updatedData 
            }),
        };
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            event: event
        });
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Server error',
                details: error.message,
                stack: error.stack
            }),
        };
    }
};
