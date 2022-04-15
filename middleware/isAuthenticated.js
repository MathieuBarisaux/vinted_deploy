const mongoose = require("mongoose");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const bearerToken = req.headers.authorization.replace("Bearer ", "");

    const findUser = await User.findOne({ token: bearerToken });

    if (findUser) {
      req.fields._id = findUser;
      next();
    } else {
      res.status(401).json("Unauthorized");
    }
  } else {
    res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthenticated;
