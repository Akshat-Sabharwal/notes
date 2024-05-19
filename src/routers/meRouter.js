const express = require("express");
const authController = require("../controllers/authController");
const meController = require("../controllers/meController");

// ROUTER
const router = express.Router();

// MIDDLEWARE
router.use(authController.protectRoute);

// ROUTES
router
  .route("/")
  .get(meController.getMe)
  .patch(meController.updateMe)
  .delete(meController.deleteMe);

// EXPORTS
module.exports = router;
