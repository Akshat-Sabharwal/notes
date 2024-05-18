const {
  ResourceError,
  MongoError,
} = require("../errors/errorClasses");
const { errorHandler } = require("../errors/errorHandlers");

exports.createOne = (model) => {
  return errorHandler(async (req, res) => {
    const result = await model.create(req.body);

    res.status(200).json({
      status: "success",
      message: "Document created!",
      result: result,
    });
  });
};

exports.updateOne = (model) => {
  return errorHandler(async (req, res, next) => {
    const result = await model
      .findOne({ slug: req.params.name })
      .select("+slug");

    if (!result) {
      return next(new ResourceError("Document not found!"));
    }

    Object.assign(result, req.body);
    await result.save();

    res.status(200).json({
      status: "success",
      message: "Document updated!",
      result: result,
    });
  });
};

exports.deleteOne = (model) => {
  return errorHandler(async (req, res, next) => {
    const result = await model.findOneAndDelete({
      slug: req.params.name,
    });

    if (!result) {
      return next(new ResourceError("Document not found!"));
    }

    res.status(204).json({
      status: "success",
      message: "Document deleted!",
    });
  });
};

exports.getOne = (model) => {
  return errorHandler(async (req, res, next) => {
    const result = await model.findOne({ slug: req.params.name });

    if (!result) {
      return next(new ResourceError("Document not found!"));
    }

    res.status(200).json({
      status: "success",
      message: "Document fetched!",
      result: result,
    });
  });
};

exports.getAll = (model) => {
  return errorHandler(async (req, res, next) => {
    const result = await model.find();

    if (!result) {
      return next(new MongoError("Documents could not be fetched!"));
    }

    res.status(200).json({
      status: "success",
      message: "Documents fetched!",
      result: result,
    });
  });
};

exports.deleteAll = (model) => {
  return errorHandler(async (req, res, next) => {
    await model.deleteMany({});

    res.status(204).json({
      status: "success",
      message: "Documents deleted!",
    });
  });
};
