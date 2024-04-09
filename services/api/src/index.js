import express from "express";
import satelliteRouter from "./components/satellite/satellite.router.js";
import satelliteImagingRequestRouter from "./components/satellite_imaging_request/satellite_imaging_request.router.js";
const app = express();
const port = 3000;

const apiRouter = express.Router();

// set up sub routes
apiRouter.use("/satellite", satelliteRouter);
apiRouter.use("/satellite-imaging-requests", satelliteImagingRequestRouter);

// set up middleware
app.use(express.json());

// hook up the router
app.use("/api", apiRouter);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export const closeServer = () => {
  server.close();
};

export default app;
