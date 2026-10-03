const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  getCompanyAdminProfile,
  updateCompanyAdminProfile,
} = require("../controllers/companyAdminProfileController");

const companyAdminAuthMiddleware =
  require("../middleware/companyAdminAuthMiddleware");

/* =====================================
   COMPANY LOGO UPLOAD DIRECTORY
===================================== */

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "company-logos",
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* =====================================
   MULTER STORAGE
===================================== */

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(
      file.originalname,
    );

    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extension}`;

    callback(null, uniqueName);
  },
});

/* =====================================
   COMPANY LOGO FILE FILTER
===================================== */

const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "Only PNG, JPG, JPEG and WebP images are allowed.",
      ),
      false,
    );
  }
};

/* =====================================
   MULTER UPLOAD
===================================== */

const uploadCompanyLogo = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 1 * 1024 * 1024,
  },
});

/* =====================================
   GET COMPANY PROFILE
===================================== */

router.get(
  "/",
  companyAdminAuthMiddleware,
  getCompanyAdminProfile,
);

/* =====================================
   UPDATE COMPANY PROFILE
===================================== */

router.put(
  "/",
  companyAdminAuthMiddleware,
  uploadCompanyLogo.single("companyLogo"),
  updateCompanyAdminProfile,
);

module.exports = router;