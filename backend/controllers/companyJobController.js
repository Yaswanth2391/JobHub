const Job = require("../models/Job");
const CompanyAdmin = require("../models/CompanyAdmin");
const JobAlert = require("../models/JobAlert");
const PlatformSettings = require("../models/PlatformSettings");

/* =====================================
   JOB ALERT HELPERS
===================================== */

/* -------------------------------------
   NORMALIZE TEXT
------------------------------------- */

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/[^\w+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/* -------------------------------------
   NORMALIZE ALERT KEYWORDS
------------------------------------- */

const normalizeTokens = (value = "") => {
  return normalizeText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

/* -------------------------------------
   BUILD JOB SEARCH TEXT
------------------------------------- */

const getJobSearchText = (job) => {
  const skills = Array.isArray(job.skills)
    ? job.skills.join(" ")
    : "";

  return normalizeText(
    [
      job.jobTitle,
      job.department,
      job.description,
      skills,
      job.location,
      job.jobType,
    ]
      .filter(Boolean)
      .join(" "),
  );
};

/* -------------------------------------
   KEYWORD / SKILL / ROLE MATCH
------------------------------------- */

const findKeywordMatches = (alert, job) => {
  const keywords = normalizeTokens(alert.keywords);

  if (keywords.length === 0) {
    return [];
  }

  const jobSearchText = getJobSearchText(job);

  return keywords.filter((keyword) =>
    jobSearchText.includes(keyword),
  );
};

/* -------------------------------------
   LOCATION MATCH
------------------------------------- */

const locationMatches = (
  alertLocation,
  jobLocation,
) => {
  const requestedLocation =
    normalizeText(alertLocation);

  const postedLocation =
    normalizeText(jobLocation);

  if (!requestedLocation) {
    return true;
  }

  if (!postedLocation) {
    return false;
  }

  if (
    requestedLocation === "all" ||
    requestedLocation === "any location"
  ) {
    return true;
  }

  /*
    Remote should match Remote.
  */

  if (
    requestedLocation.includes("remote") &&
    postedLocation.includes("remote")
  ) {
    return true;
  }

  return (
    postedLocation.includes(
      requestedLocation,
    ) ||
    requestedLocation.includes(
      postedLocation,
    )
  );
};

/* -------------------------------------
   EMPLOYMENT TYPE MATCH
------------------------------------- */

const employmentTypeMatches = (
  alertEmploymentType,
  jobType,
) => {
  if (
    !alertEmploymentType ||
    alertEmploymentType === "All"
  ) {
    return true;
  }

  const requestedType =
    normalizeText(alertEmploymentType);

  const postedType =
    normalizeText(jobType);

  if (!postedType) {
    return false;
  }

  return (
    postedType === requestedType ||
    postedType.includes(requestedType) ||
    requestedType.includes(postedType)
  );
};

/* -------------------------------------
   CHECK COMPLETE ALERT MATCH
------------------------------------- */

const getAlertMatch = (
  alert,
  job,
) => {
  const keywordMatches =
    findKeywordMatches(
      alert,
      job,
    );

  const hasKeywordCriteria =
    Boolean(
      normalizeText(
        alert.keywords,
      ),
    );

  const hasLocationCriteria =
    Boolean(
      normalizeText(
        alert.location,
      ),
    );

  const hasEmploymentCriteria =
    Boolean(
      alert.employmentType &&
        alert.employmentType !==
          "All",
    );

  /*
    Keyword / skill / role match.

    Keywords are searched against:
    - Job title
    - Department
    - Description
    - Skills
    - Location
    - Job type
  */

  const matchesKeyword =
    hasKeywordCriteria
      ? keywordMatches.length > 0
      : false;

  /*
    Location match.
  */

  const matchesLocation =
    hasLocationCriteria
      ? locationMatches(
          alert.location,
          job.location,
        )
      : true;

  /*
    Employment type match.
  */

  const matchesEmployment =
    hasEmploymentCriteria
      ? employmentTypeMatches(
          alert.employmentType,
          job.jobType,
        )
      : true;

  /*
    Candidate must have at least one
    matching criterion.

    When keywords are provided,
    at least one keyword must match.

    If a location is provided,
    location must also match.

    If employment type is provided,
    employment type must also match.
  */

  const hasCriteria =
    hasKeywordCriteria ||
    hasLocationCriteria ||
    hasEmploymentCriteria;

  if (!hasCriteria) {
    return null;
  }

  if (
    hasKeywordCriteria &&
    !matchesKeyword
  ) {
    return null;
  }

  if (!matchesLocation) {
    return null;
  }

  if (!matchesEmployment) {
    return null;
  }

  const matchedOn = [];

  if (matchesKeyword) {
    keywordMatches.forEach(
      (keyword) => {
        matchedOn.push(
          `Keyword: ${keyword}`,
        );
      },
    );
  }

  if (
    hasLocationCriteria &&
    matchesLocation
  ) {
    matchedOn.push(
      "Location",
    );
  }

  if (
    hasEmploymentCriteria &&
    matchesEmployment
  ) {
    matchedOn.push(
      "Employment Type",
    );
  }

  return matchedOn;
};

/* -------------------------------------
   MATCH PUBLISHED JOB TO ACTIVE ALERTS
------------------------------------- */

const matchPublishedJobToAlerts =
  async (job) => {
    try {
      const activeAlerts =
        await JobAlert.find({
          enabled: true,
        });

      if (
        activeAlerts.length === 0
      ) {
        return;
      }

      for (const alert of activeAlerts) {
        const matchedOn =
          getAlertMatch(
            alert,
            job,
          );

        if (!matchedOn) {
          continue;
        }

        /*
          Check whether this job was
          already matched to this alert.
        */

        const existingMatch =
          alert.matches?.find(
            (match) =>
              String(
                match.job,
              ) ===
              String(job._id),
          );

        /*
          If already matched, update
          the matched criteria instead
          of creating a duplicate.
        */

        if (existingMatch) {
          existingMatch.matchedOn =
            matchedOn;

          existingMatch.matchedAt =
            new Date();

          await alert.save();

          continue;
        }

        /*
          Add newly matched job.
        */

        alert.matches.push({
          job: job._id,
          matchedOn,
          matchedAt: new Date(),
          viewedAt: null,
        });

        await alert.save();

        console.log(
          `Job Alert Match: Job ${job._id} matched Alert ${alert._id}`,
        );
      }
    } catch (error) {
      /*
        Alert matching should never
        prevent a company from
        publishing a job.
      */

      console.error(
        "Job Alert Matching Error:",
        error,
      );
    }
  };

/* =====================================
   CREATE JOB
===================================== */

const createJob = async (
  req,
  res,
) => {
  try {
    const {
      jobTitle,
      department,
      jobType,
      location,
      experience,
      openings,
      description,
      skills,
      applicationDeadline,
      status,
    } = req.body;

    /* =====================================
       CHECK COMPANY ADMIN
    ===================================== */

    if (
      !req.companyAdmin ||
      !req.companyAdmin.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized company admin",
      });
    }

    /* =====================================
       VALIDATION
    ===================================== */

    if (
      !jobTitle ||
      !department ||
      !jobType ||
      !location ||
      !experience ||
      !openings ||
      !description ||
      !applicationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required job details",
      });
    }

    /* =====================================
       GET COMPANY INFORMATION
    ===================================== */

    const companyAdmin =
      await CompanyAdmin.findById(
        req.companyAdmin.id,
      );

    if (!companyAdmin) {
      return res.status(404).json({
        success: false,
        message:
          "Company account not found",
      });
    }

    const platformSettings = await PlatformSettings.findOne({});

    if (platformSettings?.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: "JobHub is currently in maintenance mode. Please try again later.",
      });
    }

    if (platformSettings?.enableCompanyJobPosting === false) {
      return res.status(403).json({
        success: false,
        message: "New job posting is currently disabled by the platform administrator.",
      });
    }

    if (platformSettings?.maxJobsPerCompany) {
      const existingJobCount = await Job.countDocuments({
        companyAdmin: companyAdmin._id,
        status: {
          $in: ["draft", "published", "active"],
        },
      });

      if (existingJobCount >= platformSettings.maxJobsPerCompany) {
        return res.status(403).json({
          success: false,
          message: `This company has reached the maximum of ${platformSettings.maxJobsPerCompany} active jobs.`,
        });
      }
    }

    /* =====================================
       VALIDATE OPENINGS
    ===================================== */

    const openingsNumber =
      Number(openings);

    if (
      Number.isNaN(
        openingsNumber,
      ) ||
      openingsNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Number of openings must be at least 1",
      });
    }

    /* =====================================
       PREPARE SKILLS
    ===================================== */

    const formattedSkills =
      Array.isArray(skills)
        ? skills
            .map((skill) =>
              String(
                skill,
              ).trim(),
            )
            .filter(
              (skill) =>
                skill.length > 0,
            )
        : [];

    /* =====================================
       VALIDATE SKILLS
    ===================================== */

    if (
      formattedSkills.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please add at least one required skill",
      });
    }

    /* =====================================
       VALIDATE APPLICATION DEADLINE
    ===================================== */

    const deadlineDate =
      new Date(
        applicationDeadline,
      );

    if (
      Number.isNaN(
        deadlineDate.getTime(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid application deadline",
      });
    }

    /* =====================================
       VALIDATE STATUS
    ===================================== */

    const jobStatus =
      status === "published"
        ? "published"
        : "draft";

    /* =====================================
       CREATE JOB
    ===================================== */

    const job =
      await Job.create({
        companyAdmin:
          companyAdmin._id,

        companyName:
          companyAdmin.companyName,

        /*
          IMPORTANT:
          Copy the company's current logo
          only when creating a new job.

          Previously posted jobs are NOT
          modified when the company uploads
          a logo.
        */

        companyLogo:
          companyAdmin.companyLogo || "",

        jobTitle:
          jobTitle.trim(),

        department:
          department.trim(),

        jobType,

        location:
          location.trim(),

        experience:
          experience.trim(),

        openings:
          openingsNumber,

        description:
          description.trim(),

        skills:
          formattedSkills,

        applicationDeadline:
          deadlineDate,

        status:
          jobStatus,
      });

    /* =====================================
       JOB ALERT MATCHING
    ===================================== */

    if (
      job.status ===
      "published"
    ) {
      await matchPublishedJobToAlerts(
        job,
      );
    }

    /* =====================================
       SUCCESS RESPONSE
    ===================================== */

    return res.status(201).json({
      success: true,

      message:
        job.status ===
        "published"
          ? "Job published successfully"
          : "Job saved as draft",

      job,
    });
  } catch (error) {
    console.error(
      "Create Job Error:",
      error,
    );

    /* =====================================
       MONGOOSE VALIDATION ERROR
    ===================================== */

    if (
      error.name ===
      "ValidationError"
    ) {
      const validationErrors =
        Object.values(
          error.errors,
        ).map(
          (item) =>
            item.message,
        );

      return res.status(400).json({
        success: false,

        message:
          validationErrors.join(
            ", ",
          ),
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Unable to create job",
    });
  }
};

/* =====================================
   GET COMPANY JOBS
===================================== */

const getCompanyJobs = async (
  req,
  res,
) => {
  try {
    /* =====================================
       CHECK COMPANY ADMIN
    ===================================== */

    if (
      !req.companyAdmin ||
      !req.companyAdmin.id
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Unauthorized company admin",
      });
    }

    /* =====================================
       GET JOBS
    ===================================== */

    const jobs =
      await Job.find({
        companyAdmin:
          req.companyAdmin.id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      jobs,
    });
  } catch (error) {
    console.error(
      "Get Company Jobs Error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to fetch jobs",
    });
  }
};

/* =====================================
   GET SINGLE COMPANY JOB
===================================== */

const getCompanyJobById =
  async (
    req,
    res,
  ) => {
    try {
      /* =====================================
         CHECK COMPANY ADMIN
      ===================================== */

      if (
        !req.companyAdmin ||
        !req.companyAdmin.id
      ) {
        return res.status(401).json({
          success: false,

          message:
            "Unauthorized company admin",
        });
      }

      /* =====================================
         FIND JOB
      ===================================== */

      const job =
        await Job.findOne({
          _id:
            req.params.jobId,

          companyAdmin:
            req.companyAdmin.id,
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
        "Get Single Company Job Error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to fetch job",
      });
    }
  };

/* =====================================
   UPDATE COMPANY JOB
===================================== */

const updateCompanyJob =
  async (
    req,
    res,
  ) => {
    try {
      /* =====================================
         CHECK COMPANY ADMIN
      ===================================== */

      if (
        !req.companyAdmin ||
        !req.companyAdmin.id
      ) {
        return res.status(401).json({
          success: false,

          message:
            "Unauthorized company admin",
        });
      }

      /* =====================================
         GET FORM DATA
      ===================================== */

      const {
        jobTitle,
        department,
        jobType,
        location,
        experience,
        openings,
        description,
        skills,
        applicationDeadline,
        status,
      } = req.body;

      /* =====================================
         VALIDATION
      ===================================== */

      if (
        !jobTitle ||
        !department ||
        !jobType ||
        !location ||
        !experience ||
        !openings ||
        !description ||
        !applicationDeadline
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Please fill all required job details",
        });
      }

      /* =====================================
         VALIDATE OPENINGS
      ===================================== */

      const openingsNumber =
        Number(openings);

      if (
        Number.isNaN(
          openingsNumber,
        ) ||
        openingsNumber < 1
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Number of openings must be at least 1",
        });
      }

      /* =====================================
         PREPARE SKILLS
      ===================================== */

      const formattedSkills =
        Array.isArray(skills)
          ? skills
              .map((skill) =>
                String(
                  skill,
                ).trim(),
              )
              .filter(
                (skill) =>
                  skill.length > 0,
              )
          : [];

      /* =====================================
         VALIDATE SKILLS
      ===================================== */

      if (
        formattedSkills.length === 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Please add at least one required skill",
        });
      }

      /* =====================================
         VALIDATE DEADLINE
      ===================================== */

      const deadlineDate =
        new Date(
          applicationDeadline,
        );

      if (
        Number.isNaN(
          deadlineDate.getTime(),
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Please provide a valid application deadline",
        });
      }

      /* =====================================
         VALIDATE STATUS
      ===================================== */

      const jobStatus =
        status === "published"
          ? "published"
          : "draft";

      /* =====================================
         UPDATE JOB
         IMPORTANT:
         companyLogo is intentionally
         NOT updated here.

         This keeps previously posted jobs
         unchanged.
      ===================================== */

      const job =
        await Job.findOneAndUpdate(
          {
            _id:
              req.params.jobId,

            companyAdmin:
              req.companyAdmin.id,
          },

          {
            jobTitle:
              jobTitle.trim(),

            department:
              department.trim(),

            jobType,

            location:
              location.trim(),

            experience:
              experience.trim(),

            openings:
              openingsNumber,

            description:
              description.trim(),

            skills:
              formattedSkills,

            applicationDeadline:
              deadlineDate,

            status:
              jobStatus,
          },

          {
            new: true,

            runValidators:
              true,
          },
        );

      /* =====================================
         JOB NOT FOUND
      ===================================== */

      if (!job) {
        return res.status(404).json({
          success: false,

          message:
            "Job not found",
        });
      }

      /* =====================================
         JOB ALERT MATCHING
      ===================================== */

      if (
        job.status ===
        "published"
      ) {
        await matchPublishedJobToAlerts(
          job,
        );
      }

      /* =====================================
         SUCCESS RESPONSE
      ===================================== */

      return res.status(200).json({
        success: true,

        message:
          job.status ===
          "published"
            ? "Job updated and published successfully"
            : "Job updated and saved as draft",

        job,
      });
    } catch (error) {
      console.error(
        "Update Company Job Error:",
        error,
      );

      /* =====================================
         MONGOOSE VALIDATION ERROR
      ===================================== */

      if (
        error.name ===
        "ValidationError"
      ) {
        const validationErrors =
          Object.values(
            error.errors,
          ).map(
            (item) =>
              item.message,
          );

        return res.status(400).json({
          success: false,

          message:
            validationErrors.join(
              ", ",
            ),
        });
      }

      return res.status(500).json({
        success: false,

        message:
          "Unable to update job",
      });
    }
  };

/* =====================================
   DELETE COMPANY JOB
===================================== */

const deleteCompanyJob =
  async (
    req,
    res,
  ) => {
    try {
      /* =====================================
         CHECK COMPANY ADMIN
      ===================================== */

      if (
        !req.companyAdmin ||
        !req.companyAdmin.id
      ) {
        return res.status(401).json({
          success: false,

          message:
            "Unauthorized company admin",
        });
      }

      /* =====================================
         DELETE JOB
      ===================================== */

      const job =
        await Job.findOneAndDelete({
          _id:
            req.params.jobId,

          companyAdmin:
            req.companyAdmin.id,
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

        message:
          "Job deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Company Job Error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to delete job",
      });
    }
  };

/* =====================================
   EXPORT CONTROLLERS
===================================== */

module.exports = {
  createJob,

  getCompanyJobs,

  getCompanyJobById,

  updateCompanyJob,

  deleteCompanyJob,
};