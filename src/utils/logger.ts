import winston from 'winston';
import config from '@config/env';

const logger = winston.createLogger({
  level: config.log_level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'flood-warning-system' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...meta }) =>
            `${timestamp} ${level}: ${message} ${
              Object.keys(meta).length > 1 ? JSON.stringify(meta) : ''
            }`
        )
      ),
    }),
  ],
});

if (config.is_production) {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  );
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

export default logger;
