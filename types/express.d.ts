import { Document } from "mongoose";

// Define UserDocument interface based on your User schema
interface UserDocument extends Document {
  tokenUser: string;
  deleted: boolean;
  status: string;
  fullName?: string | null;
  email?: string | null;
  avatar?: string | null;
  password?: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Add other fields from your User schema as needed
}

declare module "express" {
  interface Request {
    user?: UserDocument | null | undefined;
  }
}
