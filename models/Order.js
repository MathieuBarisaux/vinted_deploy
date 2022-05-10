const mongoose = require("mongoose");

const Order = mongoose.model("Order", {
  amount: Number,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
  },
  custumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Order;
