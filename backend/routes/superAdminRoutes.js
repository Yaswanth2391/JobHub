const express = require("express");

const superAdminAuthMiddleware = require(
  "../middleware/superAdminAuthMiddleware",
);

const {
  getDashboard,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyAdmins,
  createCompanyAdmin,
  updateCompanyAdmin,
  deleteCompanyAdmin,
  getUsers,
  updateUser,
  deleteUser,
  getPlatformSettings,
  updatePlatformSettings,
  getSuperAdminProfile,
  updateSuperAdminProfile,
  changeSuperAdminPassword,
} = require("../controllers/superAdminController");

const router = express.Router();

router.use(superAdminAuthMiddleware);

router.get(
  "/dashboard",
  getDashboard,
);

router.get(
  "/companies",
  getCompanies,
);

router.post(
  "/companies",
  createCompany,
);

router.put(
  "/companies/:id",
  updateCompany,
);

router.delete(
  "/companies/:id",
  deleteCompany,
);

router.get(
  "/company-admins",
  getCompanyAdmins,
);

router.post(
  "/company-admins",
  createCompanyAdmin,
);

router.put(
  "/company-admins/:id",
  updateCompanyAdmin,
);

router.delete(
  "/company-admins/:id",
  deleteCompanyAdmin,
);

router.get(
  "/users",
  getUsers,
);

router.put(
  "/users/:id",
  updateUser,
);

router.delete(
  "/users/:id",
  deleteUser,
);

router.get(
  "/platform-settings",
  getPlatformSettings,
);

router.put(
  "/platform-settings",
  updatePlatformSettings,
);

router.get(
  "/profile",
  getSuperAdminProfile,
);

router.put(
  "/profile",
  updateSuperAdminProfile,
);

router.put(
  "/profile/password",
  changeSuperAdminPassword,
);

module.exports = router;
