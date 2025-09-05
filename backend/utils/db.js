const mongoose = require("mongoose");

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/thecinephiletv";

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    // options kept minimal; Mongoose 8 uses sane defaults
  });

  isConnected = true;
  console.log("MongoDB connected");
  return mongoose.connection;
};

module.exports = { connectToDatabase };



