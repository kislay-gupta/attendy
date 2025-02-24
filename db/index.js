import mongoose from "mongoose";

import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    const { host } = connectionInstance.connection;
    console.log("\n MongoDB connected!!");
    console.log(`\n MongoDB connected !! DB HOST: ${host} ,  `);
  } catch (error) {
    console.log("MONGODB connection FAILED!!", error);
    process.exit(1);
  }
};

export default connectDB;
