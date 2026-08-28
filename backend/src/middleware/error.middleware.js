import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : 'Internal server error';

  // Expected 4xx (bad input, forbidden, not found) log at warn; anything
  // unexpected — a 500 or a bug that never went through ApiError — logs the
  // full stack at error so it surfaces in alerting instead of getting lost.
  const log = req.log ?? console;
  if (!isApiError || statusCode >= 500) {
    log.error({ err, statusCode }, message);
  } else {
    log.warn({ statusCode }, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: isApiError ? err.details : undefined,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};
