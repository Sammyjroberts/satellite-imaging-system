import express from "express";
import satelliteRouter from "./components/satellite/satellite.router.js";
import satelliteImagingRequestRouter from "./components/satellite_imaging_request/satellite_imaging_request.router.js";
import DB from "db";
import pino from "pino-http";
import logger from "../../../packages/observability/src/logger.js";
const app = express();
const port = 3000;

const apiRouter = express.Router();

// set up sub routes
apiRouter.use("/satellite", satelliteRouter);
apiRouter.use("/satellite-imaging-requests", satelliteImagingRequestRouter);

// set up middleware
app.use(pino());
app.use(express.json());

// hook up the router
app.use("/api", apiRouter);

const server = app.listen(port, async () => {
  await DB.getInstance().initDB(); // Doing this as I don't want to setup migration for docker
  logger.info(`Server is running on port ${port}`);
});

export const closeServer = () => {
  server.close();
};

export default app;
