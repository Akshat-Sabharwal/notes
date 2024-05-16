const mongoose = require("mongoose");
const validate = require("validator");
const bcrypt = require("bcrypt");

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
  },
  {
    collection: "users",
  },
);

// DOCUMENT MIDDLEWARE
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 14);
  this.createdAt = Date.now();

  next();
});

// MODEL
const User = mongoose.model("User", userSchema);

// EXPORTS
module.exports = User;
