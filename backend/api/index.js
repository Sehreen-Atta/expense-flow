const app = require('../app');
const connectToDatabase = require('../lib/db');

// Serverless function entry point
module.exports = async (req, res) => {
  // Ensure DB connection is established before handling request
  await connectToDatabase();
  
  // Let Express handle the request
  return app(req, res);
};
