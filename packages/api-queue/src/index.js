import amqp from "amqplib";
import { logger } from "observability";
export const queues = {
  IMAGE_PROCESSING_REQUEST_QUEUE: "image-processing-request-queue",
  IMAGE_PROCESSING_REQUEST_DLX_QUEUE: "image-processing-request-dlx-queue",
};

export const IMAGE_PROCESSING_REQUEST_QUEUE_DELIVERY_LIMIT = 10;

/**
 * RabbitMQ connection instance.
 * @type {amqp.Connection}
 */
let rabbitMQConnection = null;
/**
 * RabbitMQ channel instance.
 * @type {amqp.Channel}
 */
let rabbitMQChannel = null;

/**
 * Initializes the RabbitMQ client and establishes a connection.
 * @returns {Promise<amqp.Channel>} A promise that resolves to the RabbitMQ channel.
 */
export async function initRabbitMQClient() {
  if (rabbitMQConnection) {
    return rabbitMQChannel;
  }

  try {
    rabbitMQConnection = await amqp.connect(process.env.RABBITMQ_URL);

    rabbitMQConnection.on("close", (err) => {
      if (err) {
        logger.error("RabbitMQ connection closed with error", { err });
      } else {
        logger.info("RabbitMQ connection closed");
      }
      rabbitMQConnection = null;
      rabbitMQChannel = null;
    });

    rabbitMQConnection.on("error", (err) => {
      logger.error(`RabbitMQ errored`, { err });
      rabbitMQConnection = null;
      rabbitMQChannel = null;
    });

    rabbitMQChannel = await rabbitMQConnection.createChannel();

    rabbitMQChannel.on("close", () => {
      logger.info("RabbitMQ channel closed");
      rabbitMQChannel = null;
    });
    rabbitMQChannel.on("error", (err) => {
      logger.error(`RabbitMQ channel errored`, { err });
      rabbitMQChannel = null;
    });

    await assertQueues(rabbitMQChannel);

    return rabbitMQChannel;
  } catch (error) {
    logger.error("Error initializing RabbitMQ client", { error });
    throw error;
  }
}

/**
 * Returns the RabbitMQ channel if it exists, otherwise initializes a new client and channel.
 * @returns {Promise<amqp.Channel>} A promise that resolves to the RabbitMQ channel.
 */
export async function getRabbitMQChannel() {
  if (!rabbitMQChannel) {
    await initRabbitMQClient();
  }
  return rabbitMQChannel;
}
/**
 *
 * @param {amqp.Channel} channel
 */
export async function assertQueues(channel) {
  await channel.assertQueue(queues.IMAGE_PROCESSING_REQUEST_QUEUE, {
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": queues.IMAGE_PROCESSING_REQUEST_DLX_QUEUE,
      "x-durable": true,
      "x-delivery-limit": IMAGE_PROCESSING_REQUEST_QUEUE_DELIVERY_LIMIT,
      "x-queue-type": "quorum",
    },
  });
  await channel.assertQueue(queues.IMAGE_PROCESSING_REQUEST_DLX_QUEUE, {
    durable: true,
  });
}
