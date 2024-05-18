const { ResourceError } = require("../errors/errorClasses");
const { errorHandler } = require("../errors/errorHandlers");
const Plan = require("../models/Plan");
const User = require("../models/User");

exports.getAllPlans = errorHandler(async (req, res, next) => {
  const plans = await Plan.find();

  res.status(200).json({
    status: "success",
    message: "Plans fetched!",
    result: {
      count: plans.length,
      plans,
    },
  });
});

exports.getPlan = errorHandler(async (req, res, next) => {
  if (!req.params.slug) {
    return next(
      new ResourceError("Plan name, to search for, not found!"),
    );
  }

  const plan = await Plan.find({ name: req.params.slug });

  if (!plan) {
    return next(new ResourceError("Subscription plan not found!"));
  }

  res.status(200).json({
    status: "success",
    message: "Plan fetched!",
    result: plan,
  });
});

exports.createPlan = errorHandler(async (req, res, next) => {
  const { name, price, maxNotes } = req.body;

  if (!name || !price || !maxNotes) {
    return next(new ResourceError("Required information not found!"));
  }

  const result = await Plan.create({
    name,
    price,
    maxNotes,
  });

  res.status(200).json({
    status: "success",
    message: "Plan created!",
    result: result,
  });
});

exports.updatePlan = errorHandler(async (req, res, next) => {
  const { name, price, maxNotes } = req.body;

  if (!name && !price && !maxNotes) {
    return next(
      new ResourceError("Information to update not found!"),
    );
  }

  let query = Plan.findOne({ name: req.params.slug });

  if (name) {
    query.updateOne({ name: name });
  }

  if (price) {
    query.updateOne({ price: price });
  }

  if (maxNotes) {
    query.updateOne({ maxNotes: maxNotes });
  }

  const result = await query;

  res.status(200).json({
    status: "success",
    message: "Plan updated!",
    result: result,
  });
});

exports.deletePlan = errorHandler(async (req, res, next) => {
  await Plan.deleteOne({ name: req.params.slug });

  res.status(204).json({
    status: "success",
    message: "Plan deleted!",
  });
});

exports.subscribe = errorHandler(async (req, res, next) => {
  const planName = req.params.slug;

  if (req.user.subscription) {
    return next(new ServerError("User has an active subscription."));
  }

  const plan = await Plan.findOne({ name: planName });

  req.user.subscription = plan._id;
  await req.user.save();

  res.status(200).json({
    status: "success",
    message: `Subscribed successfully to ${planName} plan!`,
  });
});
