import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = app.listen(env.port, () => {
  logger.info({ port: env.port, env: env.nodeEnv }, 'Lumos Market API listening');
});

// A crash that isn't handled here silently kills the process with no log —
// on Render that just looks like the service going unresponsive. Log it,
// then exit non-zero so the platform's restart policy takes over cleanly.
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection — shutting down');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down');
  process.exit(1);
});

function shutdown(signal) {
  logger.info({ signal }, 'Shutdown signal received, closing server');
  server.close(() => {
    logger.info('Server closed, exiting');
    process.exit(0);
  });
  // Don't hang forever waiting on slow in-flight requests during a deploy.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
