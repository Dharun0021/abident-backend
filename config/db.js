const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || "abident";

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    await mongoose.connect(mongoUri, { dbName });
    console.log(`MongoDB Connected (${mongoose.connection.name}) via MONGO_URI`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;