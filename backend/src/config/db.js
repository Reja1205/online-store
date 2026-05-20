

const mongoose = require("mongoose");
const { repairGuestCartDocuments } = require("../utils/cartOwner");

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/ecommerce";

    await mongoose.connect(uri);
    await repairGuestCartDocuments();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;