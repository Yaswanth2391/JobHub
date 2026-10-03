const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // ======================================
    // CANDIDATE
    // ======================================

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    // ======================================
    // JOB DETAILS
    // ======================================

    jobId: {
      type: String,
      required: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyLogo: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // CANDIDATE DETAILS
    // ======================================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    coverLetter: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================
    // ATS INFORMATION
    // ======================================

    candidateSkills: {
      type: [String],
      default: [],
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    // ======================================
    // FINAL ATS SCORE
    // ======================================

    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ======================================
    // MATCHED / MISSING SKILLS
    // ======================================

    atsMatchedSkills: {
      type: [String],
      default: [],
    },

    atsMissingSkills: {
      type: [String],
      default: [],
    },

    // ======================================
    // ATS CALCULATION STATUS
    // ======================================

    atsStatus: {
      type: String,
      enum: ["Pending", "Calculated"],
      default: "Pending",
    },

    // ======================================
    // ATS SCORE BREAKDOWN
    // ======================================

    atsBreakdown: {
      // --------------------------------------
      // SKILLS - 40 POINTS
      // --------------------------------------

      skills: {
        score: {
          type: Number,
          min: 0,
          max: 40,
          default: 0,
        },

        maxScore: {
          type: Number,
          default: 40,
        },

        matched: {
          type: Number,
          default: 0,
        },

        required: {
          type: Number,
          default: 0,
        },
      },

      // --------------------------------------
      // EXPERIENCE - 25 POINTS
      // --------------------------------------

      experience: {
        score: {
          type: Number,
          min: 0,
          max: 25,
          default: 0,
        },

        maxScore: {
          type: Number,
          default: 25,
        },

        candidateYears: {
          type: Number,
          default: 0,
        },

        requiredMin: {
          type: Number,
          default: 0,
        },

        requiredMax: {
          type: Number,
          default: null,
        },

        matched: {
          type: Boolean,
          default: false,
        },
      },

      // --------------------------------------
      // RESUME QUALITY - 15 POINTS
      // --------------------------------------

      resumeQuality: {
        score: {
          type: Number,
          min: 0,
          max: 15,
          default: 0,
        },

        maxScore: {
          type: Number,
          default: 15,
        },

        matched: {
          type: Boolean,
          default: false,
        },
      },

      // --------------------------------------
      // ROLE RELEVANCE - 10 POINTS
      // --------------------------------------

      roleRelevance: {
        score: {
          type: Number,
          min: 0,
          max: 10,
          default: 0,
        },

        maxScore: {
          type: Number,
          default: 10,
        },

        matched: {
          type: Boolean,
          default: false,
        },
      },

      // --------------------------------------
      // EDUCATION - 10 POINTS
      // --------------------------------------

      education: {
        score: {
          type: Number,
          min: 0,
          max: 10,
          default: 0,
        },

        maxScore: {
          type: Number,
          default: 10,
        },

        matched: {
          type: Boolean,
          default: false,
        },
      },
    },

    // ======================================
    // APPLICATION STATUS
    // ======================================

    status: {
      type: String,
      enum: [
        "Applied",
        "Interview Scheduled",
        "Hired",
        "Rejected",
      ],
      default: "Applied",
    },

    // ======================================
    // HIRING INFORMATION
    // ======================================

    // These details are entered by the
    // company admin when the candidate is
    // officially marked as hired.
    //
    // Candidates can view these details
    // from their frontend but cannot edit them.

    hiringDetails: {
      // --------------------------------------
      // SALARY / CTC
      // --------------------------------------

      ctc: {
        type: String,
        default: "",
        trim: true,
      },

      // --------------------------------------
      // JOINING DATE
      // --------------------------------------

      joiningDate: {
        type: Date,
        default: null,
      },

      // --------------------------------------
      // EMPLOYMENT TYPE
      // --------------------------------------

      employmentType: {
        type: String,
        enum: [
          "Full Time",
          "Part Time",
          "Contract",
          "Internship",
          "Freelance",
          "",
        ],
        default: "",
      },

      // --------------------------------------
      // WORK MODE
      // --------------------------------------

      workMode: {
        type: String,
        enum: [
          "On-site",
          "Hybrid",
          "Remote",
          "",
        ],
        default: "",
      },

      // --------------------------------------
      // JOINING LOCATION
      // --------------------------------------

      location: {
        type: String,
        default: "",
        trim: true,
      },

      // --------------------------------------
      // CANDIDATE-VISIBLE NOTES
      // --------------------------------------

      notes: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ======================================
    // HIRED DATE
    // ======================================

    // Exact date/time when the company
    // confirmed the candidate as hired.

    hiredAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // REJECTION INFORMATION
    // ======================================

    // These details are entered by the
    // company admin when the candidate is
    // officially rejected.

    rejectionDetails: {
      // --------------------------------------
      // REJECTION REASON
      // --------------------------------------

      reason: {
        type: String,
        default: "",
        trim: true,
      },

      // --------------------------------------
      // ADDITIONAL FEEDBACK
      // --------------------------------------

      feedback: {
        type: String,
        default: "",
        trim: true,
      },

      // --------------------------------------
      // CANDIDATE NOTIFICATION
      // --------------------------------------

      notifyCandidate: {
        type: Boolean,
        default: false,
      },

      // --------------------------------------
      // REJECTED DATE
      // --------------------------------------

      rejectedAt: {
        type: Date,
        default: null,
      },
    },

    // ======================================
    // INTERVIEW INFORMATION
    // ======================================

    interview: {
      // --------------------------------------
      // INTERVIEW SCHEDULE STATUS
      // --------------------------------------

      scheduled: {
        type: Boolean,
        default: false,
      },

      // --------------------------------------
      // INTERVIEW TYPE
      // --------------------------------------

      interviewType: {
        type: String,
        default: "",
        trim: true,
      },

      // --------------------------------------
      // INTERVIEWERS
      // --------------------------------------

      interviewers: {
        type: [String],
        default: [],
      },

      // --------------------------------------
      // INTERVIEW DATE
      // --------------------------------------

      date: {
        type: Date,
        default: null,
      },

      // --------------------------------------
      // INTERVIEW TIME
      // --------------------------------------

      time: {
        type: String,
        default: "",
      },

      // --------------------------------------
      // ONLINE / OFFLINE
      // --------------------------------------

      mode: {
        type: String,
        enum: ["Online", "Offline", ""],
        default: "",
      },

      // --------------------------------------
      // ONLINE MEETING LINK
      // --------------------------------------

      meetingLink: {
        type: String,
        default: "",
      },

      // --------------------------------------
      // OFFLINE INTERVIEW LOCATION
      // --------------------------------------

      location: {
        type: String,
        default: "",
      },

      // --------------------------------------
      // ADMIN INTERVIEW NOTES
      // --------------------------------------

      notes: {
        type: String,
        default: "",
      },

      // --------------------------------------
      // FINAL INTERVIEW OUTCOME
      // --------------------------------------

      outcome: {
        type: String,
        enum: [
          "Pending",
          "Hired",
          "Rejected",
        ],
        default: "Pending",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Application",
  applicationSchema
);