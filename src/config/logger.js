import winston from "winston";

// this same logger is used for other levels like error, warn, info, debug and etc.
export const logger = winston.createLogger({
  level: "info", // Set the default logging level to 'info'
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps to logs
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`; // Customize log format
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }), // Log to the console
    new winston.transports.File({ filename: "app.log" }), // Log to a file named 'app.log'
  ],
});
