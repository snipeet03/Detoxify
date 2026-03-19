const logger = require('../utils/logger');

function globalErrorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(`[${status}] ${req.method} ${req.originalUrl} — ${message}`);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { globalErrorHandler };
