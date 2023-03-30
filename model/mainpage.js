const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mainpageSchema = Schema({
  carouselImage: {
    type: String,
  },
  trendingsPackage: {
    type: Schema.Types.ObjectId,
    ref: "Package",
  },
});

module.exports = mongoose.model("MainPage", mainpageSchema);
