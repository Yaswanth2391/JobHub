const express = require("express");

const router = express.Router();

const {
  createJob,
  getCompanyJobs,
  getCompanyJobById,
  updateCompanyJob,
  deleteCompanyJob,
} = require("../controllers/companyJobController");

const companyAdminAuthMiddleware =
  require("../middleware/companyAdminAuthMiddleware");

// Create a new job
router.post("/", companyAdminAuthMiddleware, createJob);

// Get all jobs of logged-in company admin
router.get("/", companyAdminAuthMiddleware, getCompanyJobs);

// Get single job
router.get("/:jobId", companyAdminAuthMiddleware, getCompanyJobById);

// Edit / Update job
router.put("/:jobId", companyAdminAuthMiddleware, updateCompanyJob);

// Delete job
router.delete("/:jobId", companyAdminAuthMiddleware, deleteCompanyJob);

module.exports = router;