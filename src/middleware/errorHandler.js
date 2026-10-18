const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

function notFound(req, _res, next) {
  next(new ApiError(404, 'Route not found'));
}

function errorHandler(err, req, res, _next) {
  if (res.headersSent) return;

  let status = err.statusCode || err.status;
  let message = err.message;
  let details = err.details;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON request body';
    details = undefined;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'value';
    message = `An account with this ${field} already exists`;
    details = undefined;
  } else if (err.name === 'ValidationError' || err.name === 'CastError') {
    status = 400;
    message = 'Invalid submitted data';
    details = undefined;
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
    details = undefined;
  } else if (!(err instanceof ApiError)) {
    status = 500;
    message = 'Internal server error';
    details = undefined;
  }

  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;

  const metadata = {
    method: req.method,
    path: req.path,
    status,
    errorType: err.name,
    errorCode: typeof err.code === 'number' ? err.code : undefined
  };
  if (status >= 500) logger.error('Application error', metadata);
  else logger.warn('Handled API error', metadata);

  const response = { success: false, message };
  if (details) response.errors = details;
  res.status(status).json(response);
}

module.exports = { notFound, errorHandler };
