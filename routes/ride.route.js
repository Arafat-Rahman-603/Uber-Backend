import express from "express";
import { authMiddleware, authMiddlewareRider } from "../middlewares/auth.middleware.js";
import { createRideController, confirmRideController, acceptRideController, startRideController, endRideController, payRideController } from "../controllers/ride.controller.js";

const rideRouter = express.Router();

rideRouter.post("/create", authMiddleware, createRideController);
rideRouter.post("/confirm", authMiddleware, confirmRideController);
rideRouter.post("/accept", authMiddlewareRider, acceptRideController);
rideRouter.post("/start", authMiddlewareRider, startRideController);
rideRouter.post("/end", authMiddlewareRider, endRideController);
rideRouter.post("/pay", authMiddleware, payRideController);

export default rideRouter;
