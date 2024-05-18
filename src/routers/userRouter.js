const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// ROUTER
const router = express.Router();

// MIDDLEWARE
router.use(authController.protectRoute);
router.use(authController.restrictTo("admin"));

// ROUTES
router
  .route("/")
  .get(userController.getAllUsers)
  .delete(userController.deleteAllUsers);

router
  .route("/:id")
  .delete(userController.deleteUser)
  .get(userController.getUser);

// EXPORTS
module.exports = router;
