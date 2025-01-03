exports.handler = async (event, context) => {
  const fetch = (await import('node-fetch')).default;
  const collectionId = "6553e71600ad68934cb80cb0";  // Webflow collection ID
  const token = "13ff929739596aa0d9c8e160be497ee4822f93833420ea36d998ce8c1bf2c964";  // Webflow API token

  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://www.ji-mag.com",  // Replace with your domain
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight (OPTIONS) request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'CORS preflight response' })
    };
  }

  // Allow only POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  // Parse incoming data
  const { id, order } = JSON.parse(event.body);  // Extract `id` and `order` from the request body
  const itemId = id;
  const newOrder = order + 1;  // Increment the order by 1
  console.log("+++++", order, newOrder);

  const url = `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`;
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  const data = {
    "fieldData": {
      "order": newOrder
    },
    "isDraft": false
  };

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(data)
    });

    const responseData = await response.json();
    return {
      statusCode: response.status,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Order updated successfully',
        data: responseData
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Failed to update Webflow data",
        details: error.message
      })
    };
  }
};
