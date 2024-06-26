const {
  ResourceError,
  JWTError,
  AuthError,
} = require("../errors/errorClasses");
const { errorHandler } = require("../errors/errorHandlers");
const jwt = require("jsonwebtoken");
const { convertToMs } = require("../utils/conversion");
const User = require("../models/User");
const Plan = require("../models/Plan");

// LOCALS
const jwtSignToken = async (data) => {
  const token = await jwt.sign(
    data.toString(),
    process.env.JWT_SECRET_KEY,
  );
  return token;
};

const retrieveUser = async (req, next) => {
  let user;

  if (req.body.email) {
    user = await User.findOne({
      email: req.body.email,
    }).select("+password");
  } else if (req.body.name) {
    user = await User.findOne({
      name: req.body.name,
    }).select("+password");
  } else {
    return next(new ResourceError("Credentials not found!"));
  }

  if (!user) {
    return next(new ResourceError("User not found!"));
  }

  return user;
};

// SIGNUP
exports.signup = errorHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(
      new ResourceError("Request doesn't contain credentials!"),
    );
  }

  const plan = await Plan.findOne({ name: "novice" });

  if (!plan) {
    return next(new ResourceError("Plan doesn't exist!"));
  }

  let result = await User.create({
    name: name,
    email: email,
    password: password,
    role: role,
    subscription: plan._id,
  });

  result = result.hidePassword();

  const token = await jwtSignToken(result._id);

  if (!token) {
    return next(new JWTError("Token could not be created!"));
  }

  res.cookie("jwt-token", token, {
    maxAge: convertToMs(process.env.JWT_EXPIRES_IN, "d"),
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
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

  if (!password) {
    return next(new ResourceError("Credentials not found!"));
  }

  const user = await retrieveUser(req, next);

  const passwordCheck = await user.checkPassword(password);

  if (!passwordCheck) {
    return next(new AuthError("Credentials provided are incorrect!"));
  }

  const token = await jwtSignToken(user._id);

  res.cookie("jwt-token", token, {
    maxAge: convertToMs(process.env.JWT_EXPIRES_IN, "d"),
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  res.status(200).json({
    status: "success",
    message: "Login successful!",
  });
});

// FORGOT PASSWORD
exports.forgotPassword = errorHandler(async (req, res, next) => {
  const user = await retrieveUser(req, next);

  const token = await user.createPasswordResetToken();
  await user.save();

  res.cookie("password-reset-token", token, {
    maxAge: user.resetTokenExpires,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  res.status(200).json({
    status: "success",
    message: `Visit ${req.protocol}://${req.get("host")}/auth/reset-password to reset your password.`,
  });
});

// RESET PASSWORD
exports.resetPassword = errorHandler(async (req, res, next) => {
  const user = await retrieveUser(req, next);

  if (user.resetTokenExpires < Date.now()) {
    return next(new AuthError("Password reset token has expired!"));
  }

  const { password } = req.body;

  if (!password) {
    return next(
      new ResourceError("Required information not provided!"),
    );
  }

  if (user.passwordResetToken !== cookie) {
    return next(new AuthError("Password reset token is invalid!"));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;
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

  const user = await User.findOne({ _id: result }).populate(
    "subscription",
  );

  console.log("Protect route:", user);

  if (!user) {
    return next(new AuthError("User not found!"));
  }

  req.user = user;

  next();
});

// RESTRICT TO
exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AuthError("User not authenticated!"));
    }

    if (!roles.includes(req.user.role)) {
      let forbiddenError = new AuthError(
        "User does not have permission for this route!",
      );
      forbiddenError.code = 403;

      return next(forbiddenError);
    }

    next();
  };
};
