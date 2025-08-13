// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { validateEmail } from "../../utils/validate.helper";
import User from "../../api/v1/models/user.model";

// Kiểu cho lỗi trả về
interface ValidationError {
  field: string;
  message: string;
}

export const validateRegisterUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fullName, email, password } = req.body as {
    fullName?: string;
    email?: string;
    password?: string;
  };

  const errors: ValidationError[] = [];

  if (!fullName || fullName.trim() === "") {
    errors.push({ field: "fullName", message: "Vui lòng nhập họ tên" });
  }

  // Email: phải đúng định dạng + chưa tồn tại
  const emailError = await validateEmail(email, { mustNotExist: true });
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  }

  if (!password || password.trim() === "") {
    errors.push({ field: "password", message: "Vui lòng nhập mật khẩu" });
  } else if (password.length < 6) {
    errors.push({
      field: "password",
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu đăng ký không hợp lệ",
      errors,
    });
  }

  next();
};

export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body as { email?: string };
  const errors: ValidationError[] = [];

  // Email: phải đúng định dạng + phải tồn tại
  const emailError = await validateEmail(email, { mustNotExist: false });
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Đăng nhập không thành công",
      errors,
    });
  }

  next();
};

export const validateForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body as { email?: string };
  const errors: ValidationError[] = [];

  const emailError = await validateEmail(email, { mustNotExist: false });
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  }
  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  next();
};

export const validateOtpPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, otp } = req.body as { email?: string; otp?: string };
  const errors: ValidationError[] = [];

  const emailError = await validateEmail(email, { mustNotExist: false });
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  }

  if (!otp || otp.trim() === "") {
    errors.push({ field: "otp", message: "Vui lòng nhập otp!" });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  next();
};

export const validateResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, password } = req.body as {
    userId?: string;
    password?: string;
  };
  const errors: ValidationError[] = [];

  if (!userId || userId.trim() === "") {
    errors.push({ field: "userId", message: "Vui lòng gửi lên userId!" });
  } else {
    const checkUserExist = await User.findOne({
      _id: userId,
      deleted: false,
      status: "active",
    });
    if (!checkUserExist) {
      errors.push({ field: "userId", message: "Tài khoản không tồn tại!" });
    }
  }

  if (!password || password.trim() === "") {
    errors.push({ field: "password", message: "Vui lòng nhập mật khẩu" });
  } else if (password.length < 6) {
    errors.push({
      field: "password",
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  next();
};
