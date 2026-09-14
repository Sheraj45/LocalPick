const jwt = require("jsonwebtoken");

const customerAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not Authorized. customer token required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.customerId = decoded.customerId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired customer token.",
    });
  }
};

module.exports = customerAuth;
