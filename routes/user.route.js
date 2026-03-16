import express from "express";
import { registerUser, loginUser, getUserProfile, logoutUser} from "../controllers/user.controller.js";
import { registerUserValidation, loginUserValidation } from "../validation/user.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register",registerUserValidation, registerUser);
userRouter.post("/login", loginUserValidation, loginUser);
userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.get("/logout", authMiddleware, logoutUser);

export default userRouter;