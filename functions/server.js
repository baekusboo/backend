const http = require('http');
const mongoose = require('mongoose');
const url = require('url');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Serve Static Files
const serveStaticFile = (req, res) => {
  const filePath = path.join(__dirname, '../public', req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
    } else {
      const extname = path.extname(filePath);
      let contentType = 'text/plain';

      switch (extname) {
        case '.css':
          contentType = 'text/css';
          break;
        case '.js':
          contentType = 'application/javascript';
          break;
        case '.html':
          contentType = 'text/html';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        default:
          contentType = 'application/octet-stream';
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
};



const mongoURI = process.env.MONGO_URI;




// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Define the schema and model
const wonderSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  establishedYear: Number,
  additionalDetail: String,
  imageUrl: String
});

const Wonder = mongoose.model('wonder', wonderSchema);

// CORS Middleware Function
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Create the server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  // Apply CORS headers to every request
  setCORSHeaders(res);

  if (req.url === '/') {
    // Serve the index.html file
    fs.readFile(path.join(__dirname, '../public/index.html'), (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('Index File Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }  else if (pathname === '/api' && req.method === 'GET') {

      // Example API endpoint (replace with your actual database logic if needed)
      console.log('Received request on /api');
      try {

        const wonders = await Wonder.find();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(wonders));
      } catch (error) {
        console.error('Error fetching data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
  }
  
  else
  {
    // Serve other static files
    serveStaticFile(req, res);
  }
});

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
