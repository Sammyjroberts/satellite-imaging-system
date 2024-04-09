import DB from "db";
const db = DB.getInstance().getDb();
import { getRabbitMQChannel, queues } from "queue";

/**
 * Model handling satellite image processing and database interactions.
 */
class SatelliteModel {
  /**
   * Retrieves a list of satellite imaging results that haven't been downloaded yet.
   * @param {Object} options - Options object.
   * @param {Object} [options.trx=db] - Optional transaction object.
   * @returns {Promise<Array>} A promise that resolves to an array of undownloaded satellite imaging results.
   */
  static async getUnDownloadedSatelliteImagingResults({ trx = db }) {
    const satelliteImageRequests = await trx("satellite_imaging_result").where({
      downloaded: false,
    });
    return satelliteImageRequests;
  }

  /**
   * Marks a list of satellite imaging results as downloaded.
   * @param {Object} options - Options object containing idsToUpdate and an optional transaction object.
   * @param {Array<number>} options.idsToUpdate - Array of IDs to update.
   * @param {Object} [options.trx=db] - Optional transaction object.
   */
  static async setSatelliteImagingResultsDownloaded({ idsToUpdate, trx = db }) {
    await trx("satellite_imaging_result")
      .whereIn("id", idsToUpdate)
      .update({ downloaded: true });
  }

  /**
   * Retrieves a satellite imaging job by its request ID.
   * @param {Object} options - Options object.
   * @param {number} options.id - Satellite imaging request ID to search for.
   * @param {Object} [options.trx=db] - Optional transaction object.
   * @returns {Promise<Object>} A promise that resolves to the satellite imaging job if found.
   */
  static async getSatelliteJob({ id, trx = db }) {
    const job = await trx("satellite_imaging_job").select().where({
      satellite_imaging_request_id: id,
    });
    return job;
  }

  /**
   * Creates a new satellite imaging request in the database.
   * @param {Object} options - Options object.
   * @param {Object} options.satelliteImageRequest - Satellite image request data to be inserted.
   * @param {Object} [options.trx=db] - Optional transaction object.
   */
  static async createSatelliteImageRequest({
    satelliteImageRequest,
    trx = db,
  }) {
    await trx("satellite_imaging_job").insert(satelliteImageRequest);
  }

  /**
   * Publishes a satellite imaging job to the RabbitMQ queue for processing.
   * @param {Object} satelliteJob - Satellite job data to be published.
   */
  static async createSatelliteJob({ satelliteJob }) {
    const channel = await getRabbitMQChannel(); // Ensure 'await' is used to wait for the channel
    channel.sendToQueue(
      queues.IMAGING_JOB_QUEUE,
      Buffer.from(
        JSON.stringify({
          satelliteImagingRequestID: satelliteJob.satellite_imaging_request_id,
          satelliteID: satelliteJob.satellite_id,
        })
      )
    );
  }
}

export default SatelliteModel;
