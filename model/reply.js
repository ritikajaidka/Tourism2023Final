const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema(
  {
    replyContent: {
      type: String,
    },
    replyAuthorType: {
      type: String, //guide or tourist
    },
    replyAuthorGuide: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
    },
    replyAuthorTourist: {
      type: Schema.Types.ObjectId,
      ref: "Tourist",
    },
    replyComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Reply", replySchema);
