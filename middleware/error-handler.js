const { StatusCodes } = require('http-status-codes');
const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    //set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'something went wrong',
  };
  if (err.name === 'ValidationError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    const msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    customError.msg = msg;
  }
  if (err.code && err.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = `Duplicate Value Entered for ${Object.keys(err.keyValue)} field, please choose another value`;
  }
  if (err.name === 'CastError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = `No item found with id : ${err.value}`;
  }
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
