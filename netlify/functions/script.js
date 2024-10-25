const fetch = require('node-fetch'); // Import node-fetch if you're not on a browser

exports.handler = async (event, context) => {
  try {
    const response = await fetch('https://dummyjson.com/todos');
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' }),
    };
  }
};
