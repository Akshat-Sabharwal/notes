const {
  ResourceError,
  JWTError,
  AuthError,
} = require("../errors/errorClasses");
const { errorHandler } = require("../errors/errorHandlers");
const jwt = require("jsonwebtoken");
const { convertToMs } = require("../utils/conversion");
const User = require("../models/User");
const crypto = require("crypto");

// LOCALS
const jwtSignToken = async (data) => {
  const token = await jwt.sign(
    data.toString(),
    process.env.JWT_SECRET_KEY,
  );
  return token;
};

const retrieveUser = async (req, next) => {
  const identifier = req.body.email
    ? "email"
    : req.body.name
      ? "name"
      : null;

  if (identifier === null) {
    return next(new ResourceError("Credentials not found!"));
  }

  const user = await User.findOne(
    {
      identifier: req.body.identifier,
    },
    { password: 1 },
  );

  if (!user) {
    return next(new ResourceError("User not found!"));
  }

  return user;
};

// SIGNUP
exports.signup = errorHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return next(
      new ResourceError("Request doesn't contain credentials!"),
    );
  }

  let result = await User.create({
    name: name,
    email: email,
    password: password,
  });

  result = result.hidePassword();

  const token = await jwtSignToken(result._id);

  if (!token) {
    return next(new JWTError("Token could not be created!"));
  }

  res.cookie("jwt-token", token, {
    expire: Date.now() + convertToMs(process.env.JWT_EXPIRES_IN, "d"),
    httpOnly: true,
  });

  res.status(200).send({
    status: "success",
    message: "Sign-up successful!",
    result,
  });
});

// LOGIN
exports.login = errorHandler(async (req, res, next) => {
  const { password } = req.body;

  const user = await retrieveUser(req, next);

  if (!user) {
    return next(new ResourceError("User doesn't exist!"));
  }

  const passwordCheck = await user.checkPassword(password);

  if (passwordCheck === false) {
    return next(new AuthError("Credentials provided are incorrect!"));
  }
  const token = await jwtSignToken(user._id);

  res.cookie("jwt-token", token, {
    expire: Date.now() + convertToMs(process.env.JWT_EXPIRES_IN, "d"),
    httpOnly: true,
  });

  res.status(200).send({
    status: "success",
    message: "Login successful!",
  });
});

// FORGOT PASSWORD
exports.forgotPassword = errorHandler(async (req, res, next) => {
  const user = await retrieveUser(req);

  const token = await user.createPasswordResetToken();
  await user.save();

  res.cookie("password-reset-token", token, {
    expire: Date.now() + user.resetTokenExpires,
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: `Visit ${req.protocol}://${req.get("host")}/auth/reset-password to reset your password.`,
  });
});

// RESET PASSWORD
exports.resetPassword = errorHandler(async (req, res, next) => {
  let cookie = req.cookies["password-reset-token"];
  cookie = crypto.createHash("sha256").update(cookie).digest("hex");

  const user = await retrieveUser(req, next);

  const { password } = req.body;

  if (!password) {
    return next(new ResourceError("Password not provided!"));
  }

  if (user.passwordResetToken !== cookie) {
    return next(new AuthError("Password reset token is invalid!"));
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully!",
  });
});

// PROTECT ROUTE
exports.protectRoute = errorHandler(async (req, res, next) => {
  const token = req.cookies["jwt-token"];

  if (!token) {
    return next(new JWTError("Token not found!"));
  }

  const result = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  if (!result) {
    return next(new JWTError("Invalid JWT token!"));
  }

  const user = await User.findOne({ _id: result });

  if (!user) {
    return next(new ResourceError("User not found!"));
  }

  req.user = user;

  next();
});
