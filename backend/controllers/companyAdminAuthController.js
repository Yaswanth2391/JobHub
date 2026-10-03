const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CompanyAdmin = require("../models/CompanyAdmin");
const PlatformSettings = require("../models/PlatformSettings");

/* =====================================
   CREATE COMPANY ADMIN TOKEN
===================================== */

const createCompanyAdminToken = (adminId) => {
  return jwt.sign(
    {
      id: adminId,
      role: "companyAdmin",
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d",
    },
  );
};

/* =====================================
   COMPANY ADMIN SIGN UP
===================================== */

const registerCompanyAdmin = async (req, res) => {
  try {
    const { companyName, email, phone, password } = req.body;

    const platformSettings = await PlatformSettings.findOne({});

    if (platformSettings?.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: "JobHub is currently in maintenance mode. Please try again later.",
      });
    }

    if (platformSettings?.allowNewRegistrations === false) {
      return res.status(403).json({
        success: false,
        message: "New registrations are currently disabled.",
      });
    }

    /* ===============================
       VALIDATION
    =============================== */

    if (!companyName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,

        message: "All fields are required",
      });
    }

    /* ===============================
       CHECK EXISTING EMAIL
    =============================== */

    const existingAdmin = await CompanyAdmin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,

        message: "An account already exists with this email",
      });
    }

    /* ===============================
       HASH PASSWORD
    =============================== */

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ===============================
       CREATE COMPANY ADMIN
    =============================== */

    const companyAdmin = await CompanyAdmin.create({
      companyName,

      email,

      phone,

      password: hashedPassword,
    });

    /* ===============================
       CREATE TOKEN
    =============================== */

    const token = createCompanyAdminToken(companyAdmin._id);

    /* ===============================
       RESPONSE
    =============================== */

    return res.status(201).json({
      success: true,

      message: "Company account created successfully",

      token,

      companyAdmin: {
        id: companyAdmin._id,

        companyName: companyAdmin.companyName,

        email: companyAdmin.email,

        phone: companyAdmin.phone,
      },
    });
  } catch (error) {
    console.error("Company Admin Signup Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error while creating company account",
    });
  }
};

/* =====================================
   COMPANY ADMIN LOGIN
===================================== */

const loginCompanyAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ===============================
       VALIDATION
    =============================== */

    if (!email || !password) {
      return res.status(400).json({
        success: false,

        message: "Email and password are required",
      });
    }

    /* ===============================
       FIND COMPANY ADMIN
    =============================== */

    const companyAdmin = await CompanyAdmin.findOne({
      email: email.toLowerCase(),
    });

    /* ===============================
       CHECK ACCOUNT
    =============================== */

    if (!companyAdmin) {
      return res.status(401).json({
        success: false,

        message: "Invalid email or password",
      });
    }

    if (companyAdmin.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: `This account is ${String(companyAdmin.status || "inactive").toLowerCase()}`,
      });
    }

    /* ===============================
       CHECK PASSWORD
    =============================== */

    const isPasswordCorrect = await bcrypt.compare(
      password,
      companyAdmin.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,

        message: "Invalid email or password",
      });
    }

    /* ===============================
       CREATE TOKEN
    =============================== */

    const token = createCompanyAdminToken(companyAdmin._id);

    /* ===============================
       LOGIN SUCCESS RESPONSE
    =============================== */

    return res.status(200).json({
      success: true,

      message: "Login successful",

      token,

      companyAdmin: {
        id: companyAdmin._id,

        companyName: companyAdmin.companyName,

        email: companyAdmin.email,

        phone: companyAdmin.phone,
      },
    });
  } catch (error) {
    console.error("Company Admin Login Error:", error);

    return res.status(500).json({
      success: false,

      message: "Server error while logging in",
    });
  }
};

/* =====================================
   EXPORT CONTROLLERS
===================================== */

module.exports = {
  registerCompanyAdmin,
  loginCompanyAdmin,
};
