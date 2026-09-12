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
import { generateAgoraToken } from "../controllers/videoController.js";
import { createPrescription, getPrescriptionByAppointment } from "../controllers/prescriptionController.js";
import { getChatMessages } from "../controllers/chatController.js";
import authUser from "../middleware/authUser.js";
import multer from "multer";
const userRouter = express.Router();
const upload = multer({ dest: "uploads/" });
userRouter.post(
  "/register",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "document", maxCount: 1 }
  ]),
  userRegister
);
userRouter.post("/login", userLogin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/ai-symptom-check", authUser, aiSymptomCheck);
userRouter.post("/agora-token", authUser, generateAgoraToken);
userRouter.post("/create-prescription", authUser, createPrescription);
userRouter.post("/get-prescription", authUser, getPrescriptionByAppointment);
userRouter.post("/get-chat-messages", authUser, getChatMessages);
userRouter.get("/getUserDetails", authUser, getUserDetails);
userRouter.post(
  "/updateUserDetails",
  authUser,
  upload.single("file"),
  userUpdate
);
export default userRouter;
