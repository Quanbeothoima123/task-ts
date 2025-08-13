import { taskRoutes } from "./task.route";
import { userRoutes } from "./user.route";
import { Express } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware";
const mainV1Routes = (app: Express) => {
  const version: String = "/api/v1";
  app.use(version + "/tasks", requireAuth, taskRoutes);
  app.use(version + "/user", userRoutes);
};
export default mainV1Routes;
