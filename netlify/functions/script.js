exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Allows requests from any origin
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify({ message: "Hello from Netlify!" }),
  };
};