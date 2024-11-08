const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb+srv://sunitha:sunithasunithasunitha@cluster0.ywtddvn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB URI
mongoose.connect(mongoURI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const wonderSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  establishedYear: Number,
  additionalDetail: String,
  imageUrl: String
});

const Wonder = mongoose.model('Wonder', wonderSchema);

app.use(express.static(path.join(__dirname, 'public')));
  
app.get('/api', async (req, res) => {
  try {
    const wonders = await Wonder.find();
    res.json(wonders);
  } catch (error) {
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});