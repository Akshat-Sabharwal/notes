const mongoose = require("mongoose");
const cryptoJS = require("crypto-js");
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

  const text = this.text;

  const jsonCipher = cryptoJS.AES.encrypt(
    JSON.stringify(text),
    process.env.HASH_KEY,
  ).toString();

  this.text = cryptoJS.enc.Base64.stringify(
    cryptoJS.enc.Utf8.parse(jsonCipher),
  );

  next();
});

// QUERY MIDDLEWARE
noteSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

noteSchema.post("find", function (docs, next) {
  for (let doc of docs) {
    let decData = cryptoJS.enc.Base64.parse(doc.text).toString(
      cryptoJS.enc.Utf8,
    );
    let text = cryptoJS.AES.decrypt(
      decData,
      process.env.HASH_KEY,
    ).toString(cryptoJS.enc.Utf8);

    doc.text = JSON.parse(text);
  }

  next();
});

noteSchema.post(/^findOne/, function (doc, next) {
  let decData = cryptoJS.enc.Base64.parse(doc.text).toString(
    cryptoJS.enc.Utf8,
  );
  let text = cryptoJS.AES.decrypt(
    decData,
    process.env.HASH_KEY,
  ).toString(cryptoJS.enc.Utf8);

  doc.text = JSON.parse(text);

  next();
});

// MODEL
const Note = mongoose.model("Note", noteSchema);

// EXPORTS
module.exports = Note;
