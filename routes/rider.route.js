import express from "express";
import {
  registerRiderValidation,
  loginRiderValidation,
} from "../validation/rider.valodation.js";
import {
  registerRider,
  loginRider,
  logout,
  getProfile,
  getRiderStats,
  sendOtp,
} from "../controllers/rider.controller.js";
import { authMiddlewareRider } from "../middlewares/auth.middleware.js";

const riderRouter = express.Router();

riderRouter.post("/send-otp", sendOtp);
riderRouter.post("/register", registerRiderValidation, registerRider);
riderRouter.post("/login", loginRiderValidation, loginRider);
riderRouter.get("/logout", logout);
riderRouter.get("/profile", authMiddlewareRider, getProfile);
riderRouter.get("/stats", authMiddlewareRider, getRiderStats);

export default riderRouter;
