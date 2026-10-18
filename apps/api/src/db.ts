import mongoose from "mongoose";
import { config } from "./config";

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongodbUri);
  console.log(`[api] MongoDB connected → ${config.mongodbUri}`);
  return mongoose.connection;
}
