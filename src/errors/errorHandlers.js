const {
  ServerError,
  MongoError,
  JWTError,
  ResourceError,
  MongooseError,
  UnknownError,
} = require("./errorClasses");

exports.globalErrorHandler = (err, res) => {
  switch (process.env.NODE_ENV) {
    case "production":
      res
        .status(err.code || 500)
        .json({ name: err.name, message: err.message });

      break;

    case "development":
      res.status(err.code || 500).json({
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
      console.log(err);
      switch (err.name) {
        case "ServerError":
          next(new ServerError(err.message, err.stack));
          break;

        case "ValidationError":
          next(new MongoError(err.message, err.stack));
          break;

        case "MongoServerError":
          if (err.code === 11000) {
            next(
              new MongoError(
                `User with ${Object.keys(err.keyValue)[0]} ${Object.values(err.keyValue)[0]} already exists!`,
                err.stack,
                "DuplicateError",
              ),
            );
          } else {
            next(new MongoError(err.message, err.stack));
            break;
          }

        case "MongooseError":
          next(new MongooseError(err.message, err.stack));
          break;

        case "JsonWebTokenError":
          next(new JWTError(err.message, err.stack));
          break;

        case "ResourceError":
          next(new ResourceError(err.message, err.stack));
          break;

        default:
          next(new UnknownError(err.message, err.stack));
      }
    }
  };
};
