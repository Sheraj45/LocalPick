require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Admin.findOne({
      username: "admin",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await Admin.create({
      username: "admin",
      password: hashedPassword,
    });

    console.log("Admin created successfully!");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
