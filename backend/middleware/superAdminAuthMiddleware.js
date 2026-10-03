const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/SuperAdmin");

const superAdminAuthMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Super admin authorization required",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Super admin authorization required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    if (
      !decoded?.id ||
      decoded?.role !== "superAdmin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid super admin token",
      });
    }

    const superAdmin = await SuperAdmin.findById(
      decoded.id,
    ).select("_id fullName email role status");

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Super admin account not found",
      });
    }

    if (superAdmin.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Super admin account is inactive",
      });
    }

    req.superAdmin = superAdmin;

    return next();
  } catch (error) {
    console.error(
      "Super Admin Auth Middleware Error:",
      error.message,
    );

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired super admin token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to authorize super admin",
    });
  }
};

module.exports = superAdminAuthMiddleware;
