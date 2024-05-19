const express = require("express");
const expressMongoSanitize = require("express-mongo-sanitize");
const expressRateLimiter = require("express-rate-limiter");
const helmet = require("helmet");
const hpp = require("hpp");
const xss = require("xss-clean");
const cors = require("cors");
const morgan = require("morgan");

const notesRouter = require("../routers/notesRouter");
const authRouter = require("../routers/authRouter");
const userRouter = require("../routers/userRouter");
const planRouter = require("../routers/planRouter");
const meRouter = require("../routers/meRouter");

const errorHandler = require("../errors/errorHandlers");
const { convertToMs } = require("../utils/conversion");
const cookieParser = require("cookie-parser");

// INSTANTIATION
const app = express();

// MIDDLEWARE STACK

// SAFETY & SANITATION
app.use(helmet());
app.use(expressMongoSanitize());
app.use(hpp());
app.use(xss());
app.use(cors({ credentials: true }));

if (process.env.NODE_ENV === "production") {
  app.use(
    expressRateLimiter({
      max: 100,
      windowMs: convertToMs(1, "hr"),
    }),
  );
}

// DEV
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// ROUTERS
app.use("/user", userRouter);
app.use("/note", notesRouter);
app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/subscription-plan", planRouter);

// ERROR HANDLERS
app.use("/", (err, req, res, next) => {
  errorHandler.globalErrorHandler(err, res);
  next();
});

module.exports = app;
