const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SuperAdmin = require("../models/SuperAdmin");

const createSuperAdminToken = (adminId) => {
  return jwt.sign(
    {
      id: adminId,
      role: "superAdmin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (superAdmin.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "This super admin account is inactive",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      superAdmin.password,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    superAdmin.lastLoginAt = new Date();
    await superAdmin.save();

    const token = createSuperAdminToken(
      superAdmin._id,
    );

    return res.status(200).json({
      success: true,
      message: "Super admin login successful",
      token,
      superAdmin: {
        id: superAdmin._id,
        fullName: superAdmin.fullName,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    console.error("Super Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while logging in",
    });
  }
};

const getSuperAdminMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    superAdmin: {
      id: req.superAdmin._id,
      fullName: req.superAdmin.fullName,
      email: req.superAdmin.email,
      role: req.superAdmin.role,
      status: req.superAdmin.status,
    },
  });
};

module.exports = {
  loginSuperAdmin,
  getSuperAdminMe,
};
