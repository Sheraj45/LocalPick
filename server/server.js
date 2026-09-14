require("dotenv").config();
const connectDB = require("./db");
const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const BookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/api/test", (req, res) => {
  res.json({
    message: "LocalPick API is working!",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`LocalPick server running on port ${PORT}`);
});
