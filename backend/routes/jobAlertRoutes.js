const express = require("express");

const router = express.Router();

const candidateAuthMiddleware = require(
  "../middleware/candidateAuthMiddleware"
);

const {
  getMyJobAlerts,
  getMyJobAlertMatches,
  createJobAlert,
  updateJobAlert,
  toggleJobAlert,
  markJobAlertMatchViewed,
  deleteJobAlert,
} = require(
  "../controllers/jobAlertController"
);

/* =====================================
   GET MY JOB ALERTS
===================================== */

router.get(
  "/",
  candidateAuthMiddleware,
  getMyJobAlerts
);

/* =====================================
   GET MATCHING JOBS
===================================== */

router.get(
  "/matches",
  candidateAuthMiddleware,
  getMyJobAlertMatches
);

/* =====================================
   CREATE JOB ALERT
===================================== */

router.post(
  "/",
  candidateAuthMiddleware,
  createJobAlert
);

/* =====================================
   UPDATE JOB ALERT
===================================== */

router.put(
  "/:alertId",
  candidateAuthMiddleware,
  updateJobAlert
);

/* =====================================
   TOGGLE JOB ALERT
===================================== */

router.patch(
  "/:alertId/toggle",
  candidateAuthMiddleware,
  toggleJobAlert
);

/* =====================================
   MARK MATCH AS VIEWED
===================================== */

router.patch(
  "/:alertId/matches/:jobId/viewed",
  candidateAuthMiddleware,
  markJobAlertMatchViewed
);

/* =====================================
   DELETE JOB ALERT
===================================== */

router.delete(
  "/:alertId",
  candidateAuthMiddleware,
  deleteJobAlert
);

/* =====================================
   EXPORT ROUTER
===================================== */

module.exports = router;