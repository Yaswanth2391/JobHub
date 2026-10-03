const Candidate = require("../models/Candidate");
const fs = require("fs");
const path = require("path");

/* =====================================
   GET LOGGED-IN CANDIDATE PROFILE
===================================== */

const getCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidateId).select(
      "-password",
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.error("Get candidate profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch candidate profile",
    });
  }
};


/* =====================================
   UPDATE LOGGED-IN CANDIDATE PROFILE
===================================== */

const updateCandidateProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      location,
      dateOfBirth,
      gender,
      bio,
      skills,
    } = req.body;

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (fullName !== undefined) {
      candidate.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      candidate.phone = phone.trim();
    }

    if (location !== undefined) {
      candidate.location = location.trim();
    }

    if (dateOfBirth !== undefined) {
      candidate.dateOfBirth = dateOfBirth;
    }

    if (gender !== undefined) {
      candidate.gender = gender;
    }

    if (bio !== undefined) {
      candidate.bio = bio.trim();
    }

    if (skills !== undefined) {
      candidate.skills = Array.isArray(skills)
        ? skills
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0)
        : [];
    }

    await candidate.save();

    const updatedCandidate = candidate.toObject();

    delete updatedCandidate.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Update candidate profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};


/* =====================================
   ADD EDUCATION
===================================== */

const addCandidateEducation = async (req, res) => {
  try {
    const {
      degree,
      institution,
      stream,
      cgpa,
      educationType,
      startYear,
      endYear,
    } = req.body;

    if (!degree || !institution) {
      return res.status(400).json({
        success: false,
        message: "Degree and institution are required",
      });
    }

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const newEducation = {
      degree: degree.trim(),
      institution: institution.trim(),

      stream:
        stream !== undefined && stream !== null
          ? String(stream).trim()
          : "",

      cgpa:
        cgpa !== undefined && cgpa !== null
          ? String(cgpa).trim()
          : "",

      educationType:
        educationType !== undefined && educationType !== null
          ? String(educationType).trim()
          : "",

      startYear:
        startYear !== undefined && startYear !== null
          ? String(startYear).trim()
          : "",

      endYear:
        endYear !== undefined && endYear !== null
          ? String(endYear).trim()
          : "",
    };

    candidate.education.push(newEducation);

    await candidate.save();

    const updatedCandidate = candidate.toObject();

    delete updatedCandidate.password;

    return res.status(201).json({
      success: true,
      message: "Education added successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Add education error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add education",
    });
  }
};


/* =====================================
   UPDATE EDUCATION
===================================== */

const updateCandidateEducation = async (req, res) => {
  try {
    const { educationId } = req.params;

    const {
      degree,
      institution,
      stream,
      cgpa,
      educationType,
      startYear,
      endYear,
    } = req.body;

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const education = candidate.education.id(educationId);

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education record not found",
      });
    }

    if (degree !== undefined) {
      education.degree = String(degree).trim();
    }

    if (institution !== undefined) {
      education.institution = String(institution).trim();
    }

    if (stream !== undefined) {
      education.stream =
        stream !== null ? String(stream).trim() : "";
    }

    if (cgpa !== undefined) {
      education.cgpa =
        cgpa !== null ? String(cgpa).trim() : "";
    }

    if (educationType !== undefined) {
      education.educationType =
        educationType !== null
          ? String(educationType).trim()
          : "";
    }

    if (startYear !== undefined) {
      education.startYear =
        startYear !== null
          ? String(startYear).trim()
          : "";
    }

    if (endYear !== undefined) {
      education.endYear =
        endYear !== null
          ? String(endYear).trim()
          : "";
    }

    /*
      IMPORTANT:
      Explicitly mark nested education as modified.
      This guarantees Mongoose saves
      the new nested fields.
    */

    candidate.markModified("education");

    await candidate.save();

    const updatedCandidate = candidate.toObject();

    delete updatedCandidate.password;

    return res.status(200).json({
      success: true,
      message: "Education updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Update education error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update education",
    });
  }
};


/* =====================================
   DELETE EDUCATION
===================================== */

const deleteCandidateEducation = async (req, res) => {
  try {
    const { educationId } = req.params;

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const education = candidate.education.id(educationId);

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education record not found",
      });
    }

    education.deleteOne();

    candidate.markModified("education");

    await candidate.save();

    const updatedCandidate = candidate.toObject();

    delete updatedCandidate.password;

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Delete education error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete education",
    });
  }
};


/* =====================================
   ADD EXPERIENCE
===================================== */

const addCandidateExperience = async (req, res) => {
  try {
    const {
      company,
      role,
      startDate,
      endDate,
      description,
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: "Company and role are required",
      });
    }

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.experience.push({
      company: company.trim(),

      role: role.trim(),

      startDate:
        startDate !== undefined && startDate !== null
          ? String(startDate)
          : "",

      endDate:
        endDate !== undefined && endDate !== null
          ? String(endDate)
          : "",

      description:
        description !== undefined && description !== null
          ? String(description).trim()
          : "",
    });

    await candidate.save();

    const updatedCandidate = candidate.toObject();

    delete updatedCandidate.password;

    return res.status(201).json({
      success: true,
      message: "Experience added successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Add experience error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add experience",
    });
  }
};


/* =====================================
   UPDATE EXPERIENCE
===================================== */

const updateCandidateExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const {
      company,
      role,
      startDate,
      endDate,
      description,
    } = req.body;

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const experience =
      candidate.experience.id(experienceId);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience record not found",
      });
    }

    if (company !== undefined) {
      experience.company = String(company).trim();
    }

    if (role !== undefined) {
      experience.role = String(role).trim();
    }

    if (startDate !== undefined) {
      experience.startDate =
        startDate !== null
          ? String(startDate)
          : "";
    }

    if (endDate !== undefined) {
      experience.endDate =
        endDate !== null
          ? String(endDate)
          : "";
    }

    if (description !== undefined) {
      experience.description =
        description !== null
          ? String(description).trim()
          : "";
    }

    candidate.markModified("experience");

    await candidate.save();

    const updatedCandidate = candidate.toObject();

    delete updatedCandidate.password;

    return res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Update experience error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update experience",
    });
  }
};


/* =====================================
   DELETE EXPERIENCE
===================================== */

const deleteCandidateExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const experience =
      candidate.experience.id(experienceId);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience record not found",
      });
    }

    experience.deleteOne();

    candidate.markModified("experience");

    await candidate.save();

    const updatedCandidate = candidate.toObject();

    delete updatedCandidate.password;

    return res.status(200).json({
      success: true,
      message: "Experience deleted successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Delete experience error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete experience",
    });
  }
};


/* =====================================
   UPLOAD / UPDATE RESUME
===================================== */

const uploadCandidateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume",
      });
    }

    const candidate = await Candidate.findById(
      req.candidateId,
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const resumeUrl = `${req.protocol}://${req.get(
      "host",
    )}/uploads/resumes/${req.file.filename}`;

    candidate.resume = {
      name: req.file.originalname,
      url: resumeUrl,
      uploadedAt: new Date(),
    };

    candidate.markModified("resume");

    await candidate.save();

    const updatedCandidate = candidate.toObject();

    delete updatedCandidate.password;

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload resume",
    });
  }
};



/* =====================================
   UPLOAD / UPDATE PROFILE IMAGE
===================================== */

const uploadCandidateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a JPG, PNG or WebP profile image",
      });
    }

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (candidate.profileImage) {
      const oldFileName = candidate.profileImage.split("/").pop();
      const oldFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profile-images",
        oldFileName,
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    candidate.profileImage = `${req.protocol}://${req.get(
      "host",
    )}/uploads/profile-images/${req.file.filename}`;

    await candidate.save();

    const updatedCandidate = candidate.toObject();
    delete updatedCandidate.password;

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error("Upload profile image error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update profile picture",
    });
  }
};

module.exports = {
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
};