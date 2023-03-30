const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookedSchema = new Schema(
  {
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
    },
    tourist: {
      type: Schema.Types.ObjectId,
      ref: "Tourist",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    // status: {
    //   type: String,
    //   default: "pending",
    // },
    passengerDetails: [
      {
        name: {
          type: String,
        },
        age: {
          type: Number,
        },
      },
    ],
    contactNo: {
      type: String,
    },
    address: {
      type: String,
    },
    totalAmount: {
      type: Number,
    },
    // paymentStatus: {
    //   type: String,
    //   default: "pending",
    // },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    pincode: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Booked", bookedSchema);
