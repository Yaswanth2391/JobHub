const mongoose = require("mongoose");

const JobAlert = require("../models/JobAlert");

/* =====================================
   GET MY JOB ALERTS
===================================== */

const getMyJobAlerts = async (req, res) => {
  try {
    const candidateId = req.candidateId;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate authentication required",
      });
    }

    const alerts = await JobAlert.find({
      candidate: candidateId,
    })
      .populate({
        path: "matches.job",
        select:
          "companyName companyLogo jobTitle department jobType location experience openings description skills applicationDeadline status createdAt updatedAt",
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error(
      "Get Candidate Job Alerts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch job alerts",
    });
  }
};

/* =====================================
   GET MY MATCHED JOBS
===================================== */

const getMyJobAlertMatches = async (
  req,
  res
) => {
  try {
    const candidateId = req.candidateId;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate authentication required",
      });
    }

    const alerts = await JobAlert.find({
      candidate: candidateId,
    })
      .populate({
        path: "matches.job",
        select:
          "companyName companyLogo jobTitle department jobType location experience openings description skills applicationDeadline status createdAt updatedAt",
      })
      .lean();

    const matches = [];

    const seenJobs = new Set();

    alerts.forEach((alert) => {
      if (!Array.isArray(alert.matches)) {
        return;
      }

      alert.matches.forEach((match) => {
        if (!match.job) {
          return;
        }

        const jobId = String(match.job._id);

        if (seenJobs.has(jobId)) {
          return;
        }

        seenJobs.add(jobId);

        matches.push({
          job: match.job,
          alertId: alert._id,
          alertTitle: alert.title,
          matchedOn: match.matchedOn || [],
          matchedAt: match.matchedAt,
          viewedAt: match.viewedAt || null,
        });
      });
    });

    matches.sort((first, second) => {
      const firstDate = new Date(
        first.matchedAt || 0
      ).getTime();

      const secondDate = new Date(
        second.matchedAt || 0
      ).getTime();

      return secondDate - firstDate;
    });

    return res.status(200).json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error(
      "Get Job Alert Matches Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch matching jobs",
    });
  }
};

/* =====================================
   CREATE JOB ALERT
===================================== */

const createJobAlert = async (
  req,
  res
) => {
  try {
    const candidateId = req.candidateId;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate authentication required",
      });
    }

    const {
      title,
      keywords,
      location,
      employmentType,
      frequency,
      enabled,
    } = req.body;

    const trimmedTitle =
      title !== undefined &&
      title !== null
        ? String(title).trim()
        : "";

    const trimmedKeywords =
      keywords !== undefined &&
      keywords !== null
        ? String(keywords).trim()
        : "";

    const trimmedLocation =
      location !== undefined &&
      location !== null
        ? String(location).trim()
        : "";

    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: "Alert name is required",
      });
    }

    if (
      !trimmedKeywords &&
      !trimmedLocation
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least a keyword or location",
      });
    }

    const alert =
      await JobAlert.create({
        candidate: candidateId,
        title: trimmedTitle,
        keywords: trimmedKeywords,
        location: trimmedLocation,
        employmentType:
          employmentType || "All",
        frequency:
          frequency || "Daily",
        enabled:
          enabled !== undefined
            ? Boolean(enabled)
            : true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Job alert created successfully",
      alert,
    });
  } catch (error) {
    console.error(
      "Create Candidate Job Alert Error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          Object.values(
            error.errors
          )
            .map(
              (item) =>
                item.message
            )
            .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create job alert",
    });
  }
};

/* =====================================
   UPDATE JOB ALERT
===================================== */

const updateJobAlert = async (
  req,
  res
) => {
  try {
    const candidateId = req.candidateId;
    const { alertId } = req.params;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate authentication required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        alertId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job alert id",
      });
    }

    const alert =
      await JobAlert.findOne({
        _id: alertId,
        candidate: candidateId,
      });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Job alert not found",
      });
    }

    const {
      title,
      keywords,
      location,
      employmentType,
      frequency,
      enabled,
    } = req.body;

    if (title !== undefined) {
      const trimmedTitle =
        String(title).trim();

      if (!trimmedTitle) {
        return res.status(400).json({
          success: false,
          message: "Alert name is required",
        });
      }

      alert.title = trimmedTitle;
    }

    if (keywords !== undefined) {
      alert.keywords =
        String(keywords).trim();
    }

    if (location !== undefined) {
      alert.location =
        String(location).trim();
    }

    if (
      employmentType !== undefined
    ) {
      alert.employmentType =
        employmentType;
    }

    if (frequency !== undefined) {
      alert.frequency =
        frequency;
    }

    if (enabled !== undefined) {
      alert.enabled =
        Boolean(enabled);
    }

    if (
      !alert.keywords &&
      !alert.location
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least a keyword or location",
      });
    }

    await alert.save();

    return res.status(200).json({
      success: true,
      message:
        "Job alert updated successfully",
      alert,
    });
  } catch (error) {
    console.error(
      "Update Candidate Job Alert Error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          Object.values(
            error.errors
          )
            .map(
              (item) =>
                item.message
            )
            .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to update job alert",
    });
  }
};

/* =====================================
   TOGGLE JOB ALERT
===================================== */

const toggleJobAlert = async (
  req,
  res
) => {
  try {
    const candidateId = req.candidateId;
    const { alertId } = req.params;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate authentication required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        alertId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job alert id",
      });
    }

    const alert =
      await JobAlert.findOne({
        _id: alertId,
        candidate: candidateId,
      });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Job alert not found",
      });
    }

    alert.enabled =
      !alert.enabled;

    await alert.save();

    return res.status(200).json({
      success: true,
      message: alert.enabled
        ? "Job alert activated successfully"
        : "Job alert paused successfully",
      alert,
    });
  } catch (error) {
    console.error(
      "Toggle Candidate Job Alert Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update job alert status",
    });
  }
};

/* =====================================
   MARK MATCH AS VIEWED
===================================== */

const markJobAlertMatchViewed =
  async (req, res) => {
    try {
      const candidateId =
        req.candidateId;

      const {
        alertId,
        jobId,
      } = req.params;

      if (!candidateId) {
        return res.status(401).json({
          success: false,
          message:
            "Candidate authentication required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          alertId
        ) ||
        !mongoose.Types.ObjectId.isValid(
          jobId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid alert or job id",
        });
      }

      const alert =
        await JobAlert.findOne({
          _id: alertId,
          candidate: candidateId,
        });

      if (!alert) {
        return res.status(404).json({
          success: false,
          message:
            "Job alert not found",
        });
      }

      const match =
        alert.matches.find(
          (item) =>
            String(item.job) ===
            String(jobId)
        );

      if (!match) {
        return res.status(404).json({
          success: false,
          message:
            "Matched job not found",
        });
      }

      match.viewedAt =
        new Date();

      await alert.save();

      return res.status(200).json({
        success: true,
        message:
          "Job alert match marked as viewed",
      });
    } catch (error) {
      console.error(
        "Mark Job Alert Match Viewed Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update job alert match",
      });
    }
  };

/* =====================================
   DELETE JOB ALERT
===================================== */

const deleteJobAlert = async (
  req,
  res
) => {
  try {
    const candidateId = req.candidateId;
    const { alertId } = req.params;

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Candidate authentication required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        alertId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job alert id",
      });
    }

    const deletedAlert =
      await JobAlert.findOneAndDelete({
        _id: alertId,
        candidate: candidateId,
      });

    if (!deletedAlert) {
      return res.status(404).json({
        success: false,
        message: "Job alert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Job alert deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Candidate Job Alert Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete job alert",
    });
  }
};

/* =====================================
   EXPORT
===================================== */

module.exports = {
  getMyJobAlerts,
  getMyJobAlertMatches,
  createJobAlert,
  updateJobAlert,
  toggleJobAlert,
  markJobAlertMatchViewed,
  deleteJobAlert,
};