// Create a Netlify serverless function
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const itemId = "6720ef1d6195bb3d6139544a";
  const collectionId = "6553e71600ad68934cb80cb0";
  const token = "13ff929739596aa0d9c8e160be497ee4822f93833420ea36d998ce8c1bf2c964";

  const url = `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`;
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  const data = {
    "fieldData": {
      "order": 4
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
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update Webflow data", details: error.message })
    };
  }
};
