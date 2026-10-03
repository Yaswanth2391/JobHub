const mongoose = require("mongoose");

const companyAdminSchema = new mongoose.Schema(
  {
    /* ===============================
       COMPANY BASIC DETAILS
    =============================== */

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    /* ===============================
       COMPANY LOGO
    =============================== */

    companyLogo: {
      type: String,
      default: "",
      trim: true,
    },

    /* ===============================
       SUPER ADMIN METADATA
    =============================== */

    industry: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      default: "Company Admin",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "CompanyAdmin",
  companyAdminSchema,
);