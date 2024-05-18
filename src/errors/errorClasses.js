class ServerError extends Error {
  constructor(message, stack, name) {
    super(message ? message : "Server produced an unknown error!");
    this.code = 500;
    this.name = name
      ? `InternalServerError: ${name}`
      : "InternalServerError";
    this.stack = stack;
  }
}

class MongoError extends Error {
  constructor(message, stack, name) {
    super(message ? message : "Database produced an unknown error!");
    this.code = 500;
    this.name = name ? `MongoError: ${name}` : "MongoError";
    this.stack = stack;
  }
}

class MongooseError extends Error {
  constructor(message, stack, name) {
    super(message ? message : "Driver produced an unknown error!");
    this.code = 500;
    this.name = name ? `MongooseError: ${name}` : "MongooseError";
    this.stack = stack;
  }
}

class JWTError extends Error {
  constructor(message, stack, name) {
    super(message ? message : "JWT produced an unknown error!");
    this.code = 401;
    this.name = name ? `JWTError: ${name}` : "JWTError";
    this.stack = stack;
  }
}

class ResourceError extends Error {
  constructor(message, stack, name) {
    super(message ? message : "Resource not found!");
    this.code = 404;
    this.name = name ? `ResourceError: ${name}` : "ResourceError";
    this.stack = stack;
  }
}

class AuthError extends Error {
  constructor(message, stack, name) {
    super(message ? message : "Authentication error produced!");
    this.code = 400;
    this.name = name ? `AuthError: ${name}` : "AuthError";
    this.stack = stack;
  }
}

class UnknownError extends Error {
  constructor(message, stack, name) {
    super(message ? message : "Unknown error produced!");
    this.code = 500;
    this.name = name ? `UnknownError: ${name}` : "UnknownError";
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
