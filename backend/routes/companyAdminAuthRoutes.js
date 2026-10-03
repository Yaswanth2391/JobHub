const express = require(
  "express",
);

const router = express.Router();


const {
  registerCompanyAdmin,
  loginCompanyAdmin,
} = require(
  "../controllers/companyAdminAuthController",
);


/* =====================================
   COMPANY ADMIN SIGN UP
===================================== */

router.post(
  "/signup",
  registerCompanyAdmin,
);


/* =====================================
   COMPANY ADMIN LOGIN
===================================== */

router.post(
  "/login",
  loginCompanyAdmin,
);


module.exports = router;