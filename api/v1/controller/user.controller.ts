// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import md5 from "md5";
import User from "../models/user.model";
import Otp from "../models/otp.model";
import { generateAndSendOtp } from "../../../helpers/otpGenerator";
import { generateRandomString } from "../../../helpers/generate";
export const register = async (req: Request, res: Response) => {
  try {
    const user = {
      fullName: req.body.fullName,
      email: req.body.email,
      password: md5(req.body.password),
      tokenUser: generateRandomString(20),
    };

    const userSave = new User(user);
    await userSave.save();
    console.log(userSave);

    const subject = "Mã xác thực đăng ký tài khoản";
    await generateAndSendOtp(userSave.id, subject, req.body.email);

    res.cookie("userId", userSave.id);
    return res.json({
      code: 200,
      message: "Tạo tài khoản thành công",
      userId: userSave.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const auth = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const otpRequest = req.body.otp;

    const otpRecord = await Otp.findOne({ userId }).select("code expireAt");

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP không tồn tại hoặc đã hết hạn" });
    }

    if (otpRecord.expireAt < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    if (otpRecord.code !== otpRequest) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    // Cập nhật trạng thái user
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "active" },
      { new: true }
    );

    // Xoá OTP sau khi dùng
    await Otp.deleteMany({ userId });
    if (user) {
      res.cookie("tokenUser", user.tokenUser);
    }
    return res.json({
      code: 200,
      message: "Xác thực thành công",
      userToken: user?.tokenUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
      email: email,
    }).select("tokenUser password");

    if (!user || md5(password) !== user.password) {
      return res.json({
        code: 400,
        message: "Sai mật khẩu hoặc tài khoản",
      });
    }

    res.cookie("tokenUser", user.tokenUser);
    return res.json({
      code: 200,
      message: "Đăng nhập thành công",
      userToken: user.tokenUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email }).select("id");

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const subject = "Mã xác thực quên mật khẩu";
    await generateAndSendOtp(user.id, subject, email);

    return res.json({
      code: 200,
      message: "Lấy mã xác thực quên mật khẩu thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const otpPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const otpRequest = req.body.otp;
    const otpRecord = await Otp.findOne({ email }).select(
      "code expireAt userId"
    );

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP không tồn tại hoặc đã hết hạn" });
    }

    if (otpRecord.expireAt < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    if (otpRecord.code !== otpRequest) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    // Xoá OTP sau khi dùng
    await Otp.deleteMany({ email });
    res.cookie("userId", otpRecord.userId);

    return res.json({
      code: 200,
      message: "Xác thực thành công",
      userId: otpRecord.userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { userId, password } = req.body;
    const userRecord = await User.findOne({
      _id: userId,
      deleted: false,
      status: "active",
    }).select("password tokenUser");

    if (!userRecord) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (md5(password) === userRecord.password) {
      return res.json({
        code: 400,
        message: "Mật khẩu này đã được dùng gần đây",
      });
    }

    await userRecord.updateOne({ password: md5(password) });
    res.cookie("tokenUser", userRecord.tokenUser);

    return res.json({
      code: 200,
      message: "Đổi mật khẩu thành công",
      tokenUser: userRecord.tokenUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const detail = async (
  req: Request,
  res: Response
): Promise<void | Response<any, Record<string, any>>> => {
  try {
    if (!req.cookies) {
      return res.json({
        code: 400,
        message: "Lỗi chưa đăng nhập!",
      });
    }
    const tokenUser = req.cookies.tokenUser;
    console.log(tokenUser);
    if (!tokenUser) {
      return res.json({
        code: 400,
        message: "Lỗi chưa đăng nhập!",
      });
    }

    const user = await User.findOne({
      tokenUser: tokenUser,
    }).select("-password");

    if (!user) {
      return res.json({
        code: 400,
        message: "Có lỗi lấy thông tin người dùng!",
      });
    }

    res.json({
      code: 200,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
