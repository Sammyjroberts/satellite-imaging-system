import DB from "db";
import { getRabbitMQChannel, queues } from "queue";
const db = DB.getInstance().getDb();

class SatelliteImagingRequestModel {
  static async createSatelliteImagingRequest(satelliteImagingRequest) {
    return db.transaction(async (trx) => {
      const result = await trx("satellite_imaging_request")
        .insert(satelliteImagingRequest)
        .returning("*");

      const formattedResult = {
        id: result[0].id,
        satelliteID: result[0].satellite_id,
        status: result[0].status,
        createdAt: result[0].created_at,
        updatedAt: result[0].updated_at,
      };

      const channel = await getRabbitMQChannel();

      channel.sendToQueue(
        queues.IMAGE_PROCESSING_REQUEST_QUEUE,
        Buffer.from(
          JSON.stringify({
            id: formattedResult.id,
            satelliteID: formattedResult.satelliteID,
          })
        )
      );

      // raw query more efficent
      return {
        id: result[0].id,
        satelliteID: result[0].satellite_id,
        status: result[0].status,
        createdAt: result[0].created_at,
        updatedAt: result[0].updated_at,
      };
    });
  }
}

export default SatelliteImagingRequestModel;
