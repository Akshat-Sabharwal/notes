class ServerError extends Error {
  constructor(message) {
    super(message ? message : "Server produced an unknown error!");
    this.code = 500;
    this.name = "InternalServerError";
    this.stack = Error.captureStackTrace(this);
  }
}

class MongoError extends Error {
  constructor(message) {
    super(message ? message : "Database produced an unknown error!");
    this.code = 500;
    this.name = "MongoError";
    this.stack = Error.captureStackTrace(this);
  }
}

class MongooseError extends Error {
  constructor(message) {
    super(message ? message : "Driver produced an unknown error!");
    this.code = 500;
    this.name = "MongooseError";
    this.stack = Error.captureStackTrace(this);
  }
}

class JWTError extends Error {
  constructor(message) {
    super(message ? message : "JWT produced an unknown error!");
    this.code = 401;
    this.name = "JWTError";
    this.stack = Error.captureStackTrace(this);
  }
}

class ResourceError extends Error {
  constructor(message) {
    super(message ? message : "Resource not found!");
    this.code = 404;
    this.name = "ResourceError";
    this.stack = Error.captureStackTrace(this);
  }
}

module.exports = {
  ServerError,
  MongoError,
  MongooseError,
  JWTError,
  ResourceError,
};
