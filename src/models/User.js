const mongoose = require("mongoose");
const validate = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { convertToMs } = require("../utils/conversion");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name!"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "A user must have an e-mail!"],
      unique: true,
      validate: {
        validator: validate.isEmail,
        message: "E-mail is invalid!",
      },
    },
    password: {
      type: String,
      required: [true, "A user must have a password!"],
    },
    createdAt: {
      type: Date,
      immutable: true,
    },
    passwordResetToken: String,
    resetTokenExpires: Date,
  },
  {
    collection: "users",
  },
);

// INSTANCE METHODS
userSchema.methods.hidePassword = function () {
  const jsonDoc = this.toJSON();
  delete jsonDoc.password;

  return jsonDoc;
};

userSchema.methods.createPasswordResetToken = async function () {
  const token = crypto.randomBytes(16).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetToken = hashedToken;
  this.resetTokenExpires = convertToMs(10, "min");

  return token;
};

userSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

// DOCUMENT MIDDLEWARE
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 14);
  this.createdAt = Date.now();

  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, async function (next) {
  this.select("-password");
  next();
});

// MODEL
const User = mongoose.model("User", userSchema);

// EXPORTS
module.exports = User;
