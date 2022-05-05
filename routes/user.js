const express = require("express");
const router = express.Router();

// import User model
const User = require("../models/User");

// import element for password
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Import cloudinary
const cloudinary = require("../tools/cloudinary");

// ** signup road **
router.post("/user/signup", async (req, res) => {
  try {
    if (req.fields.username) {
      const mailUser = await User.find({ email: req.fields.email });

      if (mailUser.length < 1) {
        const mdp = req.fields.password;
        const salt = uid2(64);
        const hash = SHA256(mdp + salt).toString(encBase64);
        const token = uid2(32); // for coockies connection

        const newUser = await new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
          },
          newsletter: req.fields.newsletter,
          salt: salt,
          hash: hash,
          token: token,
        });

        if (req.files.avatar) {
          const picture = req.files.avatar.path;
          const uploadAvatar = await cloudinary.uploader.upload(picture);

          newUser.account.avatar = uploadAvatar.secure_url;
        }

        await newUser.save();

        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: { username: newUser.account.username },
        });
      } else {
        res.status(400).json({ message: "This mail is untill use" });
      }
    } else {
      res.status(400).json({ message: "Need username" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// ** signin road **
router.post("/user/login", async (req, res) => {
  try {
    const userMail = req.fields.email;
    const password = req.fields.password;

    const findUser = await User.findOne({ email: userMail });

    if (findUser) {
      const testHash = SHA256(password + findUser.salt).toString(encBase64);

      if (testHash === findUser.hash) {
        res.status(200).json({ token: findUser.token });
      } else {
        res.status(400).json({ message: "Invalid password" });
      }
    } else {
      res.status(400).json({ message: "This mail doesn't exist" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
