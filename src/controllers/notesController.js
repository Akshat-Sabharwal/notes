const Note = require("../models/Note");
const factoryHandler = require("../utils/factoryHandlers");

exports.createNote = factoryHandler.createOne(Note);
exports.getNote = factoryHandler.getOne(Note);
exports.getAllNotes = factoryHandler.getAll(Note);
exports.updateNote = factoryHandler.updateOne(Note);
exports.deleteNote = factoryHandler.deleteOne(Note);
