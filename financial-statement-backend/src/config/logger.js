// logger.js
const winston = require('winston');
const { combine, errors, colorize, splat, printf, timestamp, json, uncolorize } = winston.format;

const devPrintf = printf((info) => {
  const { level, message, stack, ...rest } = info;
  const base = `${level}: ${stack || message || ''}`;
  const restStr = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
  return `${base}${restStr}`;
});

const productionFormat = combine(errors({ stack: true }), uncolorize(), timestamp(), splat(), json());
const developmentFormat = combine(errors({ stack: true }), colorize(), splat(), devPrintf);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: process.env.NODE_ENV === 'development' ? developmentFormat : productionFormat,
  transports: [new winston.transports.Console({ stderrLevels: ['error'] })],
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

module.exports = logger;
