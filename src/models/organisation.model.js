const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    picture: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    headquarter: {
      type: String,
      required: true,
    },
    contact: {
      type: String
    },
  },
  {
    timestamps: true,
  }
);

const Organisation = mongoose.model("Organisation", schema);

module.exports.Organisation = Organisation;
