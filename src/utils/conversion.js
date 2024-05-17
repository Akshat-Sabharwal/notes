exports.convertToMs = (data, from) => {
  switch (from) {
    case "ms":
      return data;

    case "s":
      return this.convertToMs(data * 1000, "ms");

    case "min":
      return this.convertToMs(data * 60, "s");

    case "hr":
      return this.convertToMs(data * 60, "min");

    case "d":
      return this.convertToMs(data * 24, "hr");
  }
};
