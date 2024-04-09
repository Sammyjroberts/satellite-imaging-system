import axios from "axios";
import { SatelliteImageManager, SatelliteImagingRequestStatus } from "utils";
import path from "path";
import AdmZip from "adm-zip";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import DB from "db";
import { logger } from "observability";
const db = DB.getInstance().getDb();

class ImageDownloadHandler {
  // in reality i would use s3, but this is fine for this exercise
  static get ROOT_IMAGE_PATH() {
    if (process.env.NODE_ENV === "localdev") {
      return "/tmp/satellite-images-planetside/";
    } else {
      return "/data/satellite-images-planetside/";
    }
  }
  /**
   * Downloads an archive of satellite images, extracts them, stores them locally,
   * and updates the database with their paths.
   *
   * @param {string} downloadUrl - The URL to download the image archive from.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  static async downloadAndProcessImages() {
    try {
      const response = await axios.get(
        `${process.env.SATELLITE_URL}/api/satellite-image-results/`,
        {
          responseType: "arraybuffer",
        }
      );
      if (response.status === 204) {
        return logger.info("No images found");
      }
      const zipBuffer = response.data;

      const zip = new AdmZip(zipBuffer);
      const extractPath = path.join(
        ImageDownloadHandler.ROOT_IMAGE_PATH,
        new Date().toISOString(),
        uuidv4()
      );

      await fs.mkdir(extractPath, { recursive: true });

      // Note: extractAllToAsync does not return a promise, handling needs to be done within the callback
      zip.extractAllTo(extractPath, true);

      // Process extracted files
      const fileEntries = zip.getEntries();
      const results = [];
      const requestIdsToUpdate = [];
      for (let entry of fileEntries) {
        if (!entry.isDirectory) {
          const url = path.join(extractPath, entry.entryName);
          const { satelliteID, satelliteImagingRequestID } =
            SatelliteImageManager.parseFileName(entry.entryName);
          if (satelliteID && satelliteImagingRequestID) {
            results.push({
              url,
              satellite_id: satelliteID,
              satellite_imaging_request_id: satelliteImagingRequestID,
            });
            requestIdsToUpdate.push(satelliteImagingRequestID);
          } else {
            console.error(
              `Could not parse file name for IDs: ${entry.entryName}`
            );
          }
        }
      }
      // Insert records for processed images
      await db("satellite_image").insert(results);

      // Bulk update satellite imaging requests as completed
      await db("satellite_imaging_request")
        .whereIn("id", requestIdsToUpdate)
        .update({ status: SatelliteImagingRequestStatus.COMPLETED });
    } catch (error) {
      console.error("Failed to download and process images:", error);
      throw error;
    }
  }
}

export default ImageDownloadHandler;
