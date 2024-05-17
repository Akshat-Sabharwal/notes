// DOTENV CONFIG
const dotenv = require("dotenv").config({
  path: `${__dirname}/../../.env`,
});

// IMPORTS
const app = require("./middleware");
const mongoose = require("mongoose");
const { MongooseError } = require("../errors/errorClasses");

// DATABASE INTEGRATION
mongoose
  .connect(
    process.env.NODE_ENV === "production"
      ? process.env.DB_CONNECTION_STRING_PROD
      : process.env.DB_CONNECTION_STRING_DEV,
    {
      dbName: "noteum",
    },
  )
  .catch((err) => {
    throw new MongooseError(err.message);
  })
  .then(() => {
    console.log("Database connection successful!");
  });

// SERVER INSTANTIATION
app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}...`);
});
