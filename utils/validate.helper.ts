// utils/validate.helper.ts
import User from "../api/v1/models/user.model";

interface EmailValidationOptions {
  required?: boolean;
  mustExist?: boolean;
  mustNotExist?: boolean;
}

export const validateEmail = async (
  email: string | undefined,
  options: EmailValidationOptions = {}
): Promise<string | null> => {
  const { required = true, mustExist = false, mustNotExist = false } = options;

  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!email || email.trim() === "") {
    if (required) return "Vui lòng nhập email";
    return null;
  }

  if (!emailRegex.test(email)) {
    return "Email không hợp lệ";
  }

  if (mustExist) {
    const user = await User.findOne({
      email,
      deleted: false,
      status: "active",
    });
    if (!user) {
      return "Email không tồn tại trên hệ thống hoặc đã bị khóa";
    }
  }

  if (mustNotExist) {
    const user = await User.findOne({ email });
    if (user) {
      return "Email đã tồn tại trên hệ thống";
    }
  }

  return null; // Không có lỗi
};
