// dotenv
require("dotenv").config();

// Express
const express = require("express");
const app = express();

// Express formidable
const formidable = require("express-formidable");
app.use(formidable());

// CORS
const cors = require("cors");
app.use(cors());

// Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

// Roads
const userRoad = require("./routes/user");
app.use(userRoad);
const offerRoad = require("./routes/offer");
app.use(offerRoad);

// ** 404 not found **
app.all("*", (req, res) => {
  try {
    res.status(404).json({ message: "404 not found" });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/***********************************/
app.listen(process.env.PORT, () => {
  console.log("Server on the moon");
});
