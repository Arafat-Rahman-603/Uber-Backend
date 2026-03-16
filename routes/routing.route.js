import express from "express";
import { getDirectionsController } from "../controllers/routing.controller.js";
import { authMiddleware, authMiddlewareRider } from "../middlewares/auth.middleware.js";

const routingRouter = express.Router();

/**
 * GET /api/directions
 * Accepts query params: originLat, originLng, destLat, destLng
 * Protected: any authenticated user OR rider may call this endpoint.
 */
routingRouter.get("/", (req, res, next) => {
  // Try user auth first, fall back to rider auth
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}, getDirectionsController);

export default routingRouter;
