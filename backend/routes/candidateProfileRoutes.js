const express = require("express");

const router = express.Router();

const {
  getCandidateProfile,
  updateCandidateProfile,

  addCandidateEducation,
  updateCandidateEducation,
  deleteCandidateEducation,

  addCandidateExperience,
  updateCandidateExperience,
  deleteCandidateExperience,

  uploadCandidateResume,
  uploadCandidateProfileImage,
} = require("../controllers/candidateProfileController");

const candidateAuthMiddleware = require("../middleware/candidateAuthMiddleware");

const uploadResume = require("../middleware/resumeUploadMiddleware");
const uploadProfileImage = require("../middleware/profileImageUploadMiddleware");

/* =====================================
   GET LOGGED-IN CANDIDATE PROFILE
===================================== */

router.get("/", candidateAuthMiddleware, getCandidateProfile);

/* =====================================
   UPDATE LOGGED-IN CANDIDATE PROFILE
===================================== */

router.put("/", candidateAuthMiddleware, updateCandidateProfile);

/* =====================================
   EDUCATION ROUTES
===================================== */

router.post("/education", candidateAuthMiddleware, addCandidateEducation);

router.put(
  "/education/:educationId",
  candidateAuthMiddleware,
  updateCandidateEducation,
);

router.delete(
  "/education/:educationId",
  candidateAuthMiddleware,
  deleteCandidateEducation,
);

/* =====================================
   EXPERIENCE ROUTES
===================================== */

router.post("/experience", candidateAuthMiddleware, addCandidateExperience);

router.put(
  "/experience/:experienceId",
  candidateAuthMiddleware,
  updateCandidateExperience,
);

router.delete(
  "/experience/:experienceId",
  candidateAuthMiddleware,
  deleteCandidateExperience,
);


/* =====================================
   PROFILE IMAGE ROUTE
===================================== */

router.post(
  "/image",
  candidateAuthMiddleware,
  uploadProfileImage.single("profileImage"),
  uploadCandidateProfileImage,
);

/* =====================================
   RESUME ROUTE
===================================== */

router.post(
  "/resume",
  candidateAuthMiddleware,
  uploadResume.single("resume"),
  uploadCandidateResume,
);

module.exports = router;
