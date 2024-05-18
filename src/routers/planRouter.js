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
  );

router
  .route("/:slug")
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
  "/:slug/subscribe",
  authController.protectRoute,
  planController.subscribe,
);

// EXPORTS
module.exports = router;
