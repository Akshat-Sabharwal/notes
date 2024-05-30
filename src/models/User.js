const mongoose = require("mongoose");
const validate = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "User role must have a value of admin or user.",
      },
      required: [true, "A user must have a role!"],
    },
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
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
  this.resetTokenExpires = Date.now() + convertToMs(5, "min");

  return token;
};

userSchema.methods.checkPassword = async function (passwordToCheck) {
  await bcrypt.compare(passwordToCheck, this.password).then((val) => {
    return val;
  });
};

// DOCUMENT MIDDLEWARE
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 14);
    console.log(this.password);
  }

  this.createdAt = Date.now();

  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

// MODEL
const User = mongoose.model("User", userSchema);

// EXPORTS
module.exports = User;
