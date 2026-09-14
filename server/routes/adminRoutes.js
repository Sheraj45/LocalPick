const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login Successful",
      token,
    });
  } catch (error) {
    console.log("Admin login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

module.exports = router;
