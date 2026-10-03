const mongoose = require("mongoose");


const jobSchema = new mongoose.Schema(
  {
    /* =====================================
       COMPANY ADMIN
    ===================================== */

    companyAdmin: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "CompanyAdmin",

      required: true,
    },


    /* =====================================
       COMPANY INFORMATION
    ===================================== */

    companyName: {
      type: String,

      default: "",

      trim: true,
    },


    companyLogo: {
      type: String,

      default: "",
    },


    /* =====================================
       JOB DETAILS
    ===================================== */

    jobTitle: {
      type: String,

      required: true,

      trim: true,
    },


    department: {
      type: String,

      required: true,

      trim: true,
    },


    jobType: {
      type: String,

      enum: [
        "Full Time",
        "Part Time",
        "Internship",
        "Contract",
        "Remote",
      ],

      required: true,
    },


    location: {
      type: String,

      required: true,

      trim: true,
    },


    experience: {
      type: String,

      required: true,

      trim: true,
    },


    openings: {
      type: Number,

      required: true,

      min: 1,
    },


    description: {
      type: String,

      required: true,

      trim: true,
    },


    skills: {
      type: [String],

      default: [],
    },


    /* =====================================
       APPLICATION
    ===================================== */

    applicationDeadline: {
      type: Date,

      required: true,
    },


    /* =====================================
       JOB STATUS
    ===================================== */

    status: {
      type: String,

      enum: [
        "draft",
        "published",
        "closed",
      ],

      default: "draft",
    },
  },

  {
    timestamps: true,
  },
);


module.exports = mongoose.model(
  "Job",

  jobSchema,
);