const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

let connection = null; // Reuse the connection in serverless
const connectToMongoDB = async () => {
  if (!connection) {
    connection = mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return connection;
};

// Define Schema and Model
const wonderSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  establishedYear: Number,
  additionalDetail: String,
  imageUrl: String,
});
const Wonder = mongoose.model('wonder', wonderSchema);

// CORS Helper
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// API Handler
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // Prevent function timeout issues

  setCORSHeaders(context);

  try {
    await connectToMongoDB(); // Ensure MongoDB connection

    const { path: requestPath, httpMethod } = event;

    if (httpMethod === 'GET' && requestPath === '/api') {
      // Fetch wonders from MongoDB
      const wonders = await Wonder.find();
      return {
        statusCode: 200,
        body: JSON.stringify(wonders),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Static file serving example
    if (httpMethod === 'GET' && requestPath === '/') {
      const indexPath = path.join(__dirname, '../public/index.html');
      const data = fs.readFileSync(indexPath);
      return {
        statusCode: 200,
        body: data.toString(),
        headers: { 'Content-Type': 'text/html' },
      };
    }

    // If no match, return 404
    return {
      statusCode: 404,
      body: 'Route Not Found',
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
