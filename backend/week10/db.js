const mongoose = require("mongoose");
const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoUrl = process.env.mongourl || process.env.MONGODB_URI;

if (!mongoUrl) {
  console.error("Missing mongourl or MONGODB_URI in environment variables");
}

const connection = mongoUrl
  ? mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 10000 })
  : Promise.reject(new Error("No MongoDB connection string provided"));

module.exports = { connection };
