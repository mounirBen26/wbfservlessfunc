// netlify/functions/webflow-collection-items.js

exports.handler = async function(event, context) {
  const fetch = (await import('node-fetch')).default;
  const apiKey = process.env.WEBFLOW_API_KEY; // Use environment variables for sensitive info
  const collectionId = process.env.collectionId;   // Replace with your collection ID
  const url = `https://api.webflow.com/v2/collections/${collectionId}/items`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
