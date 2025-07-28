const winston = require('winston');

const timestamp = new Date().toISOString().replace(/[:]/g, '-'); // Remove ":" for Windows compatibility
const logFileName = 'output-' + `${timestamp}.log`;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: logFileName }),
    new winston.transports.Console()
  ]
});

module.exports = logger;