import { Router } from "express";
const router: Router = Router();
import * as taskController from "../controller/task.controller";
import {
  validateCreateTask,
  validateEditTask,
} from "../../../validates/user/task.validate";
router.get("/", taskController.index);
router.get("/detail/:id", taskController.detail);
router.patch("/change-status/:id", taskController.changeStatus);
router.post("/change-multi", taskController.changeMulti);
router.post("/create", validateCreateTask, taskController.create);
router.patch("/edit/:id", validateEditTask, taskController.edit);
export const taskRoutes: Router = router;
