const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    avatar: {
      type: Object,
      default:
        "https://res.cloudinary.com/vintedcopy/image/upload/v1652180143/vinted/Users/default/06_gcg01t.png",
    },
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
