const express = require("express");

const router = express.Router();

const {
  getAllJobs,
  getJobById,
  getPlatformStats,
} = require("../controllers/jobController");

/* =====================================
   GET ALL JOBS
===================================== */

router.get(
  "/",
  getAllJobs,
);

/* =====================================
   GET PLATFORM STATISTICS
===================================== */

router.get(
  "/stats",
  getPlatformStats,
);

/* =====================================
   GET SINGLE JOB
===================================== */

router.get(
  "/:jobId",
  getJobById,
);

module.exports = router;