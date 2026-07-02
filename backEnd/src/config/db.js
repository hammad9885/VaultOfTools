const mongoose = require("mongoose");

let dbConnected = false;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 });
    dbConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("MongoDB unavailable — running without database:", err.message);
  }
}

function isDBConnected() {
  return dbConnected;
}

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;
