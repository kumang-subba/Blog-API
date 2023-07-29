const Admin = require("../models/admin");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
require("dotenv").config();

exports.sign_up = [
  body("username", "User name cannot be empty.")
    .trim()
    .isLength({ min: 1 })
    .custom(async (username) => {
      try {
        const userExists = await Admin.findOne({ username });
        if (userExists) {
          throw new Error("Username already exists.");
        }
      } catch (err) {
        throw new Error(err);
      }
    })
    .escape(),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 letters.")
    .escape(),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      const admin = new Admin({
        username: req.body.username,
        password: hashedPassword,
      });
      if (!errors.isEmpty()) {
        return res.json({
          errors: errors.array(),
        });
      } else {
        await admin.save();
        res.json({
          message: "Signed up successfully",
        });
      }
    });
  }),
];

exports.login = async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    try {
      if (err || !user) {
        return res.status(400).json({
          message: info ? info.message : "Login failed",
          user: user,
        });
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = { _id: user._id, username: user.username };
        const token = jwt.sign({ user: body }, process.env.SECRET_KEY);
        return res.json({ user, token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

exports.log_out = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
