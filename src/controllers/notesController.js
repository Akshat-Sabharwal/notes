const {
  MongoError,
  ServerError,
  ResourceError,
} = require("../errors/errorClasses");
const { errorHandler } = require("../errors/errorHandlers");
const Note = require("../models/Note");
const User = require("../models/User");
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

  await User.updateOne(
    { _id: req.user._id },
    { $push: { notes: result._id } },
  );

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
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { notes: note._id } },
  );

  res.status(204).json({
    status: "success",
    message: "Note deleted!",
  });
});

exports.getAllNotes = errorHandler(async (req, res, next) => {
  const notes = await Note.find({ author: req.user._id });

  if (!notes) {
    return next(new MongoError("Notes could not be fetched!"));
  }

  res.status(200).json({
    status: "success",
    message: "Notes fetched!",
    data: notes,
  });
});

exports.deleteAllNotes = errorHandler(async (req, res, next) => {
  await Note.deleteMany({ author: req.user._id });
  await User.updateOne(
    { _id: req.user._id },
    { $set: { notes: [] } },
  );

  res.status(204).json({
    status: "success",
    message: "Notes deleted!",
  });
});

exports.updateNote = factoryHandler.updateOne(Note);
