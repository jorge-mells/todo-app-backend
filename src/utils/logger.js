import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

// change the logging format if we're not in production.
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(
        info => {
          const { level, message, timestamp, ...rest } = info;
          const restStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest, null, 2)}` : '';
          return `${timestamp} ${level}: ${message} ${restStr}`;
        }
      )
    ),
  }));
};

export default logger;
