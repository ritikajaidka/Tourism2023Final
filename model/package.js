const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const packageSchema = new Schema(
  {
    packageTitle: {
      type: String,
    },
    packageDescription: {
      type: String,
    },
    packageItinerary: {
      type: String,
    },
    packageSlot: {
      type: Number,
    },
    packageSlotUsed: {
      type: Number,
      default: 0,
    },
    packageDuration: {
      type: String,
    },
    packageRoutes: [
      {
        type: String,
      },
    ],
    packageViews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "pending",
    },
    packagePrice: {
      type: String,
    },
    packageImage: {
      type: String,
    },
    booked: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booked",
      },
    ],

    packageGuide: {
      type: Schema.Types.ObjectId,
      ref: "Guide",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
