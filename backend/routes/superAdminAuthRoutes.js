const express = require("express");

const {
  loginSuperAdmin,
  getSuperAdminMe,
} = require("../controllers/superAdminAuthController");

const superAdminAuthMiddleware = require(
  "../middleware/superAdminAuthMiddleware",
);

const router = express.Router();

router.post(
  "/login",
  loginSuperAdmin,
);

router.get(
  "/me",
  superAdminAuthMiddleware,
  getSuperAdminMe,
);

module.exports = router;
