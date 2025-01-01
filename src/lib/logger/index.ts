import pino from "pino";

const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export { logger };
