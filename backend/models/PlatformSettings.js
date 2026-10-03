const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      default: "",
      trim: true,
    },

    body: {
      type: String,
      default: "",
    },

    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "JobHub",
      trim: true,
    },

    tagline: {
      type: String,
      default: "Find. Apply. Grow.",
      trim: true,
    },

    supportEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    allowNewRegistrations: {
      type: Boolean,
      default: true,
    },

    maxJobsPerCompany: {
      type: Number,
      default: 100,
      min: 1,
    },

    jobCategories: {
      type: [String],
      default: [
        "Software Development",
        "UI / UX Design",
        "Data & Analytics",
        "Product Management",
        "Marketing",
        "Sales",
        "Human Resources",
        "Finance",
        "Operations",
      ],
    },

    jobLocations: {
      type: [String],
      default: [],
    },

    emailTemplates: {
      type: [emailTemplateSchema],
      default: [],
    },

    systemConfiguration: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        sessionDays: 7,
        enableCandidateApplications: true,
        enableCompanyJobPosting: true,
        enableEmailNotifications: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "PlatformSettings",
  platformSettingsSchema,
);
