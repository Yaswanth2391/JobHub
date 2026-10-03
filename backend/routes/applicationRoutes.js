const express = require("express");

const router = express.Router();

const {
  applyForJob,
  getMyApplications,
  getApplicationById,
  deleteApplication,
} = require(
  "../controllers/applicationController"
);


// ======================================
// CANDIDATE AUTH MIDDLEWARE
// ======================================

const candidateAuthMiddleware = require(
  "../middleware/candidateAuthMiddleware"
);


// ======================================
// APPLY FOR JOB
// ======================================

router.post(
  "/apply",
  candidateAuthMiddleware,
  applyForJob
);


// ======================================
// GET MY APPLICATIONS
// ======================================

router.get(
  "/my-applications",
  candidateAuthMiddleware,
  getMyApplications
);


// ======================================
// GET SINGLE APPLICATION
// ======================================

router.get(
  "/:applicationId",
  candidateAuthMiddleware,
  getApplicationById
);


// ======================================
// DELETE APPLICATION
// ======================================

router.delete(
  "/:applicationId",
  candidateAuthMiddleware,
  deleteApplication
);


module.exports = router;