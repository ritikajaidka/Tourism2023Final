const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const guideSchema = new Schema(
  {
    guideName: {
      type: String,
    },
    guideEmail: {
      type: String,
    },
    guidePassword: {
      type: String,
    },
    guideAccepted: {
      type: Boolean,
      default: false,
    },
    guidePhone: {
      type: String,
      default: "",
    },
    guideImage: {
      type: String,
    },
    guideAddress: {
      type: String,
      default: "",
    },
    guideState: {
      type: String,
      default: "",
    },
    guideCity: {
      type: String,
      default: "",
    },
    guideOrganization: {
      type: String,
      default: "",
    },
    guideEducation: {
      type: String,
      default: "",
    },
    guideCountry: {
      type: String,
      default: "",
    },

    profileComplete: {
      type: Boolean,
      default: false,
    },
    blogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
    packages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Package",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guide", guideSchema);
