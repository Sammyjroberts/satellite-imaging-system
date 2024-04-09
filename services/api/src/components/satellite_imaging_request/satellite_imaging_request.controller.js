import { asCallback, SatelliteImagingRequestStatus } from "utils";
import SatelliteImagingRequestModel from "./satellite_imaging_request.model.js";

class SatelliteImagingRequestController {
  static async createSatelliteImagingRequest(req, res, next) {
    const satelliteImagingRequestBody = {
      satellite_id: req.body.satelliteID,
      status: SatelliteImagingRequestStatus.PENDING,
    };
    const [err, satelliteImagingRequest] = await asCallback(
      SatelliteImagingRequestModel.createSatelliteImagingRequest(
        satelliteImagingRequestBody
      )
    );
    if (err) {
      return next(err);
    }
    return res.status(201).json(satelliteImagingRequest);
  }
}

export default SatelliteImagingRequestController;
