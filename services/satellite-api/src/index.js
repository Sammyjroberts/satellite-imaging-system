import express from "express";
import dotenv from "dotenv";
import DB from "db";
import { asCallback } from "utils";
import path from "path";
import fs from "fs";

const db = DB.getInstance().getDb();
dotenv.config();

const app = express();
const port = process.env.PORT;

// Middleware
app.use(express.json());

/**
 * Endpoint to retrieve a satellite image result by satelliteImageRequestID.
 *
 * @route GET /satellite-image-results/:satelliteImageRequestID
 * @param {string} satelliteImageRequestID - The ID of the satellite image request.
 * @returns {Object} The satellite image request object.
 */
app.get(
  "/satellite-image-results/:satelliteImageRequestID",
  async (req, res, next) => {
    const { satelliteImageRequestID } = req.params;
    const [err, satelliteImageRequest] = await db(
      "satellite_imaging_result"
    ).where({
      satellite_imaging_request_id: satelliteImageRequestID,
    });

    if (err) {
      return next(err);
    }

    if (!satelliteImageRequest || !satelliteImageRequest.path) {
      return res.status(404).send("Image not found or path is undefined");
    }

    const filePath = path.resolve(satelliteImageRequest.path);

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("File does not exist:", filePath);
        return res.status(404).send("File not found");
      }

      // Set appropriate content type, e.g., "image/jpeg"
      // You might need to adjust this based on the actual image format
      res.setHeader("Content-Type", "image/jpeg");

      // Stream the file
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });

    return res.json(satelliteImageRequest);
  }
);

/**
 * Endpoint to create a satellite imaging job.
 *
 * @route POST /satellite_imaging_job
 * @param {Object} req.body - The request body containing satelliteID and satellite_imaging_requestID.
 * @returns {void} 201 status code if the job is created successfully.
 */
app.post("/satellite_imaging_job", async (req, res, next) => {
  const satelliteImageRequest = {
    satellite_id: req.body.satelliteID,
    satellite_imaging_request_id: req.body.satellite_imaging_requestID,
  };
  // first see if there is already a job with this request id
  const [err_existing, existingJob] = await db("satellite_imaging_job").where({
    satellite_imaging_request_id:
      satelliteImageRequest.satellite_imaging_request_id,
  });
  if (err_existing) {
    return next(err_existing);
  }
  if (existingJob.length > 0) {
    return res.status(200).send({ message: "Job already exists" });
  }
  // Create a satellite imaging request
  const [err] = await asCallback(
    db("satellite_imaging_job").insert(satelliteImageRequest)
  );
  if (err) {
    return next(err);
  }

  // Return 201 status code
  return res.status(201).send({ message: "Job created" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
