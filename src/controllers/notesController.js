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
  if (req.user.notes.length >= req.user.subscription.maxNotes) {
    return next(
      new ServerError(
        "Note limit reached! Upgrade plan to create more notes!",
      ),
    );
  }

  const notes = await Note.find({ author: req.user._id });

  if (notes.some((note) => note.title === req.body.title)) {
    return next(
      new ResourceError(
        `Note named ${req.body.title} already exists!`,
      ),
    );
  }

  const result = await Note.create({
    title: req.body.title,
    description: req.body.description,
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
    result,
  });
});

exports.getNote = errorHandler(async (req, res, next) => {
  let result = await Note.findOne({
    slug: req.params.name,
    author: req.user._id,
  });

  if (!result) {
    return next(new ResourceError("Document not found!"));
  }

  res.status(200).json({
    status: "success",
    message: "Document fetched!",
    result,
  });
});

exports.deleteNote = errorHandler(async (req, res, next) => {
  const note = await Note.findOne({
    slug: req.params.name,
    author: req.user._id,
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
    result: notes,
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

exports.updateNote = errorHandler(async (req, res, next) => {
  const notes = await Note.find({ author: req.user._id });

  if (req.body.title) {
    if (notes.some((note) => note.title === req.body.title)) {
      return next(
        new ResourceError(
          `Note named ${req.body.title} already exists!`,
        ),
      );
    }
  }

  const note = notes.filter(
    (note) => note.slug === req.params.name,
  )[0];

  if (!note) {
    return next(new ResourceError("Document not found!"));
  }

  const updatedNote = Object.assign(note, req.body);
  await note.save();

  res.status(200).json({
    status: "success",
    message: "Document updated!",
    result: updatedNote,
  });
});
