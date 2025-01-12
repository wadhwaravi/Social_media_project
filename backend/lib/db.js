import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongo db connected ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error while connecting to mongo db ${error.message}`);
    process.exit();
  }
};
