import pino from "pino";
/**
 * Logger instance
 * @type {import('pino').Logger}
 */
let logger = undefined;

if (process.env.NODE_ENV === "localdev") {
  logger = pino({
    transport: {
      target: "pino-pretty",
    },
  });
} else {
  logger = pino();
}

export default logger;
