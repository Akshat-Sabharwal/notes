class ServerError extends Error {
  constructor(message, stack) {
    super(message ? message : "Server produced an unknown error!");
    this.code = 500;
    this.name = "InternalServerError";
    this.stack = stack;
  }
}

class MongoError extends Error {
  constructor(message, stack) {
    super(message ? message : "Database produced an unknown error!");
    this.code = 500;
    this.name = "MongoError";
    this.stack = stack;
  }
}

class MongooseError extends Error {
  constructor(message, stack) {
    super(message ? message : "Driver produced an unknown error!");
    this.code = 500;
    this.name = "MongooseError";
    this.stack = stack;
  }
}

class JWTError extends Error {
  constructor(message, stack) {
    super(message ? message : "JWT produced an unknown error!");
    this.code = 401;
    this.name = "JWTError";
    this.stack = stack;
  }
}

class ResourceError extends Error {
  constructor(message, stack) {
    super(message ? message : "Resource not found!");
    this.code = 404;
    this.name = "ResourceError";
    this.stack = stack;
  }
}

class AuthError extends Error {
  constructor(message, stack) {
    super(message ? message : "Authentication error produced!");
    this.code = 400;
    this.name = "AuthError";
    this.stack = stack;
  }
}

class UnknownError extends Error {
  constructor(message, stack) {
    super(message ? message : "Unknown error produced!");
    this.code = 500;
    this.name = "UnknownError";
    this.stack = stack;
  }
}

module.exports = {
  ServerError,
  MongoError,
  MongooseError,
  JWTError,
  ResourceError,
  AuthError,
  UnknownError,
};
