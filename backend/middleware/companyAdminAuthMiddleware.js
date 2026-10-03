const jwt = require("jsonwebtoken");
const CompanyAdmin = require("../models/CompanyAdmin");


/* =====================================
   COMPANY ADMIN AUTH MIDDLEWARE
===================================== */

const companyAdminAuthMiddleware = async (
  req,
  res,
  next,
) => {
  try {
    const authorizationHeader =
      req.headers.authorization;


    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith(
        "Bearer ",
      )
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Company admin authorization required",
      });
    }


    /* ===============================
       GET TOKEN
    =============================== */

    const token =
      authorizationHeader.split(
        " ",
      )[1];


    /* ===============================
       VERIFY TOKEN
    =============================== */

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET,
      );


    /* ===============================
       CHECK ROLE
    =============================== */

    if (
      decoded.role !==
      "companyAdmin"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Access denied",
      });
    }


    /* ===============================
       VERIFY ADMIN ACCOUNT STATUS
    =============================== */

    const companyAdmin = await CompanyAdmin.findById(
      decoded.id,
    ).select("_id status role");

    if (!companyAdmin) {
      return res.status(401).json({
        success: false,
        message: "Company admin account not found",
      });
    }

    if (companyAdmin.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: `This account is ${String(companyAdmin.status || "inactive").toLowerCase()}`,
      });
    }

    /* ===============================
       SAVE ADMIN DATA
    =============================== */

    req.companyAdmin = {
      id: decoded.id,
      role: decoded.role,
    };

    next();

  } catch (error) {

    console.error(
      "Company Admin Auth Error:",
      error.message,
    );

    return res.status(401).json({
      success: false,

      message:
        "Invalid or expired company admin token",
    });
  }
};


module.exports =
  companyAdminAuthMiddleware;