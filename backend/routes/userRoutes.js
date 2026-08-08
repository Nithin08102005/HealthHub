import express from "express";
import {
  userRegister,
  userLogin,
  getUserDetails,
  userUpdate,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { aiSymptomCheck } from "../controllers/aiController.js";
import authUser from "../middleware/authUser.js";
import multer from "multer";
const userRouter = express.Router();
const upload = multer({ dest: "uploads/" });
userRouter.post("/register",upload.single("file"), userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/ai-symptom-check", authUser, aiSymptomCheck);
userRouter.get("/getUserDetails", authUser, getUserDetails);
userRouter.post(
  "/updateUserDetails",
  authUser,
  upload.single("file"),
  userUpdate
);
export default userRouter;
