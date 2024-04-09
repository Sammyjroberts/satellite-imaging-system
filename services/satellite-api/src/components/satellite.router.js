import express from "express";
import SatelliteController from "./satellite.controller.js";

const router = express.Router();

router.get(
  "/satellite-image-results",
  SatelliteController.getUndownloadedSatelliteZip
);

router.post(
  "/satellite-imaging-job",
  SatelliteController.createSatelliteImagingJob
);

export default router;
