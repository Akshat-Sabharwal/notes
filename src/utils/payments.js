const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.createSession = async (req, plan) => {
  const result = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/note`,
    cancel_url: `${req.protocol}://${req.get("host")}/subscription-plan/${plan.name}/subscribe`,
    customer_email: req.user.email,
    line_items: [
      {
        name: plan.name,
        price: plan.price,
        quantity: 1,
      },
    ],
  });
  return result;
};
