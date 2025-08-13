import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import Status from "../../api/v1/models/status.model";
import Task from "../../api/v1/models/task.model";
import User from "../../api/v1/models/user.model";

// Define interface for request body
interface TaskRequestBody {
  title?: string;
  status?: string;
  content?: string;
  timeStart?: string;
  timeFinish?: string;
  listUser?: string[];
  parentTaskId?: string;
}

// Define interface for validation error
interface ValidationError {
  field: string;
  message: string;
}

// Define User model interface (minimal for validation purposes)
export const validateCreateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    title,
    status,
    content,
    timeStart,
    timeFinish,
    listUser,
    parentTaskId,
  } = req.body;
  const errors: ValidationError[] = [];

  // 1. Check title
  if (!title || title.trim() === "") {
    errors.push({ field: "title", message: "Vui lòng nhập tiêu đề" });
  }

  // 2. Check status
  if (!status || !mongoose.Types.ObjectId.isValid(status)) {
    errors.push({ field: "status", message: "Trạng thái không hợp lệ" });
  } else {
    const statusExists = await Status.exists({ _id: status, deleted: false });
    if (!statusExists) {
      errors.push({ field: "status", message: "Trạng thái không tồn tại" });
    }
  }

  // 3. Check content (optional)
  if (content !== undefined && typeof content !== "string") {
    errors.push({ field: "content", message: "Nội dung không hợp lệ" });
  }

  // 4. Check timeStart (optional)
  if (timeStart !== undefined && isNaN(Date.parse(timeStart))) {
    errors.push({ field: "timeStart", message: "Ngày bắt đầu không hợp lệ" });
  }

  // 5. Check timeFinish (optional)
  if (timeFinish !== undefined && isNaN(Date.parse(timeFinish))) {
    errors.push({ field: "timeFinish", message: "Ngày kết thúc không hợp lệ" });
  }

  // 6. Compare timeStart < timeFinish
  if (
    timeStart !== undefined &&
    timeFinish !== undefined &&
    new Date(timeStart) > new Date(timeFinish)
  ) {
    errors.push({
      field: "timeRange",
      message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
    });
  }

  // 7. Check listUser
  if (listUser !== undefined) {
    if (!Array.isArray(listUser)) {
      errors.push({
        field: "listUser",
        message: "Danh sách người dùng phải là mảng",
      });
    } else {
      const invalidIds = listUser.filter(
        (id: string) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        errors.push({
          field: "listUser",
          message: "Một hoặc nhiều ID người dùng không hợp lệ",
        });
      } else {
        // Assume User model is defined elsewhere
        const usersCount = await User.countDocuments({
          _id: { $in: listUser },
          deleted: false,
        });
        if (usersCount !== listUser.length) {
          errors.push({
            field: "listUser",
            message: "Một hoặc nhiều người dùng không tồn tại",
          });
        }
      }
    }
  }

  // 8. Check parentTaskId (optional)
  if (parentTaskId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(parentTaskId)) {
      errors.push({
        field: "parentTaskId",
        message: "parentTaskId không hợp lệ",
      });
    } else {
      const parentExists = await Task.exists({
        _id: parentTaskId,
        deleted: false,
      });
      if (!parentExists) {
        errors.push({
          field: "parentTaskId",
          message: "parentTaskId không tồn tại",
        });
      }
    }
  }

  // 9. Return errors if any
  if (errors.length > 0) {
    res.status(422).json({
      success: false,
      message: "Dữ liệu gửi lên không hợp lệ",
      errors,
    });
    return;
  }

  next();
};

export const validateEditTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { title, status, content, timeStart, timeFinish } = req.body;
  const errors: ValidationError[] = [];

  // Check only provided fields
  if (title !== undefined && title.trim() === "") {
    errors.push({ field: "title", message: "Tiêu đề không được để trống" });
  }

  const statusList: string[] = [
    "6891756913ad616de04c7382",
    "6891756913ad616de04c7383",
    "6891756913ad616de04c7384",
    "6891756913ad616de04c7385",
    "6891756913ad616de04c7386",
  ];

  if (status !== undefined && !statusList.includes(status)) {
    errors.push({ field: "status", message: "Trạng thái không hợp lệ" });
  }

  if (content !== undefined && typeof content !== "string") {
    errors.push({ field: "content", message: "Nội dung không hợp lệ" });
  }

  if (timeStart !== undefined && isNaN(Date.parse(timeStart))) {
    errors.push({ field: "timeStart", message: "Ngày bắt đầu không hợp lệ" });
  }

  if (timeFinish !== undefined && isNaN(Date.parse(timeFinish))) {
    errors.push({ field: "timeFinish", message: "Ngày kết thúc không hợp lệ" });
  }

  if (
    timeStart !== undefined &&
    timeFinish !== undefined &&
    new Date(timeStart) > new Date(timeFinish)
  ) {
    errors.push({
      field: "timeRange",
      message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
    });
  }

  if (errors.length > 0) {
    res.status(422).json({
      success: false,
      message: "Dữ liệu cập nhật không hợp lệ",
      errors,
    });
    return;
  }

  next();
};
