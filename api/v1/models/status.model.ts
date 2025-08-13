import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
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
const Status = mongoose.model("Status", statusSchema, "status");

export default Status;
