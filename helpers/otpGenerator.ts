import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import Otp from "../api/v1/models/otp.model"; // Cần đảm bảo file này có export đúng dạng
import { Document } from "mongoose";

// Khai báo type cho biến môi trường để tránh lỗi undefined
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EMAIL_USER: string;
      EMAIL_PASSWORD: string;
    }
  }
}

// Interface cho OTP (tùy thuộc vào schema của bạn)
interface IOtp extends Document {
  userId: string;
  email: string;
  code: string;
  expireAt: Date;
}

export const generateAndSendOtp = async (
  userId: string,
  subject: string,
  email: string = ""
): Promise<void> => {
  // Kiểm tra nếu đã có OTP chưa hết hạn
  const existingOtp = await Otp.findOne<IOtp>({
    userId: userId,
    expireAt: { $gt: new Date() },
  });

  if (existingOtp) {
    throw new Error("Vui lòng chờ một lát trước khi yêu cầu lại mã OTP.");
  }

  // Tạo mã OTP
  const otpCode = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

  // Lưu OTP mới
  await Otp.create({
    userId,
    email,
    code: otpCode,
    expireAt,
  });

  // Gửi email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const html = `<p>Mã OTP của bạn là: <b>${otpCode}</b></p><p>Mã có hiệu lực trong 5 phút.</p>`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: html,
  };

  await transporter.sendMail(mailOptions);
};
