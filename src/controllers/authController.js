const {
  ResourceError,
  JWTError,
  AuthError,
  ServerError,
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

  let result = await User.create({
    name: name,
    email: email,
    password: password,
    role: role,
  });

  result = result.hidePassword();

  const token = await jwtSignToken(result._id);

  if (!token) {
    return next(new JWTError("Token could not be created!"));
  }

  res.cookie("jwt-token", token, {
    expire: Date.now() + convertToMs(process.env.JWT_EXPIRES_IN, "d"),
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "None",
    partitioned: true,
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

  if (passwordCheck === false) {
    return next(new AuthError("Credentials provided are incorrect!"));
  }
  const token = await jwtSignToken(user._id);

  res.cookie("jwt-token", token, {
    maxAge: convertToMs(process.env.JWT_EXPIRES_IN, "d"),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  // res.header(
  //   "Set-Cookie",
  //   `jwt-token=${token}; HttpOnly; Secure; Max-Age=${convertToMs(process.env.JWT_EXPIRES_IN, "d")}; SameSite=None; Partitioned;`,
  // );

  res.status(200).json({
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
    secure: true,
    sameSite: "None",
    credentials: true,
    path: "/",
    partitioned: true,
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
