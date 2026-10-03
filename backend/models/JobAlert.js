const mongoose = require("mongoose");

/* =====================================
   MATCHED JOB SUB-SCHEMA
===================================== */

const jobAlertMatchSchema =
  new mongoose.Schema(
    {
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
      },

      matchedOn: {
        type: [String],
        default: [],
      },

      matchedAt: {
        type: Date,
        default: Date.now,
      },

      viewedAt: {
        type: Date,
        default: null,
      },
    },
    {
      _id: false,
    }
  );

/* =====================================
   JOB ALERT SCHEMA
===================================== */

const jobAlertSchema =
  new mongoose.Schema(
    {
      /* =====================================
         CANDIDATE
      ===================================== */

      candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
        index: true,
      },

      /* =====================================
         ALERT NAME
      ===================================== */

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      /* =====================================
         KEYWORDS / SKILLS
      ===================================== */

      keywords: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      /* =====================================
         LOCATION
      ===================================== */

      location: {
        type: String,
        default: "",
        trim: true,
        maxlength: 150,
      },

      /* =====================================
         EMPLOYMENT TYPE
      ===================================== */

      employmentType: {
        type: String,
        enum: [
          "All",
          "Full Time",
          "Part Time",
          "Internship",
          "Contract",
          "Remote",
        ],
        default: "All",
      },

      /* =====================================
         FREQUENCY
      ===================================== */

      frequency: {
        type: String,
        enum: [
          "Instant",
          "Daily",
          "Weekly",
        ],
        default: "Daily",
      },

      /* =====================================
         ENABLE / DISABLE
      ===================================== */

      enabled: {
        type: Boolean,
        default: true,
        index: true,
      },

      /* =====================================
         MATCHED JOBS
      ===================================== */

      matches: {
        type: [jobAlertMatchSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

/* =====================================
   INDEXES
===================================== */

jobAlertSchema.index({
  candidate: 1,
  enabled: 1,
});

jobAlertSchema.index({
  candidate: 1,
  createdAt: -1,
});

/* =====================================
   CREATE / GET MODEL
===================================== */

const JobAlert =
  mongoose.models.JobAlert ||
  mongoose.model(
    "JobAlert",
    jobAlertSchema
  );

/* =====================================
   EXPORT MODEL DIRECTLY
===================================== */

module.exports = JobAlert;