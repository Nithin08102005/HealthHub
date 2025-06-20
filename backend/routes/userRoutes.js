import express from "express";
import {
  userRegister,
  userLogin,
  getUserDetails,
  userUpdate,
} from "../controllers/userController.js";
import authUser from "../middleware/authUser.js";
import multer from "multer";
const userRouter = express.Router();
const upload = multer({ dest: "uploads/" });
userRouter.post("/register",upload.single("file"), userRegister);
userRouter.post("/login", userLogin);
userRouter.get("/getUserDetails", authUser, getUserDetails);
userRouter.post(
  "/updateUserDetails",
  authUser,
  upload.single("file"),
  userUpdate
);
export default userRouter;
