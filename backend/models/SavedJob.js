const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/* =====================================
   PREVENT DUPLICATE SAVED JOBS
===================================== */

savedJobSchema.index(
  {
    candidate: 1,
    job: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model(
  "SavedJob",
  savedJobSchema,
);