const express = require("express");

const {
  registerCandidate,
  loginCandidate,
  getCandidateProfile,
  updateCandidateProfile,
  uploadCandidateResume,
} = require("../controllers/candidateAuthController");

const candidateAuthMiddleware = require("../middleware/candidateAuthMiddleware");

const uploadResume = require("../middleware/resumeUploadMiddleware");

const router = express.Router();

// =====================================
// REGISTER CANDIDATE
// =====================================

router.post("/register", registerCandidate);

// =====================================
// LOGIN CANDIDATE
// =====================================

router.post("/login", loginCandidate);

// =====================================
// GET CANDIDATE PROFILE
// =====================================

router.get("/profile", candidateAuthMiddleware, getCandidateProfile);

// =====================================
// UPDATE CANDIDATE PROFILE
// =====================================

router.put("/profile", candidateAuthMiddleware, updateCandidateProfile);

// =====================================
// UPLOAD / UPDATE RESUME
// =====================================

router.post(
  "/profile/resume",
  candidateAuthMiddleware,
  uploadResume.single("resume"),
  uploadCandidateResume,
);

module.exports = router;
