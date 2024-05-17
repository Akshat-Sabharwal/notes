const express = require("express");
const authController = require("../controllers/authController");

// ROUTER
const router = express.Router();

// ROUTES
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password", authController.resetPassword);

module.exports = router;
