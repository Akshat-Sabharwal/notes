const User = require("../models/User");
const factoryHandler = require("../utils/factoryHandlers");
const { errorHandler } = require("../errors/errorHandlers");
const { ResourceError } = require("../errors/errorClasses");

exports.getUser = errorHandler(async (req, res, next) => {
  const user = await User.findById({ _id: req.params.id }).populate(
    "subscription",
  );

  if (!user) {
    return next(new ResourceError("User not found!"));
  }

  res.status(200).json({
    status: "success",
    message: "User fetched!",
    data: user,
  });
});

exports.deleteUser = errorHandler(async (req, res, next) => {
  await User.findByIdAndDelete({ _id: req.params.id });

  res.status(204).json({
    status: "success",
    message: "User deleted!",
  });
});

exports.getAllUsers = factoryHandler.getAll(User);
exports.deleteAllUsers = factoryHandler.deleteAll(User);
