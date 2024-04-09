import {
  getRabbitMQChannel,
  queues,
  IMAGE_PROCESSING_REQUEST_QUEUE_DELIVERY_LIMIT,
} from "queue";
import SatelliteCommunicator from "../communication_utils/SatelliteCommunicator.js";
import { logger } from "observability";
import { SatelliteImagingRequestStatus, asCallback } from "utils";
import axios from "axios";
import DB from "db";
import ImageDownloadHandler from "./ImageDownloadHandler.js";
const db = DB.getInstance().getDb();

async function consumeMessages() {
  const communicator = new SatelliteCommunicator(300000, 60000);
  let consumerTag = undefined;

  const channel = await getRabbitMQChannel();
  // Limit to consuming 1 message at a time, as communication with the "satellite" is slow
  await channel.prefetch(1);

  const checkAndConsume = async () => {
    const canReachSatellite = communicator.tryCommunicate();
    if (canReachSatellite && !consumerTag) {
      logger.info("We can communicate with the satellite. Starting consumer.", {
        connectionAttemptTime: new Date().toISOString(),
      });
      // download all images asynchronously this will happen once per window for simplicity
      void ImageDownloadHandler.downloadAndProcessImages()
        .then(() => {
          logger.info("Downloaded and processed images");
        })
        .catch((err) => {
          logger.error({ msg: "Failed to download and process images", err });
        });

      // Start consuming messages
      const { consumerTag: newConsumerTag } = await channel.consume(
        queues.IMAGE_PROCESSING_REQUEST_QUEUE,
        async (message) => {
          let messageContent;
          try {
            // Process the message here
            logger.info({ msg: "Recieved message", message });
            messageContent = JSON.parse(message.content.toString());

            // send request to satellite
            await axios.post(
              process.env.SATELLITE_URL + "/api/satellite-imaging-job",
              {
                satelliteID: messageContent.satelliteID,
                satelliteImagingRequestID: messageContent.id,
              }
            );

            // update status in db
            await db("satellite_imaging_request")
              .where({
                id: messageContent.id,
              })
              .update({
                status: SatelliteImagingRequestStatus.IN_PROGRESS,
              });

            // acknowledge the message
            channel.ack(message);
            logger.info("Message processed successfully");
          } catch (err) {
            logger.error({ msg: "Error processing message", err });
            // If processing fails, check the number of retries
            const deathHeader = message.properties.headers["x-death"];
            const retryCount =
              deathHeader && deathHeader.length > 0 ? deathHeader[0].count : 0;

            // manual testing mostly for logging and idempotent operations
            if (retryCount < IMAGE_PROCESSING_REQUEST_QUEUE_DELIVERY_LIMIT) {
              // Reject the message with requeue set to true
              logger.warn(
                "Message processing failed due to reaching max retries",
                {
                  messageContent,
                  err,
                  retryCount,
                }
              );
              channel.nack(message, false, true);
            } else {
              // If maximum retries reached, acknowledge the message to remove it from the queue
              channel.nack(message, false, false);
              // Optionally, you can log the failed message or perform other error handling
              if (messageContent) {
                await db("satellite_imaging_request")
                  .where({
                    id: messageContent.satellite_imaging_requestID,
                  })
                  .update({
                    status: SatelliteImagingRequestStatus.FAILED,
                  });
              } else {
                logger.error("Failed to process message", { message });
              }
            }
          }
        }
      );
      consumerTag = newConsumerTag; // Store the consumerTag to cancel this consumer later
    } else if (!canReachSatellite && consumerTag) {
      logger.info(
        "We can't communicate with the satellite. Stopping consumer.",
        { connectionAttemptTime: new Date().toISOString() }
      );
      // Stop consuming messages
      await channel.cancel(consumerTag);
      consumerTag = undefined; // Clear the consumerTag as it's no longer valid
    }
  };
  // poll to check if we can communicate with the satellite
  // Check communication status periodically
  // Adjust the interval as needed. Here, it's set to check every 10 seconds.
  setInterval(checkAndConsume, 1000);
}
// actually run the consumer
(async () => {
  const fileURL = new URL(import.meta.url);
  const mainURL = new URL(`file://${process.argv[1]}`);
  if (fileURL.href === mainURL.href) {
    await DB.getInstance().initDB(); // Simple solution to initilizing the db, as I want to limit busywork
    await consumeMessages();
  }
})();
