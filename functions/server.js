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

// CORS Headers Helper
const setCORSHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

// API Handler
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // Prevent timeout issues

  const corsHeaders = setCORSHeaders();

  try {
    await connectToMongoDB(); // Ensure MongoDB connection

    const { path: requestPath, httpMethod } = event;

    if (httpMethod === 'OPTIONS') {
      // Handle CORS preflight request
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: '',
      };
    }

    if (httpMethod === 'GET' && requestPath === '/api') {
      // Fetch wonders from MongoDB
      const wonders = await Wonder.find();
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wonders),
      };
    }

    // Serve the index.html file for the root route
    if (httpMethod === 'GET' && requestPath === '/') {
      const indexPath = path.join(__dirname, '../public/index.html');
      const data = fs.readFileSync(indexPath);
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        },
        body: data.toString(),
      };
    }

    // Return 404 for other routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: 'Route Not Found',
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: 'Internal Server Error',
    };
  }
};
