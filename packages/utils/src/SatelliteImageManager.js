import { v4 as uuidv4 } from "uuid"; // Corrected import for uuid
import path from "path";
import fs from "fs/promises";
import fsRegular from "fs";
import axios from "axios";
class SatelliteImageManager {
  /**
   * Gets the root path where satellite images are stored.
   * @returns {string} The root image path.
   */
  static get ROOT_IMAGE_PATH() {
    if (process.env.NODE_ENV === "localdev") {
      return "/tmp/satellite-images/";
    }
    return "/data/satellite-images/";
  }

  /**
   * Asynchronously saves an image buffer under a generated path based on the satellite and request IDs.
   * @param {string} satelliteImagingRequestID - The imaging request ID.
   * @param {string} satelliteID - The satellite ID.
   * @param {Buffer} imageBuffer - The image data to save.
   * @returns {Promise<string>} The path where the image was saved.
   */
  static async saveImage(satelliteImagingRequestID, satelliteID, imageBuffer) {
    console.log({
      msg: "Saving image",
      satelliteImagingRequestID,
      satelliteID,
    });
    const imagePath = SatelliteImageManager.createImagePath(
      satelliteImagingRequestID,
      satelliteID
    );

    const dirPath = path.dirname(imagePath);

    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    await fs.writeFile(imagePath, imageBuffer);

    return imagePath;
  }

  /**
   * Gets a readable file stream for the specified image path.
   * @param {string} imagePath - The path to the image file.
   * @returns {Promise<fs.ReadStream>} A promise that resolves to the file stream.
   */
  static async getFileStream(imagePath) {
    try {
      await fs.access(imagePath, fsRegular.constants.F_OK);
      return fsRegular.createReadStream(imagePath);
    } catch (err) {
      console.error("File does not exist:", imagePath);
      throw new Error("File not found");
    }
  }

  /**
   * Generates a unique file path for an image based on satellite and request IDs.
   * @param {string} satelliteImagingRequestID - The imaging request ID.
   * @param {string} satelliteID - The satellite ID.
   * @returns {string} The generated file path for the image.
   */
  static createImagePath(satelliteImagingRequestID, satelliteID) {
    return path.join(
      SatelliteImageManager.ROOT_IMAGE_PATH,
      satelliteID.toString(),
      `${satelliteID}_${satelliteImagingRequestID}_${uuidv4()}.png`
    );
  }
  /**
   * Asynchronously takes a picture by fetching a placeholder image from placehold.co.
   * The image dimensions are randomly generated within a 600x600 range.
   *
   * @returns {Promise<Buffer>} A promise that resolves with the image data as a Buffer.
   */
  static async takePicture() {
    // Generate random dimensions for the image
    const imageX = Math.floor(Math.random() * 600);
    const imageY = Math.floor(Math.random() * 600);

    // Construct the URL with the random dimensions
    const imgURL = `https://placehold.co/${imageX}x${imageY}/png`;

    try {
      // Fetch the image using axios with responseType set to 'arraybuffer'
      // to handle binary data properly
      const response = await axios.get(imgURL, {
        responseType: "arraybuffer",
      });

      // Convert the binary data to a Buffer
      const imageBuffer = Buffer.from(response.data, "binary");

      return imageBuffer;
    } catch (error) {
      console.error("Failed to fetch image:", error);
      throw new Error("Failed to take picture");
    }
  }
  /**
   * Extracts the satelliteID and satelliteImagingRequestID from a given file name.
   * The file name is expected to be in the format: "satelliteID_satelliteImagingRequestID_uuid.png".
   *
   * @param {string} fileName - The name of the file.
   * @returns {{ satelliteID: string, satelliteImagingRequestID: string }} An object containing the satelliteID and satelliteImagingRequestID, or null if the format does not match.
   */
  static parseFileName(fileName) {
    const pattern = /^(.+)_(.+)_[\w-]+\.png$/;
    const match = fileName.match(pattern);

    if (match) {
      return {
        satelliteID: match[1],
        satelliteImagingRequestID: match[2],
      };
    } else {
      console.error("File name format does not match:", fileName);
      return null;
    }
  }
}

export default SatelliteImageManager;
