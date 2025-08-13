"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const otpSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
}, { timestamps: true });
const Otp = mongoose_1.default.model("Otp", otpSchema, "otp");
exports.default = Otp;
