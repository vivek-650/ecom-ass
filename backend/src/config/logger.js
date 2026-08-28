import pino from 'pino';
import { env } from './env.js';

/**
 * Structured JSON logs in production (ready for Render's log pipeline / any
 * log aggregator); pretty-printed in development. Never log secrets — see
 * the redact list below and requestLogger.middleware.js for header redaction.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (env.nodeEnv === 'production' ? 'info' : 'debug'),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.razorpaySignature'],
    censor: '[REDACTED]',
  },
  transport:
    env.nodeEnv === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
});
