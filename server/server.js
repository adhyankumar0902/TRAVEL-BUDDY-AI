const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load environment variables from server/.env file
dotenv.config();

// Create Express application instance
const app = express();

// Connect to MongoDB database
connectDB();

// Middleware Setup
// Enable Cross-Origin Resource Sharing (CORS) so our React frontend can query our server
app.use(cors());
// Parse incoming requests with JSON payloads
app.use(express.json());

// Main Auth Routes mount path
app.use('/api/auth', authRoutes);

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send('TravelBuddy AI Backend API is running...');
});

// Start listening for API requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
