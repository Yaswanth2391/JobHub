const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    /* ===============================
       BASIC REGISTRATION DETAILS
    =============================== */

    fullName: {
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

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    /* ===============================
       SUPER ADMIN ACCOUNT STATUS
    =============================== */

    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },

    /* ===============================
       PERSONAL PROFILE DETAILS
    =============================== */

    location: {
      type: String,
      default: "",
      trim: true,
    },

    dateOfBirth: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    /* ===============================
       SKILLS
    =============================== */

    skills: {
      type: [String],
      default: [],
    },

   /* ===============================
   EDUCATION
================================ */

education: [
  {
    degree: {
      type: String,
      default: "",
    },

    institution: {
      type: String,
      default: "",
    },

    stream: {
      type: String,
      default: "",
    },

    cgpa: {
      type: String,
      default: "",
    },

    educationType: {
      type: String,
      default: "",
    },

    startYear: {
      type: String,
      default: "",
    },

    endYear: {
      type: String,
      default: "",
    },
  },
],
    /* ===============================
       EXPERIENCE
    =============================== */

    experience: [
      {
        company: {
          type: String,
          default: "",
          trim: true,
        },

        role: {
          type: String,
          default: "",
          trim: true,
        },

        startDate: {
          type: String,
          default: "",
        },

        endDate: {
          type: String,
          default: "",
        },

        description: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],

    /* ===============================
       RESUME
    =============================== */

    resume: {
      name: {
        type: String,
        default: "",
      },

      url: {
        type: String,
        default: "",
      },

      uploadedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
