const {
  MongoError,
  ServerError,
  ResourceError,
} = require("../errors/errorClasses");
const { errorHandler } = require("../errors/errorHandlers");
const Note = require("../models/Note");
const factoryHandler = require("../utils/factoryHandlers");

exports.createNote = errorHandler(async (req, res, next) => {
  console.log(req.user);
  if (req.user.notes.length >= req.user.subscription.maxNotes) {
    return next(
      new ServerError(
        "Note limit reached! Upgrade plan to create more notes!",
      ),
    );
  }
  const result = await Note.create({
    title: req.body.title,
    text: req.body.text,
    tags: req.body.tags,
    author: req.user._id,
  });

  req.user.notes.push(result._id);
  await req.user.save();

  res.status(200).json({
    status: "success",
    message: "Document created!",
    result: result,
  });
});

exports.getNote = errorHandler(async (req, res, next) => {
  const result = await Note.findOne({
    slug: req.params.name,
  });

  if (!result) {
    return next(new ResourceError("Document not found!"));
  }

  res.status(200).json({
    status: "success",
    message: "Document fetched!",
    result: result,
  });
});

exports.deleteNote = errorHandler(async (req, res, next) => {
  const note = await Note.findOne({
    slug: req.params.name,
  });

  if (!note) {
    return next(new ResourceError("Note not found!"));
  }

  await Note.deleteOne({ _id: note._id });

  req.user.notes.splice(req.user.notes.indexOf(note._id), 1);
  await req.user.save();

  res.status(204).json({
    status: "success",
    message: "Note deleted!",
  });
});

exports.getAllNotes = errorHandler(async (req, res, next) => {
  const notes = await Note.find({ name: req.user.name });

  if (!notes) {
    return next(new MongoError("Notes could not be fetched!"));
  }

  res.status(200).json({
    status: "success",
    message: "Notes fetched!",
    data: notes,
  });
});

exports.updateNote = factoryHandler.updateOne(Note);
