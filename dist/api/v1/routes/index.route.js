"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_route_1 = require("./task.route");
const user_route_1 = require("./user.route");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const mainV1Routes = (app) => {
    const version = "/api/v1";
    app.use(version + "/tasks", auth_middleware_1.requireAuth, task_route_1.taskRoutes);
    app.use(version + "/user", user_route_1.userRoutes);
};
exports.default = mainV1Routes;
