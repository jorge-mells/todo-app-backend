import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.json(),
    format.prettyPrint()
  ),
  defaultMeta: { service: 'any-service' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({ format: format.combine(
      format.timestamp(),
      format.json(),
      format.prettyPrint(),
      format.colorize()
    ), }),
  ],
});

export default logger;
