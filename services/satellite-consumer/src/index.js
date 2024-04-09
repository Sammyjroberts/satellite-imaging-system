import { getRabbitMQChannel, queues } from "queue";
import { logger } from "observability";
import DB from "db";
import { SatelliteImageManager } from "utils";
const db = DB.getInstance().getDb();

async function consumeMessages() {
  const channel = await getRabbitMQChannel();
  logger.info("Starting Consumer");
  await channel.consume(queues.IMAGING_JOB_QUEUE, async (message) => {
    let messageContent;
    try {
      // Process the message here
      logger.info({ msg: "Received message" });
      messageContent = JSON.parse(message.content.toString());
      console.log(messageContent);
      const imageBuffer = await SatelliteImageManager.takePicture();
      // save file
      const filePath = await SatelliteImageManager.saveImage(
        messageContent.satelliteImagingRequestID,
        messageContent.satelliteID,
        imageBuffer
      );
      // update status in db
      await db("satellite_imaging_result").insert({
        satellite_imaging_request_id: messageContent.satelliteImagingRequestID,
        path: filePath,
      });
      // acknowledge the message
      logger.info("Message processed successfully");
      channel.ack(message);
    } catch (err) {
      logger.error({ msg: "Error processing message", err });
      channel.nack(message, false, true); // always requeue for now
    }
  });
}
// actually run the consumer
(async () => {
  const fileURL = new URL(import.meta.url);
  const mainURL = new URL(`file://${process.argv[1]}`);
  if (fileURL.href === mainURL.href) {
    await DB.getInstance().initDB(); // Doing this as I don't want to setup migration for docker
    await consumeMessages();
  }
})();
