const express = require("express");
const notesController = require("../controllers/notesController");

// ROUTER
const router = express.Router();

// ROUTES
router.route("/").post(notesController.createNote);

router.route("/:name").get(notesController.getNote);

// EXPORTS
module.exports = router;
