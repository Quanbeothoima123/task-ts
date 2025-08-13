import { Request, Response, NextFunction } from "express";
import User from "../api/v1/models/user.model";
import { UserDocument } from "../types/express";

// Extend Express Request to include user property
declare module "express" {
  interface Request {
    user?: UserDocument | null;
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response<any, Record<string, any>>> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ code: 401, message: "Thiếu Authorization header" });
    }

    const tokenUser = authHeader.split(" ")[1];
    if (!tokenUser) {
      return res
        .status(400)
        .json({ code: 400, message: "Vui lòng gửi tokenUser!" });
    }

    const user = await User.findOne({
      tokenUser: tokenUser,
      deleted: false,
      status: "active",
    });

    if (!user) {
      return res.status(401).json({ code: 401, message: "Token không hợp lệ" });
    }

    req.user = user; // Gán user với kiểu đã khớp
    next();
  } catch (error) {
    console.error(error); // Log lỗi để debug
    return res.status(500).json({ code: 500, message: "Lỗi server" });
  }
};
