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

        // Log request details for debugging
        console.log('Request URL:', url);
        console.log('Current Order:', currentOrder);
        console.log('New Order Value:', newOrderValue);

        const requestBody = {
            fields: {
                order: newOrderValue  // Make sure the field name matches exactly
            }
        };

        console.log('Request Body:', JSON.stringify(requestBody, null, 2));

        // Make a PATCH request to update the item
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Get the response text first for debugging
        const responseText = await response.text();
        console.log('Raw Response:', responseText);

        if (!response.ok) {
            console.error('Error response:', responseText);
            
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to update item',
                    status: response.status,
                    details: responseText
                })
            };
        }

        // Parse the response text as JSON
        const updatedData = JSON.parse(responseText);
        
        // Verify the update
        if (updatedData.fieldData.order !== newOrderValue) {
            console.warn('Order field not updated as expected:', {
                expected: newOrderValue,
                actual: updatedData.fieldData.order
            });
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Order updated successfully', 
                data: updatedData,
                previousOrder: currentOrder,
                newOrder: newOrderValue,
                requestBody: requestBody // Include for debugging
            }),
        };
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
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
