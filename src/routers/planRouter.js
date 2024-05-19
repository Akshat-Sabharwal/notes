const express = require("express");
const planController = require("../controllers/planController");
const authController = require("../controllers/authController");

// ROUTER
const router = express.Router({ mergeParams: true });

// ROUTES
router
  .route("/")
  .get(planController.getAllPlans)
  .post(
    authController.protectRoute,
    authController.restrictTo("admin"),
    planController.createPlan,
  )
  .delete(authController.protectRoute, planController.unsubscribe);

router
  .route("/:plan")
  .get(planController.getPlan)
  .patch(
    authController.protectRoute,
    authController.restrictTo("admin"),
    planController.updatePlan,
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo("admin"),
    planController.deletePlan,
  );

router.post(
  "/subscribe/:plan",
  // authController.protectRoute,
  planController.subscribe,
);

router.patch(
  "/upgrade/:plan",
  authController.protectRoute,
  planController.upgradePlan,
);

// EXPORTS
module.exports = router;
