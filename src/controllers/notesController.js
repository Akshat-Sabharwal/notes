const Note = require("../models/Note");
const factoryHandler = require("../utils/factoryHandlers");
const { errorHandler } = require("../errors/errorHandlers");

exports.getNote = errorHandler(factoryHandler.getOne(Note));
exports.createNote = errorHandler(factoryHandler.createOne(Note));
