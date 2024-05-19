const express = require("express");
const notesController = require("../controllers/notesController");
const authController = require("../controllers/authController");

// ROUTER
const router = express.Router();

// MIDDLEWARE
router.use(authController.protectRoute);

// ROUTES
router
  .route("/")
  .post(notesController.createNote)
  .get(
    authController.restrictTo("admin"),
    notesController.getAllNotes,
  )
  .delete(notesController.deleteAllNotes);

router
  .route("/:name")
  .get(notesController.getNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

// EXPORTS
module.exports = router;
