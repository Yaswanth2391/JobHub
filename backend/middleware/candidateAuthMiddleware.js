const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");

const candidateAuthMiddleware = async (
  req,
  res,
  next
) => {
  try {
    const authorizationHeader =
      req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization token is required",
      });
    }

    const token =
      authorizationHeader.startsWith(
        "Bearer "
      )
        ? authorizationHeader.split(" ")[1]
        : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    const candidate = await Candidate.findById(
      decoded.id,
    ).select("_id status");

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    if (candidate.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: `This account is ${String(candidate.status || "inactive").toLowerCase()}`,
      });
    }

    // Logged-in candidate ID
    req.candidateId = decoded.id;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

module.exports = candidateAuthMiddleware;