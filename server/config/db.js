const mongoose = require('mongoose');

// Function to establish connection with MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
