const express = require("express");

const router = express.Router();

const {
  getCompanyApplications,
  getCompanyApplicationById,
  scheduleInterview,
  markApplicationAsHired,
  updateCompanyApplicationStatus,
  deleteCompanyApplication,
} = require("../controllers/companyApplicationController");

const companyAdminAuthMiddleware =
  require("../middleware/companyAdminAuthMiddleware");

// ======================================
// GET ALL COMPANY APPLICATIONS
// ======================================

router.get(
  "/",
  companyAdminAuthMiddleware,
  getCompanyApplications
);

// ======================================
// SCHEDULE INTERVIEW
// ======================================
//
// IMPORTANT:
// Keep the existing endpoint because
// ScheduleInterview.jsx already uses:
//
// POST /:applicationId/schedule-interview
//
// ======================================

router.post(
  "/:applicationId/schedule-interview",
  companyAdminAuthMiddleware,
  scheduleInterview
);

// ======================================
// GET SINGLE APPLICATION
// ======================================

router.get(
  "/:applicationId",
  companyAdminAuthMiddleware,
  getCompanyApplicationById
);

// ======================================
// MARK APPLICATION AS HIRED
// ======================================
//
// New hiring workflow:
//
// POST /:applicationId/hire
//
// Sends:
// - ctc
// - joiningDate
// - employmentType
// - workMode
// - location
// - notes
//
// ======================================

router.post(
  "/:applicationId/hire",
  companyAdminAuthMiddleware,
  markApplicationAsHired
);

// ======================================
// UPDATE APPLICATION STATUS
// ======================================

router.put(
  "/:applicationId/status",
  companyAdminAuthMiddleware,
  updateCompanyApplicationStatus
);

// ======================================
// DELETE APPLICATION
// ======================================

router.delete(
  "/:applicationId",
  companyAdminAuthMiddleware,
  deleteCompanyApplication
);

module.exports = router;