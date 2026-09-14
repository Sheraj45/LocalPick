const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    capacity: {
      type: String,
      required: true,
      trim: true,
    },

    image: { type: String, default: "" },

    imagePublicId: { type: String, default: "" },

    description: {
      type: String,
      default: "",
    },

    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const product = mongoose.model("Product", productSchema);

module.exports = product;
