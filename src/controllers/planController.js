const {
  ResourceError,
  ServerError,
  MongoError,
} = require("../errors/errorClasses");
const { errorHandler } = require("../errors/errorHandlers");
const Plan = require("../models/Plan");
const User = require("../models/User");
// const { createSession } = require("../utils/payments");
const stripe = require("stripe")(process.env.STRIPE_KEY);

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
  if (!req.params.plan) {
    return next(
      new ResourceError("Plan name, to search for, not found!"),
    );
  }

  const plan = await Plan.find({ name: req.params.plan });

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

  let query = Plan.findOne({ name: req.params.plan });

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
  await Plan.deleteOne({ name: req.params.plan });

  res.status(204).json({
    status: "success",
    message: "Plan deleted!",
  });
});

exports.subscribe = errorHandler(async (req, res, next) => {
  const planName = req.params.plan;
  req.user = req.body.user;

  if (req.user.subscription.name !== "novice") {
    return next(
      new ServerError(
        `User has an active subscription. Upgrade plan at ${req.protocol}://${req.get("host")}/subscription-plans/upgrade/${planName}`,
      ),
    );
  }

  const plan = await Plan.findOne({ name: planName });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/note`,
    cancel_url: `${req.protocol}://${req.get("host")}/subscription-plan/${plan.name}/subscribe`,
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: plan.name,
          },
          unit_amount: plan.price * 100,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
  });

  res.redirect(303, session.url);

  req.user.subscription = plan._id;
  await req.user.save();

  res.status(200).json({
    status: "success",
    message: `Subscribed successfully to ${planName} plan!`,
  });
});

exports.unsubscribe = errorHandler(async (req, res, next) => {
  if (req.user.subscription.name === "novice") {
    return next(
      new ServerError(
        "User doesn't have an active paid subscription!",
      ),
    );
  }

  if (req.user.notes.length >= req.user.subscription.maxNotes) {
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          notes: {
            $concatArrays: [{ $slice: ["$otes", 5] }],
          },
        },
      },
    );
  }

  const novice = await Plan.findOne({ name: "novice" });

  await User.updateOne(
    { _id: req.user._id },
    { $set: { subscription: novice._id } },
  );

  res.status(200).json({
    status: "success",
    message: "Unsubscribed successfully!",
  });
});

exports.upgradePlan = errorHandler(async (req, res, next) => {
  const { plan } = req.params;

  if (req.user.subscription.name === plan) {
    return next(
      new ServerError(`User already subscribed to ${plan} plan!`),
    );
  }

  // PAYMENT

  const newPlan = await Plan.findOne({ name: plan });

  if (!newPlan) {
    return next(new MongoError("Plan doesn't exist!"));
  }

  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { subscription: newPlan._id },
  ).populate("subscription");

  res.status(200).json({
    status: "success",
    message: `Upgraded to ${plan}, successfully!`,
    result: user,
  });
});
