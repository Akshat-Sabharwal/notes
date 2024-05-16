const {
  ServerError,
  MongoError,
  JWTError,
  ResourceError,
  MongooseError,
} = require("./errorClasses");

exports.globalErrorHandler = (err, res) => {
  switch (process.env.NODE_ENV) {
    case "production":
      res
        .status(err.code)
        .json({ name: err.name, message: err.message });

      break;

    case "development":
      res.status(err.code).json({
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      break;

    default:
      res.status(500).json({
        name: "UnknownError",
        message: "Some unknown error has been produced!",
        stack: err.stack,
      });
  }
};

exports.errorHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      switch (err.name) {
        case "ServerError":
          next(new ServerError(err.message));
          break;

        case "MongoError":
          next(new MongoError(err.message));
          break;

        case "MongooseError":
          next(new MongooseError(err.message));
          break;

        case "JWTError":
          next(new JWTError(err.message));
          break;

        case "ResourceError":
          next(new ResourceError(err.message));
          break;
      }
    }
  };
};
