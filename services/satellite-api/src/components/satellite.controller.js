import DB from "db";
import SatelliteModel from "./satellite.model.js";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { asCallback } from "utils";

const db = DB.getInstance().getDb();

class SatelliteController {
  /**
   * Retrieves undownloaded satellite images, packages them into a ZIP archive,
   * and sends the archive as a response. Marks images as downloaded after successful transmission.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Next middleware function.
   * @returns {Promise<void>} A promise that resolves with no return value.
   */
  static async getUndownloadedSatelliteZip(req, res, next) {
    try {
      // Start a transaction
      const trx = await db.transaction();

      const satelliteImageRequests =
        await SatelliteModel.getUnDownloadedSatelliteImagingResults({ trx });

      if (!satelliteImageRequests || satelliteImageRequests.length === 0) {
        await trx.rollback(); // No need to proceed, so rollback
        return res.status(204).send("No images found");
      }

      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=satellite_images.zip"
      );

      const archive = archiver("zip", {
        zlib: { level: 9 }, // Sets the compression level.
      });

      archive.on("error", async (err) => {
        console.error("Error creating archive:", err);
        await trx.rollback(); // Rollback on archive error
        res.status(500).send("Error creating archive");
      });

      archive.pipe(res);

      for (const satelliteImageRequest of satelliteImageRequests) {
        if (satelliteImageRequest.path) {
          const filePath = path.resolve(satelliteImageRequest.path);
          try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            archive.file(filePath, { name: path.basename(filePath) });
          } catch (err) {
            console.error("File does not exist:", filePath);
            // Log missing file but don't interrupt the process
          }
        }
      }

      archive.finalize();

      archive.on("finish", async () => {
        // Update all involved records to 'downloaded: true' after successful archive creation
        try {
          const idsToUpdate = satelliteImageRequests.map(
            (request) => request.id
          );
          await SatelliteModel.setSatelliteImagingResultsDownloaded({
            idsToUpdate,
            trx,
          });
          await trx.commit(); // Commit the transaction
          // TODO: clean up all the downloaded files, removing them from the file system
        } catch (updateError) {
          console.error("Error updating download status:", updateError);
          await trx.rollback(); // Rollback if updating fails
        }
      });
    } catch (err) {
      console.error("Error retrieving satellite image requests:", err);
      return next(err); // Pass error to express error handler
    }
  }

  /**
   * Creates a new satellite imaging job and sends a corresponding message to a RabbitMQ queue.
   * Checks for the existence of a job with the same request ID to avoid duplicates.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Next middleware function.
   * @returns {Promise<void>} A promise that resolves with no return value.
   */
  static async createSatelliteImagingJob(req, res, next) {
    const [err] = await asCallback(
      db.transaction(async (trx) => {
        const satelliteImageRequest = {
          satellite_id: req.body.satelliteID,
          satellite_imaging_request_id: req.body.satelliteImagingRequestID,
        };
        // first see if there is already a job with this request id
        const [errExisting, existingJob] = await asCallback(
          SatelliteModel.getSatelliteJob({
            id: satelliteImageRequest.satellite_imaging_request_id,
            trx,
          })
        );

        if (errExisting) {
          return next(errExisting);
        }

        if (existingJob.length > 0) {
          return res.status(200).send({ message: "Job already exists" });
        }

        // Create a satellite imaging request
        const [err] = await asCallback(
          SatelliteModel.createSatelliteImageRequest({
            satelliteImageRequest,
            trx,
          })
        );

        if (err) {
          return next(err);
        }
        const [jobErr] = await asCallback(
          SatelliteModel.createSatelliteJob({
            satelliteJob: satelliteImageRequest,
          })
        );

        if (jobErr) {
          return next(jobErr);
        }

        // Return 201 status code
        return res.status(201).send({ message: "Job created" });
      })
    );
    if (err) {
      return next(err);
    }
  }
}

export default SatelliteController;
