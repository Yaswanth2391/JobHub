const CompanyAdmin = require("../models/CompanyAdmin");

/* =====================================
   GET COMPANY ADMIN PROFILE
===================================== */

const getCompanyAdminProfile = async (req, res) => {
  try {
    const adminId = req.companyAdmin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
      });
    }

    const companyAdmin = await CompanyAdmin.findById(adminId).select(
      "_id companyName email phone companyLogo createdAt updatedAt",
    );

    if (!companyAdmin) {
      return res.status(404).json({
        success: false,
        message: "Company admin account not found",
      });
    }

    return res.status(200).json({
      success: true,
      companyAdmin,
    });
  } catch (error) {
    console.error("Get Company Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while loading company profile",
    });
  }
};

/* =====================================
   UPDATE COMPANY ADMIN PROFILE
===================================== */

const updateCompanyAdminProfile = async (req, res) => {
  try {
    const adminId = req.companyAdmin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
      });
    }

    const {
      companyName,
      email,
      phone,
    } = req.body;

    /* ===============================
       VALIDATION
    =============================== */

    if (!companyName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, email and phone are required",
      });
    }

    const trimmedCompanyName = companyName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedCompanyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!trimmedPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    /* ===============================
       FIND CURRENT ACCOUNT
    =============================== */

    const companyAdmin = await CompanyAdmin.findById(adminId);

    if (!companyAdmin) {
      return res.status(404).json({
        success: false,
        message: "Company admin account not found",
      });
    }

    /* ===============================
       CHECK EMAIL AVAILABILITY
    =============================== */

    const existingAdmin = await CompanyAdmin.findOne({
      email: normalizedEmail,
      _id: { $ne: adminId },
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email",
      });
    }

    /* ===============================
       UPDATE BASIC PROFILE
    =============================== */

    companyAdmin.companyName = trimmedCompanyName;
    companyAdmin.email = normalizedEmail;
    companyAdmin.phone = trimmedPhone;

    /* ===============================
       UPDATE COMPANY LOGO
       Multer stores the uploaded
       file in req.file
    =============================== */

    if (req.file) {
      const companyLogoUrl = `${req.protocol}://${req.get(
        "host",
      )}/uploads/company-logos/${req.file.filename}`;

      companyAdmin.companyLogo = companyLogoUrl;
    }

    /* ===============================
       SAVE
    =============================== */

    await companyAdmin.save();

    /* ===============================
       RESPONSE
    =============================== */

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      companyAdmin: {
        id: companyAdmin._id,
        companyName: companyAdmin.companyName,
        email: companyAdmin.email,
        phone: companyAdmin.phone,
        companyLogo: companyAdmin.companyLogo || "",
        createdAt: companyAdmin.createdAt,
        updatedAt: companyAdmin.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Update Company Admin Profile Error:",
      error,
    );

    /* ===============================
       MULTER ERRORS
    =============================== */

    if (error?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Company logo must be smaller than 1 MB",
      });
    }

    /* ===============================
       DUPLICATE EMAIL
    =============================== */

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while updating company profile",
    });
  }
};

module.exports = {
  getCompanyAdminProfile,
  updateCompanyAdminProfile,
};