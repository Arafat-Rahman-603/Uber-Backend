import express from "express";
import {getDistanceTimeController, searchLocationController, getCoordinatesController, getDistanceTimeCoordsController} from "../controllers/map.controller.js";

const mapRouter = express.Router();

mapRouter.get("/distance-time", getDistanceTimeController);
mapRouter.get("/search", searchLocationController);
mapRouter.get("/get-coordinates", getCoordinatesController);
mapRouter.get("/distance-coordinates", getDistanceTimeCoordsController);

export default mapRouter;
