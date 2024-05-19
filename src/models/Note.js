const mongoose = require("mongoose");
const crypto = require("crypto");
const validate = require("validator");
const slugify = require("slugify");

// SCHEMA
const noteSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A note must have a title!"],
      unique: true,
      validate: {
        validator: (val) =>
          validate.isAlphanumeric(val, "en-US", { ignore: " " }),
        message: "Title must have alphanumeric characters only!",
      },
    },
    tags: {
      type: [String],
    },
    text: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    slug: {
      type: String,
    },
  },
  { collection: "notes" },
);

// DOCUMENT MIDDLEWARE
noteSchema.pre("save", async function (next) {
  this.slug = slugify(this.title).toLowerCase();

  this.text = crypto
    .createHash("sha256")
    .update(this.text)
    .digest("hex");

  next();
});

// QUERY MIDDLEWARE
noteSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

// MODEL
const Note = mongoose.model("Note", noteSchema);

// EXPORTS
module.exports = Note;
