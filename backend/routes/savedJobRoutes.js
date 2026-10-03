const express = require("express");

const router = express.Router();

const candidateAuthMiddleware = require(
  "../middleware/candidateAuthMiddleware",
);

const {
  saveJob,
  getSavedJobs,
  removeSavedJob,
  checkSavedJob,
} = require("../controllers/savedJobController");

/* =====================================
   SAVE JOB
===================================== */

router.post(
  "/",
  candidateAuthMiddleware,
  saveJob,
);

/* =====================================
   GET SAVED JOBS
===================================== */

router.get(
  "/",
  candidateAuthMiddleware,
  getSavedJobs,
);

/* =====================================
   REMOVE SAVED JOB
===================================== */

router.delete(
  "/:jobId",
  candidateAuthMiddleware,
  removeSavedJob,
);

/* =====================================
   CHECK SAVED STATUS
===================================== */

router.get(
  "/check/:jobId",
  candidateAuthMiddleware,
  checkSavedJob,
);

module.exports = router;