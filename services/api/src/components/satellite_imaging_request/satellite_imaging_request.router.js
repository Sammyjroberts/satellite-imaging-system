import express from "express";
import SatelliteImagingRequestController from "./satellite_imaging_request.controller.js";

const router = express.Router();

// Define your routes here
router.post(
  "/",
  SatelliteImagingRequestController.createSatelliteImagingRequest
);

export default router;
