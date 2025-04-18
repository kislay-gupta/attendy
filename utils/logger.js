import winston from "winston";
const { createLogger, format, transports } = winston;
const { combine, timestamp, json, colorize, simple } = format;

const consoleLogFormat = format.combine(
  colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({
      filename: "app.log",

      format: combine(timestamp(), json()),
    }),
  ],
});
