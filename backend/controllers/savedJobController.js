const mongoose = require("mongoose");
const SavedJob = require("../models/SavedJob");
const Job = require("../models/Job");

/* =====================================
   SAVE JOB
===================================== */

const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const existingSavedJob = await SavedJob.findOne({
      candidate: req.candidateId,
      job: jobId,
    });

    if (existingSavedJob) {
      return res.status(400).json({
        success: false,
        message: "Job is already saved",
      });
    }

    const savedJob = await SavedJob.create({
      candidate: req.candidateId,
      job: jobId,
    });

    return res.status(201).json({
      success: true,
      message: "Job saved successfully",
      savedJob,
    });
  } catch (error) {
    console.error("Save Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save job",
    });
  }
};

/* =====================================
   GET SAVED JOBS
===================================== */

const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({
      candidate: req.candidateId,
    })
      .populate("job")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      savedJobs,
    });
  } catch (error) {
    console.error("Get Saved Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch saved jobs",
    });
  }
};

/* =====================================
   REMOVE SAVED JOB
===================================== */

const removeSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Saved job ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid saved job ID",
      });
    }

    /*
      Supports both:
      1. SavedJob document ID
      2. Job document ID

      This makes the delete operation compatible
      with the current frontend and the saved-job record.
    */

    const savedJob = await SavedJob.findOneAndDelete({
      candidate: req.candidateId,
      $or: [
        {
          _id: jobId,
        },
        {
          job: jobId,
        },
      ],
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: "Saved job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job removed from saved jobs",
      removedSavedJobId: savedJob._id,
      removedJobId: savedJob.job,
    });
  } catch (error) {
    console.error("Remove Saved Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove saved job",
    });
  }
};

/* =====================================
   CHECK SAVED JOB
===================================== */

const checkSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(200).json({
        success: true,
        isSaved: false,
      });
    }

    const savedJob = await SavedJob.findOne({
      candidate: req.candidateId,
      job: jobId,
    });

    return res.status(200).json({
      success: true,
      isSaved: Boolean(savedJob),
    });
  } catch (error) {
    console.error("Check Saved Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check saved job",
    });
  }
};

module.exports = {
  saveJob,
  getSavedJobs,
  removeSavedJob,
  checkSavedJob,
};