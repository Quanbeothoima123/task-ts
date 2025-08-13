import Task from "../../v1/models/task.model";
import Status from "../models/status.model";
import paginationHelper from "../../../helpers/pagination";
import searchHelper from "../../../helpers/search";
import { Request, Response } from "express";
import mongoose from "mongoose";
export const index = async (req: Request, res: Response) => {
  try {
    interface Find {
      deleted: boolean;
      status?: string;
      title?: RegExp;
    }
    // Find
    const find: Find = {
      deleted: false,
    };
    const status = await Status.find({
      deleted: false,
    }).select("_id name");
    if (req.query.status) {
      status.forEach((item) => {
        if (item.name == req.query.status?.toString()) {
          find.status = item.id;
        }
      });
    }

    interface Sort {
      [key: string]: 1 | -1;
    }
    // Tìm kiếm bằng keyword
    const objectSearch = searchHelper(req.query);
    if (req.query.keyword) {
      find.title = objectSearch.regex;
    }
    // Phân trang
    const countTasks = await Task.countDocuments(find);
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 2,
        skip: 0,
      },
      req.query,
      countTasks
    );

    // Sort
    const sort: Sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      const sortKey = req.query.sortKey as string;
      const sortValue = req.query.sortValue as string;

      // Kiểm tra sortKey hợp lệ
      const validKeys = ["title", "createdAt", "timeStart", "timeFinish"]; // Danh sách trường hợp lệ
      if (!validKeys.includes(sortKey)) {
        return res.status(500).json({ message: "sort key không hợp lệ" });
      }

      // Kiểm tra và ánh xạ sortValue
      if (sortValue === "asc") {
        sort[sortKey] = 1;
      } else if (sortValue === "desc") {
        sort[sortKey] = -1;
      } else {
        return res
          .status(500)
          .json({ message: "sort value chỉ gồm 2 giá trị asc và desc" });
      }
    }

    const tasks = await Task.find(find)
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip); // Sử dụng await để lấy dữ liệu

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu task", error });
  }
};
export const detail = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findOne({ deleted: false, _id: taskId }); // Sử dụng await để lấy dữ liệu
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu task", error });
  }
};

export const changeStatus = async (req: Request, res: Response) => {
  const idTask = req.params.id;
  const statusId = req.body.status;
  try {
    const checkStatusValidate = await Status.findOne({ _id: statusId });
    const checkTaskValidate = await Task.findOne({ _id: idTask });

    if (checkStatusValidate && checkTaskValidate) {
      await Task.updateOne({ _id: idTask }, { status: statusId });

      return res.json({
        code: 200,
        message: "Cập nhật thành công trạng thái của task",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Không tồn tại trạng thái hoặc task này!" });
  }
};

export const changeMulti = async (req: Request, res: Response) => {
  const ids: string[] = req.body.ids;
  const key: string = req.body.key;
  const value: string = req.body.value;
  enum KEY {
    STATUS = "status",
    DELETED = "deleted",
    POSITION = "position",
    ACTIVE = "active",
    INACTIVE = "inactive",
  }
  console.log("Nhận yêu cầu:", { ids, key, value });

  // Kiểm tra đầu vào hợp lệ
  if (!Array.isArray(ids) || ids.length === 0 || !key) {
    return res.status(400).json({ message: "Dữ liệu đầu vào không hợp lệ" });
  }

  // Kiểm tra ObjectId hợp lệ
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    return res.status(400).json({ message: "Tất cả ID đều không hợp lệ" });
  }

  try {
    switch (key) {
      case KEY.STATUS: {
        // Kiểm tra status hợp lệ
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return res.status(400).json({ message: "Status ID không hợp lệ" });
        }

        const checkStatus = await Status.findOne({
          _id: value,
          deleted: false,
        });

        if (!checkStatus) {
          return res
            .status(404)
            .json({ message: "Trạng thái không tồn tại trong hệ thống" });
        }

        await Task.updateMany({ _id: { $in: validIds } }, { status: value });

        return res.json({
          code: 200,
          message: "Cập nhật trạng thái thành công",
        });
      }

      case KEY.DELETED: {
        // Cập nhật trạng thái deleted (giả sử value là true/false)
        const deletedValue = value === "true";

        await Task.updateMany({ _id: { $in: validIds } }, { deleted: true });

        return res.json({
          code: 200,
          message: `Cập nhật deleted=${deletedValue} thành công`,
        });
      }

      default:
        return res.status(400).json({
          message: `Không hỗ trợ cập nhật với key '${key}'`,
        });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật nhiều Task:", error);
    return res.status(500).json({
      message: "Đã có lỗi xảy ra từ server",
    });
  }
};

export const create = async (
  req: Request,
  res: Response
): Promise<void | Response<any, Record<string, any>>> => {
  try {
    // Check if req.user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Người dùng chưa được xác thực!",
      });
    }

    // Assign createdBy with Mongoose _id
    req.body.createdBy = req.user._id;

    const task = new Task(req.body);
    await task.save();
    res.status(201).json({
      success: true,
      message: "Tạo task mới thành công!",
      data: task,
    });
  } catch (error) {
    console.error(error); // Log lỗi để debug
    res.status(500).json({
      success: false,
      message: "Tạo task mới thất bại!",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const edit = async (
  req: Request,
  res: Response
): Promise<void | Response<any, Record<string, any>>> => {
  try {
    // Check if req.user exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Người dùng chưa được xác thực!",
      });
    }
    const account_id = req.user.id;
    const updatedBy = {
      account_id: account_id,
      updatedAt: new Date(),
    };

    const taskId = req.params.id;
    await Task.updateOne(
      {
        _id: taskId,
        deleted: false,
      },
      {
        ...req.body,
        $push: { updatedBy: updatedBy },
      }
    );
    return res.status(201).json({
      success: true,
      message: "Cập nhật task thành công!",
    });
  } catch (error) {
    console.error(error); // Log nếu cần debug
    return res.status(500).json({
      success: false,
      message: "Cập nhật thất bại!",
    });
  }
};
