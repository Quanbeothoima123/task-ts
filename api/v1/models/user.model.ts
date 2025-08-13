import mongoose from "mongoose";

import { generateRandomString } from "../../../helpers/generate";

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    tokenUser: {
      type: String,
      default: generateRandomString(20),
    },
    phone: String,
    avatar: String,
    status: {
      type: String,
      default: "initial",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "users");
export default User;
