const Application = require("../models/Application");
const Job = require("../models/Job");

// ======================================
// GET COMPANY JOB IDS
// ======================================

const getCompanyJobIds = async (companyAdminId) => {
  const companyJobs = await Job.find({
    companyAdmin: companyAdminId,
  }).select("_id");

  return companyJobs.map((job) => job._id.toString());
};

// ======================================
// GET COMPANY APPLICATIONS
// ======================================

const getCompanyApplications = async (req, res) => {
  try {
    const companyAdminId = req.companyAdmin.id;

    const jobIds = await getCompanyJobIds(companyAdminId);

    const applications = await Application.find({
      jobId: {
        $in: jobIds,
      },
    })
      .populate(
        "candidate",
        "fullName email phone location resume"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get company applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch company applications.",
    });
  }
};

// ======================================
// GET SINGLE COMPANY APPLICATION
// ======================================

const getCompanyApplicationById = async (req, res) => {
  try {
    const companyAdminId = req.companyAdmin.id;

    const { applicationId } = req.params;

    const jobIds = await getCompanyJobIds(companyAdminId);

    const application = await Application.findOne({
      _id: applicationId,
      jobId: {
        $in: jobIds,
      },
    }).populate(
      "candidate",
      "fullName email phone location resume"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get company application error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch application.",
    });
  }
};

// ======================================
// SCHEDULE INTERVIEW
// ======================================

const scheduleInterview = async (req, res) => {
  try {
    const companyAdminId = req.companyAdmin.id;

    const { applicationId } = req.params;

    const {
      interviewType,
      interviewers,
      date,
      time,
      mode,
      meetingLink,
      location,
      notes,
    } = req.body;

    // ======================================
    // VALIDATE INTERVIEW TYPE
    // ======================================

    if (!interviewType || !interviewType.trim()) {
      return res.status(400).json({
        success: false,
        message: "Interview type is required.",
      });
    }

    // ======================================
    // VALIDATE INTERVIEWERS
    // ======================================

    if (
      !Array.isArray(interviewers) ||
      interviewers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one interviewer is required.",
      });
    }

    const cleanedInterviewers = interviewers
      .map((interviewer) =>
        typeof interviewer === "string"
          ? interviewer.trim()
          : ""
      )
      .filter(Boolean);

    if (cleanedInterviewers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid interviewer is required.",
      });
    }

    // ======================================
    // VALIDATE DATE
    // ======================================

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Interview date is required.",
      });
    }

    const interviewDate = new Date(date);

    if (Number.isNaN(interviewDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview date.",
      });
    }

    // ======================================
    // VALIDATE TIME
    // ======================================

    if (!time || !time.trim()) {
      return res.status(400).json({
        success: false,
        message: "Interview time is required.",
      });
    }

    // ======================================
    // VALIDATE MODE
    // ======================================

    const allowedModes = [
      "Online",
      "Offline",
    ];

    if (!mode || !allowedModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid interview mode.",
      });
    }

    // ======================================
    // ONLINE VALIDATION
    // ======================================

    if (
      mode === "Online" &&
      (!meetingLink || !meetingLink.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Meeting link is required for online interviews.",
      });
    }

    // ======================================
    // OFFLINE VALIDATION
    // ======================================

    if (
      mode === "Offline" &&
      (!location || !location.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Interview location is required for offline interviews.",
      });
    }

    // ======================================
    // GET COMPANY JOBS
    // ======================================

    const jobIds = await getCompanyJobIds(companyAdminId);

    // ======================================
    // FIND APPLICATION
    // ======================================

    const application = await Application.findOne({
      _id: applicationId,
      jobId: {
        $in: jobIds,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // ======================================
    // CHECK APPLICATION STATUS
    // ======================================

    if (application.status !== "Applied") {
      return res.status(400).json({
        success: false,
        message:
          `Interview cannot be scheduled because the application is currently "${application.status}".`,
      });
    }

    // ======================================
    // SAVE INTERVIEW DETAILS
    // ======================================

    application.interview = {
      scheduled: true,

      interviewType: interviewType.trim(),

      interviewers: cleanedInterviewers,

      date: interviewDate,

      time: time.trim(),

      mode,

      meetingLink:
        mode === "Online"
          ? meetingLink.trim()
          : "",

      location:
        mode === "Offline"
          ? location.trim()
          : "",

      notes:
        typeof notes === "string"
          ? notes.trim()
          : "",

      outcome: "Pending",
    };

    // ======================================
    // UPDATE APPLICATION STATUS
    // ======================================

    application.status = "Interview Scheduled";

    // ======================================
    // SAVE APPLICATION
    // ======================================

    await application.save();

    // ======================================
    // POPULATE CANDIDATE
    // ======================================

    await application.populate(
      "candidate",
      "fullName email phone location resume"
    );

    return res.status(200).json({
      success: true,
      message: "Interview scheduled successfully.",
      application,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to schedule interview.",
    });
  }
};

// ======================================
// MARK APPLICATION AS HIRED
// ======================================

const markApplicationAsHired = async (req, res) => {
  try {
    const companyAdminId = req.companyAdmin.id;

    const { applicationId } = req.params;

    const {
      ctc,
      joiningDate,
      employmentType,
      workMode,
      location,
      notes,
    } = req.body;

    // ======================================
    // VALIDATE CTC
    // ======================================

    if (!ctc || !ctc.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Salary / CTC is required.",
      });
    }

    // ======================================
    // VALIDATE JOINING DATE
    // ======================================

    if (!joiningDate) {
      return res.status(400).json({
        success: false,
        message: "Joining date is required.",
      });
    }

    const parsedJoiningDate = new Date(joiningDate);

    if (Number.isNaN(parsedJoiningDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid joining date.",
      });
    }

    // ======================================
    // VALIDATE EMPLOYMENT TYPE
    // ======================================

    const allowedEmploymentTypes = [
      "Full Time",
      "Part Time",
      "Contract",
      "Internship",
      "Freelance",
    ];

    if (
      !employmentType ||
      !allowedEmploymentTypes.includes(
        employmentType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid employment type.",
      });
    }

    // ======================================
    // VALIDATE WORK MODE
    // ======================================

    const allowedWorkModes = [
      "On-site",
      "Hybrid",
      "Remote",
    ];

    if (
      !workMode ||
      !allowedWorkModes.includes(workMode)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid work mode.",
      });
    }

    // ======================================
    // VALIDATE LOCATION
    // ======================================

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Joining location is required.",
      });
    }

    // ======================================
    // GET COMPANY JOBS
    // ======================================

    const jobIds = await getCompanyJobIds(
      companyAdminId
    );

    // ======================================
    // FIND APPLICATION
    // ======================================

    const application = await Application.findOne({
      _id: applicationId,
      jobId: {
        $in: jobIds,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // ======================================
    // CHECK CURRENT STATUS
    // ======================================

    if (
      application.status !==
      "Interview Scheduled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Candidate cannot be marked as hired because the application is currently "${application.status}".`,
      });
    }

    // ======================================
    // SAVE HIRING DETAILS
    // ======================================

    application.hiringDetails = {
      ctc: ctc.toString().trim(),

      joiningDate: parsedJoiningDate,

      employmentType,

      workMode,

      location: location.trim(),

      notes:
        typeof notes === "string"
          ? notes.trim()
          : "",
    };

    // ======================================
    // SAVE EXACT HIRED DATE
    // ======================================

    application.hiredAt = new Date();

    // ======================================
    // UPDATE APPLICATION STATUS
    // ======================================

    application.status = "Hired";

    // ======================================
    // UPDATE INTERVIEW OUTCOME
    // ======================================

    if (application.interview) {
      application.interview.outcome =
        "Hired";
    }

    // ======================================
    // SAVE APPLICATION
    // ======================================

    await application.save();

    // ======================================
    // POPULATE CANDIDATE
    // ======================================

    await application.populate(
      "candidate",
      "fullName email phone location resume"
    );

    return res.status(200).json({
      success: true,
      message: "Candidate hired successfully.",
      application,
    });
  } catch (error) {
    console.error(
      "Mark application as hired error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to mark candidate as hired.",
    });
  }
};

// ======================================
// UPDATE APPLICATION STATUS
// ======================================

const updateCompanyApplicationStatus = async (
  req,
  res
) => {
  try {
    const companyAdminId = req.companyAdmin.id;

    const { applicationId } = req.params;

    const {
      status,
      rejectionReason,
      rejectionFeedback,
      notifyCandidate,
    } = req.body;

    // ======================================
    // ALLOWED STATUSES
    // ======================================

    const allowedStatuses = [
      "Applied",
      "Interview Scheduled",
      "Hired",
      "Rejected",
    ];

    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    // ======================================
    // GET COMPANY JOBS
    // ======================================

    const jobIds = await getCompanyJobIds(
      companyAdminId
    );

    // ======================================
    // FIND APPLICATION
    // ======================================

    const application = await Application.findOne({
      _id: applicationId,
      jobId: {
        $in: jobIds,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // ======================================
    // CURRENT STATUS
    // ======================================

    const currentStatus = application.status;

    // ======================================
    // APPLICATION STATUS WORKFLOW
    // ======================================

    const allowedTransitions = {
      Applied: [
        "Interview Scheduled",
        "Rejected",
      ],

      "Interview Scheduled": [
        "Hired",
        "Rejected",
      ],

      Hired: [],

      Rejected: [],
    };

    // ======================================
    // CHECK TRANSITION
    // ======================================

    const possibleStatuses =
      allowedTransitions[currentStatus] || [];

    if (
      !possibleStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Application cannot be changed from "${currentStatus}" to "${status}".`,
      });
    }

    // ======================================
    // HIRING MUST USE DEDICATED WORKFLOW
    // ======================================

    if (status === "Hired") {
      return res.status(400).json({
        success: false,
        message:
          "Please use the Mark as Hired workflow to enter hiring details.",
      });
    }

    // ======================================
    // REJECTION VALIDATION
    // ======================================

    if (status === "Rejected") {
      if (
        !rejectionReason ||
        !rejectionReason.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required.",
        });
      }

      if (
        typeof rejectionFeedback !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rejection feedback must be a valid text value.",
        });
      }
    }

    // ======================================
    // UPDATE APPLICATION STATUS
    // ======================================

    application.status = status;

    // ======================================
    // SAVE REJECTION INFORMATION
    // ======================================

    if (status === "Rejected") {
      application.rejectionDetails = {
        reason: rejectionReason.trim(),

        feedback:
          typeof rejectionFeedback === "string"
            ? rejectionFeedback.trim()
            : "",

        notifyCandidate:
          Boolean(notifyCandidate),

        rejectedAt: new Date(),
      };

      // ======================================
      // UPDATE INTERVIEW STATUS
      // ======================================

      if (application.interview) {
        application.interview.scheduled = false;

        application.interview.outcome =
          "Rejected";
      }
    }

    // ======================================
    // SAVE APPLICATION
    // ======================================

    await application.save();

    // ======================================
    // POPULATE CANDIDATE
    // ======================================

    await application.populate(
      "candidate",
      "fullName email phone location resume"
    );

    return res.status(200).json({
      success: true,

      message:
        `Application moved to ${status}.`,

      application,
    });
  } catch (error) {
    console.error(
      "Update application status error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to update application status.",
    });
  }
};

// ======================================
// DELETE COMPANY APPLICATION
// ======================================

const deleteCompanyApplication = async (
  req,
  res
) => {
  try {
    const companyAdminId = req.companyAdmin.id;

    const { applicationId } = req.params;

    // ======================================
    // GET COMPANY JOBS
    // ======================================

    const jobIds = await getCompanyJobIds(
      companyAdminId
    );

    // ======================================
    // DELETE APPLICATION
    // ======================================

    const application =
      await Application.findOneAndDelete({
        _id: applicationId,

        jobId: {
          $in: jobIds,
        },
      });

    if (!application) {
      return res.status(404).json({
        success: false,

        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Application deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete company application error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to delete application.",
    });
  }
};

// ======================================
// EXPORT
// ======================================

module.exports = {
  getCompanyApplications,
  getCompanyApplicationById,
  scheduleInterview,
  markApplicationAsHired,
  updateCompanyApplicationStatus,
  deleteCompanyApplication,
};