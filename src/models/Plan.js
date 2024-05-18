const mongoose = require("mongoose");

// SCHEMA
const planSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A subscription plan must have a name!"],
      enum: {
        values: ["novice", "intermediate", "advanced"],
        message:
          "The plan name can be one of novice, intermediate, advanced.",
      },
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "A subscription plan must have a price!"],
    },
    maxNotes: {
      type: Number,
      required: [
        true,
        "A subscription plan allows only a certain number of maximum notes!",
      ],
    },
  },
  {
    collection: "plans",
  },
);

// QUERY MIDDLEWARE
planSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

// MODEL
const Plan = mongoose.model("Plan", planSchema);

// EXPORTS
module.exports = Plan;
