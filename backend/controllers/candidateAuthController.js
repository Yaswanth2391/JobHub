const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const Candidate = require("../models/Candidate");
const PlatformSettings = require("../models/PlatformSettings");

// =====================================
// CREATE JWT TOKEN
// =====================================

const createCandidateToken = (candidateId) => {
  return jwt.sign(
    {
      id: candidateId,
      role: "candidate",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// =====================================
// REGISTER CANDIDATE
// =====================================

const registerCandidate = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const platformSettings = await PlatformSettings.findOne({});

    if (platformSettings?.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: "JobHub is currently in maintenance mode. Please try again later.",
      });
    }

    if (platformSettings?.allowNewRegistrations === false) {
      return res.status(403).json({
        success: false,
        message: "New registrations are currently disabled.",
      });
    }

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingCandidate = await Candidate.findOne({
      email: email.toLowerCase(),
    });

    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const candidate = await Candidate.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    const token = createCandidateToken(candidate._id);

    return res.status(201).json({
      success: true,
      message: "Candidate registered successfully",

      token,

      candidate: {
        id: candidate._id,

        fullName: candidate.fullName,

        email: candidate.email,

        phone: candidate.phone,

        profileImage: candidate.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Register Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while registering candidate",
    });
  }
};

// =====================================
// LOGIN CANDIDATE
// =====================================

const loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const candidate = await Candidate.findOne({
      email: email.toLowerCase(),
    });

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (candidate.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: `This account is ${String(candidate.status || "inactive").toLowerCase()}`,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      candidate.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createCandidateToken(candidate._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      candidate: {
        id: candidate._id,

        fullName: candidate.fullName,

        email: candidate.email,

        phone: candidate.phone,

        profileImage: candidate.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Login Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while logging in",
    });
  }
};

// =====================================
// GET CANDIDATE PROFILE
// =====================================

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
    console.error("Get Candidate Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
};

// =====================================
// UPDATE CANDIDATE PROFILE
// =====================================

const updateCandidateProfile = async (req, res) => {
  try {
    const { fullName, phone, location, dateOfBirth, gender, bio, skills } =
      req.body;

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (fullName !== undefined) {
      candidate.fullName = fullName;
    }

    if (phone !== undefined) {
      candidate.phone = phone;
    }

    if (location !== undefined) {
      candidate.location = location;
    }

    if (dateOfBirth !== undefined) {
      candidate.dateOfBirth = dateOfBirth;
    }

    if (gender !== undefined) {
      candidate.gender = gender;
    }

    if (bio !== undefined) {
      candidate.bio = bio;
    }

    if (skills !== undefined) {
      candidate.skills = Array.isArray(skills) ? skills : [];
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
    console.error("Update Candidate Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

// =====================================
// UPLOAD / UPDATE RESUME
// =====================================

const uploadCandidateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume",
      });
    }

    const candidate = await Candidate.findById(req.candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Delete old resume if it exists

    if (candidate.resume?.url) {
      const oldFileName = candidate.resume.url.split("/").pop();

      const oldFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        "resumes",
        oldFileName,
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Save new resume information

    const resumeUrl = `${req.protocol}://${req.get(
      "host",
    )}/uploads/resumes/${req.file.filename}`;

    candidate.resume = {
      name: req.file.originalname,

      url: resumeUrl,

      uploadedAt: new Date(),
    };

    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",

      candidate: {
        ...candidate.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Upload Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload resume",
    });
  }
};

// =====================================
// EXPORT CONTROLLERS
// =====================================

module.exports = {
  registerCandidate,
  loginCandidate,
  getCandidateProfile,
  updateCandidateProfile,
  uploadCandidateResume,
};
