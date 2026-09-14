const express = require("express");
const Booking = require("../models/booking");
const Order = require("../models/order");
const Product = require("../models/product");
const Customer = require("../models/customer");

const protect = require("../middleware/authMiddleware");
const customerAuth = require("../middleware/customerAuthMiddleware");

console.log("ORDER MODEL:", Order);
console.log("ORDER FIND:", typeof Order.find);

const router = express.Router();

// ======================================================
// GET ALL BOOKINGS
// Admin only
// ======================================================
router.get("/", protect, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({
      createdAt: -1,
    });

    res.json(bookings);
  } catch (error) {
    console.log("Booking fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

// ======================================================
// GET CURRENT CUSTOMER'S BOOKINGS
// Customer only
// ======================================================
router.get("/my", customerAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.customerId,
    }).sort({
      createdAt: -1,
    });

    res.json(bookings);
  } catch (error) {
    console.log("Customer bookings fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch your bookings.",
      error: error.message,
    });
  }
});

router.get("/orders/my", customerAuth, async (req, res) => {
  try {
    console.log("ORDERS/MY ROUTE HIT");
    console.log("ORDER INSIDE ROUTE:", Order);
    console.log("ORDER.FIND INSIDE ROUTE:", typeof Order.find);

    const orders = await Order.find({
      customerId: req.customerId,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.log("Customer orders fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch your orders.",
      error: error.message,
    });
  }
});

// ====================================================== // GET ALL ORDERS // Admin only // ======================================================
router.get("/orders", protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log("Admin orders fetch error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch orders.", error: error.message });
  }
});

// ======================================================
// UPDATE ORDER
// Admin only
// ======================================================
router.put("/orders/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    res.json(order);
  } catch (error) {
    console.log("Admin order update error:", error);

    res.status(500).json({
      message: "Failed to update order.",
      error: error.message,
    });
  }
});

// ======================================================
// CREATE BOOKING
// Customer only
// ======================================================

router.post("/", customerAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty.",
      });
    }

    const customer = await Customer.findById(req.customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    const productIds = items.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== items.length) {
      return res.status(404).json({
        message: "One or more products could not be found.",
      });
    }

    const orderItems = [];

    for (const item of items) {
      const product = products.find(
        (product) => product._id.toString() === item.productId,
      );

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: `Invalid quantity for ${product.name}.`,
        });
      }

      if (!product.available) {
        return res.status(400).json({
          message: `${product.name} is currently unavailable.`,
        });
      }

      orderItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        capacity: product.capacity,
        quantity,
      });
    }

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      customerId: customer._id,
      customerName: customer.name,
      phone: customer.phone,
      items: orderItems,
      totalAmount,
      status: "Pending",
    });

    res.status(201).json({
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    console.log("Order creation error:", error);

    res.status(500).json({
      message: "Failed to create order.",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE BOOKING
// Admin only
// ======================================================
router.put("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(booking);
  } catch (error) {
    console.log("Booking update error:", error);

    res.status(500).json({
      message: "Failed to update booking",
      error: error.message,
    });
  }
});

module.exports = router;
