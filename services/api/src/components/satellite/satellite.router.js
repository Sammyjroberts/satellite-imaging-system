import express from "express";
import SatelliteController from "./satellite.controller.js";

const router = express.Router();

// Define your routes here
router.post("/", SatelliteController.createSatellite);
router.get("/:satelliteID/images", SatelliteController.getImagesBySatelliteID);

export default router;
