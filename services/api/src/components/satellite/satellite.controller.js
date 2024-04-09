import { asCallback } from "utils";
import SatelliteModel from "./satellite.model.js";
import APIError from "utils/src/APIError.js";

class SatelliteController {
  /**
   * Create a new satellite.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>}
   */
  static async createSatellite(req, res, next) {
    // Extract the satellite name from the request body
    const satelliteBody = {
      name: req.body.name,
    };

    // Call the createSatellite method of the SatelliteModel
    const [err, satellite] = await asCallback(
      SatelliteModel.createSatellite(satelliteBody)
    );

    // If an error occurred, pass it to the error handling middleware
    if (err) {
      return next(err);
    }

    // Return the created satellite with a 201 status code
    return res.status(201).json(satellite);
  }

  /**
   * Get images by satellite ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>}
   */
  static async getImagesBySatelliteID(req, res, next) {
    // Extract the satellite ID from the request parameters
    const satelliteID = req.params.satelliteID;

    // Call the getImages method of the SatelliteModel with the satellite ID
    const [err, images] = await asCallback(
      SatelliteModel.getImages(satelliteID)
    );

    // If an error occurred, pass it to the error handling middleware
    if (err) {
      return next(err);
    }

    // If no images are found for the given satellite ID, return a 404 error
    if (!images || images.length === 0) {
      return next(
        new APIError(`No images found for satellite: ${satelliteID}`, 404),
        "Sorry, no images found for this satellite."
      );
    }

    // Return the images with a 200 status code
    return res.status(200).json(images);
  }
}

export default SatelliteController;
