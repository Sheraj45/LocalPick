const express = require("express");
const Product = require("../models/product");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const validateProductData = (data) => {
  const { name, category, price, capacity } = data;

  if (!name || !name.trim()) {
    return "Product name is required.";
  }

  if (!category || !category.trim()) {
    return "Product category is required.";
  }

  if (price === undefined || price === "" || isNaN(Number(price))) {
    return "A valid price is required.";
  }

  if (Number(price) < 0) {
    return "Price cannot be negative.";
  }

  if (!capacity || !capacity.trim()) {
    return "Product capacity is required.";
  }

  return null;
};

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    console.log("Product fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.log("Product fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// CREATE product
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const validationError = validateProductData(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "localpick/products" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        stream.end(req.file.buffer);
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const product = await Product.create({
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      capacity: req.body.capacity,
      image: imageUrl,
      imagePublicId: imagePublicId,
      description: req.body.description,
      available: req.body.available === "true",
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Product creation error:", error);

    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// UPDATE product
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const validationError = validateProductData(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const updateData = {
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      capacity: req.body.capacity,
      description: req.body.description,
      available: req.body.available === "true" || req.body.available === true,
    };

    // Upload new image only if admin selected one
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "localpick/products" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        stream.end(req.file.buffer);
      });

      updateData.image = result.secure_url;
      updateData.imagePublicId = result.public_id;

      // Delete old image after new image uploads successfully
      if (existingProduct.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(existingProduct.imagePublicId);
        } catch (cloudinaryError) {
          console.log("Old Cloudinary image deletion error:", cloudinaryError);
        }
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(product);
  } catch (error) {
    console.log("Product update error:", error);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// DELETE product
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Delete image from Cloudinary
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (cloudinaryError) {
        console.log("Cloudinary image deletion error:", cloudinaryError);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log("Product deletion error:", error);

    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

module.exports = router;
