import express from "express";
import dotenv from "dotenv";
import DB from "db";
import pino from "pino-http";
import satelliteRouter from "./components/satellite.router.js";
import { logger } from "observability";
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(pino());
app.use(express.json());

app.use("/api", satelliteRouter); // using a single component as there are only two routes
// Start the server
app.listen(port, async () => {
  await DB.getInstance().initDB(); // Doing this as I don't want to setup migration for docker
  logger.info(`Server is running on port ${port}`);
});
