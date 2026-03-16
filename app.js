import express from "express";
import cors from "cors";
import mapRouter from "./routes/map.route.js";
import userRouter from "./routes/user.route.js";
import riderRouter from "./routes/rider.route.js";
import rideRouter from "./routes/ride.route.js";
import routingRouter from "./routes/routing.route.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://m743f7fs-5173.asse.devtunnels.ms"
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => res.send("<h1>Noor</h1>"));
app.use("/api/users", userRouter);
app.use("/api/riders", riderRouter);
app.use("/api/map", mapRouter);
app.use("/api/rides", rideRouter);
app.use("/api/directions", routingRouter);

export default app;
