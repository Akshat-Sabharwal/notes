const { errorHandler } = require("../errors/errorHandlers");
const User = require("../models/User");
const Plan = require("../models/Plan");

exports.getMe = errorHandler(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id }).populate(
    "subscription",
  );

  res.status(200).json({
    status: "success",
    message: "User fetched!",
    result: user,
  });
});

exports.updateMe = errorHandler(async (req, res, next) => {
  const { name, plan } = req.body;

  const user = await User.findOne({ _id: req.user._id })
    .populate("subscription")
    .select("+password");

  const newPlan = await Plan.findOne({ name: plan });

  user.name = name;
  user.subscription = newPlan._id;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "User updated!",
    result: user,
  });
});

exports.deleteMe = errorHandler(async (req, res, next) => {
  await User.findByIdAndDelete({ _id: req.user._id });

  res.status(204).json({
    status: "success",
    message: "User deleted!",
  });
});
