const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/temple-go';
    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn('MongoDB not available — running in JSON fallback mode.');
  }
};

module.exports = connectDB;
