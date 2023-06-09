const AppError = require('./../utils/appError');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use other value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (error, request, response) => {
  // API
  if (request.originalUrl.startsWith('/api')) {
    response.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  }
  // RENDERED WEBSITE
  console.error('💥💥💥💥💥ERROR💥💥💥💥💥', error);
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: error.message,
  });
};

const sendErrorProd = (error, request, response) => {
  // API
  if (request.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      // Operational, trusted error: send message to client
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // Programming or other unknown error: don't leak error details
    //1. Log error
    console.error('💥💥💥💥💥ERROR💥💥💥💥💥', error);

    // 2. Send generic message
    return response.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // RENDERED WEBSITE
  if (error.isOperational) {
    return response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  //1. Log error
  console.error('💥💥💥💥💥ERROR💥💥💥💥💥', error);

  // 2. Send generic message
  return response.status(500).json({
    status: 'error',
    message: 'Please try again later.',
  });
};

module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, request, response);
  } else if (process.env.NODE_ENV === 'production') {
    let err = Object.assign(error);
    // err.message = error.message;

    if (err.name === 'CastError') err = handleCastErrorDB(err);

    if (err.code === 11000) err = handleDuplicateFieldsDB(err);

    if (err.name === 'ValidationError')
      err = handleValidationErrorDB(err);

    if (err.name === 'JsonWebTokenError') err = handleJWTError();

    if (err.name === 'TokenExpiredError')
      err = handleJWTExpiredError();

    sendErrorProd(err, request, response);
  }
};
