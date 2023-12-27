const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv/config");

router.get("/", async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");
    if (!userList) {
      res.status(400).json({
        success: false,
        message: "No user found",
      });
    }
    res.status(200).send(userList);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      res.status(400).json({
        success: false,
        message: "No user found",
      });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      street: req.body.street,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
    });
    user = await user.save();
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User cannot be created",
      });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

// Sign up or Register
router.post("/register", async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      street: req.body.street,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
    });
    user = await user.save();
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User cannot be created",
      });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

// LOGIN UP request
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
    } else {
      const isPasswordValid = bcrypt.compareSync(
        req.body.password,
        user.passwordHash
      );
      const secret = process.env.SECRET;
      if (isPasswordValid) {
        const token = jwt.sign(
          {
            userId: user.id,
            isAdmin: user.isAdmin,
            // to seperate user and admin passed as secret info
          },
          secret,
          {
            expiresIn: "1d",
          }
        );
        res.status(200).json({ email: user.email, token: token });
      } else {
        res.status(400).send("Invalid password");
      }
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    if (!userCount) {
      res.status(400).json({
        success: false,
        message: "Ther are no users",
      });
    } else {
      res.status(200).json({
        success: true,
        userCount: userCount,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send({
      success: false,
      error: err,
    });
  }
});

module.exports = router;