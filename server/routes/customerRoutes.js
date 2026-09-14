const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");
const customerAuth = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// CUSTOMER SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: "Name, phone number and password are required.",
      });
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!/^[a-zA-Z\s]{1,50}$/.test(trimmedName)) {
      return res.status(400).json({
        message: "Please enter a valid name.",
      });
    }

    if (!/^[6-9][0-9]{9}$/.test(trimmedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existingCustomer = await Customer.findOne({
      phone: trimmedPhone,
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "An account with this phone number already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name: trimmedName,
      phone: trimmedPhone,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(201).json({
      message: "Account created successfully.",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.log("Customer signup error:", error);

    res.status(500).json({
      message: "Failed to create account.",
      error: error.message,
    });
  }
});

// CUSTOMER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone number and password are required.",
      });
    }

    const trimmedPhone = phone.trim();

    if (!/^[6-9][0-9]{9}$/.test(trimmedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    const customer = await Customer.findOne({
      phone: trimmedPhone,
    });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid phone number or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, customer.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid phone number or password.",
      });
    }

    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      message: "Login successful.",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.log("Customer login error:", error);

    res.status(500).json({
      message: "Login failed.",
      error: error.message,
    });
  }
});

router.get("/me", customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId).select(
      "-password",
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    res.json({
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
    });
  } catch (error) {
    console.log("Customer profile error:", error);

    res.status(500).json({
      message: "Failed to fetch customer profile.",
      error: error.message,
    });
  }
});

module.exports = router;
