const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    commentContent: {
      type: String,
    },
    commentAuthorType: {
      type: String, //guide or tourist
    },
    commentAuthorGuide: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
    },
    commentAuthorTourist: {
      type: Schema.Types.ObjectId,
      ref: "Tourist",
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reply",
      },
    ],
    commentBlog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
