exports.createOne = (model) => {
  return async (req, res) => {
    const result = await model.create(req.body);

    res.status(200).json({
      status: "success",
      message: "Document created!",
      result: result,
    });
  };
};

exports.updateOne = (model) => {
  return async (req, res, next) => {
    const result = await model.findOneAndUpdate(
      { slug: req.params.name },
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Document updated!",
      result: result,
    });
  };
};

exports.deleteOne = (model) => {
  return async (req, res, next) => {
    const result = await model.delete({ slug: req.params.name });

    res.status(204).json({
      status: "success",
      message: "Document deleted!",
    });
  };
};

exports.getOne = (model) => {
  return async (req, res, next) => {
    const result = await model.findOne({ slug: req.params.name });

    res.status(200).json({
      status: "success",
      message: "Document fetched!",
      result: result,
    });
  };
};

exports.getAll = (model) => {
  return async (req, res, next) => {
    const result = await model.find();

    res.status(200).json({
      status: "success",
      message: "Documents fetched!",
      result: result,
    });
  };
};
