const express = require("express");
const expressMongoSanitize = require("express-mongo-sanitize");
const expressRateLimiter = require("express-rate-limiter");
const helmet = require("helmet");
const hpp = require("hpp");
const xss = require("xss-clean");
const cors = require("cors");
const morgan = require("morgan");

const notesRouter = require("../routers/notesRouter");
const errorHandler = require("../errors/errorHandlers");

// INSTANTIATION
const app = express();

// MIDDLEWARE STACK

// SAFETY & SANITATION
app.use(helmet());
app.use(expressMongoSanitize());
app.use(hpp());
app.use(xss());
app.use(cors());

if (process.env.NODE_ENV === "production") {
  app.use(
    expressRateLimiter({
      max: 100,
      windowMs: 60 * 60 * 1000,
    }),
  );
}

// DEV
app.use(morgan("dev"));

// ROUTERS
app.use("/note", notesRouter);

// ERROR HANDLERS
app.use((err, req, res, next) => {
  errorHandler.globalErrorHandler(err, res);
  next();
});

module.exports = app;
