import { Router } from "express";
const router: Router = Router();
import {
  validateRegisterUser,
  validateLogin,
  validateForgotPassword,
  validateOtpPassword,
  validateResetPassword,
} from "../../../validates/user/user.validate";
import * as userController from "../controller/user.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
router.post("/register", validateRegisterUser, userController.register);
router.post("/auth/:userId", userController.auth);
router.post("/login", validateLogin, userController.login);
router.post(
  "/password/forgot",
  validateForgotPassword,
  userController.forgotPassword
);
router.post("/password/otp", validateOtpPassword, userController.otpPassword);
router.post(
  "/password/reset",
  validateResetPassword,
  userController.resetPassword
);
router.post("/detail", requireAuth, userController.detail);
export const userRoutes: Router = router;
