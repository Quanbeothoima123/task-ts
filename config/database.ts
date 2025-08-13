import mongoose from "mongoose";

export const connect = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env file");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connect Success");
  } catch (error) {
    console.log("Connect Error", error);
  }
};
