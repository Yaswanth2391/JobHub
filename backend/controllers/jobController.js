const mongoose = require("mongoose");

const Job = require("../models/Job");
const CompanyAdmin = require("../models/CompanyAdmin");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");

/* =====================================
   GET ALL ACTIVE / PUBLISHED JOBS
===================================== */

const getAllJobs = async (req, res) => {
  try {
    /*
      Current jobs use:
      status = "published"

      Older jobs may use:
      status = "active"

      Show both on the candidate side.

      Draft and closed jobs remain hidden.
    */

    const jobs = await Job.find({
      status: {
        $in: [
          "published",
          "active",
        ],
      },
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error(
      "Get All Jobs Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch jobs",
    });
  }
};

/* =====================================
   GET SINGLE JOB
===================================== */

const getJobById = async (req, res) => {
  try {
    const { jobId } =
      req.params;

    // =====================================
    // VALIDATE JOB ID
    // =====================================

    if (
      !mongoose.Types.ObjectId.isValid(
        jobId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid job ID",
      });
    }

    // =====================================
    // FIND ACTIVE / PUBLISHED JOB
    // =====================================

    const job =
      await Job.findOne({
        _id: jobId,

        /*
          Support both:
          - New published jobs
          - Older active jobs
        */

        status: {
          $in: [
            "published",
            "active",
          ],
        },
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error(
      "Get Job By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch job",
    });
  }
};

/* =====================================
   GET JOBHUB PLATFORM STATISTICS
===================================== */

const getPlatformStats = async (req, res) => {
  try {
    /*
      JOBS
      Count only jobs visible to candidates.
      This supports both the new "published"
      status and older "active" jobs.
    */

    const jobsPostedPromise =
      Job.countDocuments({
        status: {
          $in: [
            "published",
            "active",
          ],
        },
      });

    /*
      COMPANIES
      In the current JobHub architecture,
      each registered company account is
      represented by a CompanyAdmin document.
    */

    const companiesPromise =
      CompanyAdmin.countDocuments({});

    /*
      REGISTERED USERS
      Candidates are the registered users
      on the candidate side.
    */

    const registeredUsersPromise =
      Candidate.countDocuments({});

    /*
      HIRES
      Count applications whose final status
      is Hired.
    */

    const hiresPromise =
      Application.countDocuments({
        status: "Hired",
      });

    const [
      jobsPosted,
      companies,
      registeredUsers,
      hires,
    ] = await Promise.all([
      jobsPostedPromise,
      companiesPromise,
      registeredUsersPromise,
      hiresPromise,
    ]);

    return res.status(200).json({
      success: true,

      stats: {
        jobsPosted,
        companies,
        registeredUsers,
        hires,
      },
    });
  } catch (error) {
    console.error(
      "Get Platform Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch platform statistics",
    });
  }
};

/* =====================================
   EXPORT CONTROLLERS
===================================== */

module.exports = {
  getAllJobs,
  getJobById,
  getPlatformStats,
};