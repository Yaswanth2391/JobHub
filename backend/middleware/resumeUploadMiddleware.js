const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadDirectory =
  path.join(
    __dirname,
    "..",
    "uploads",
    "resumes"
  );


if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}


const storage = multer.diskStorage({
  destination: (
    req,
    file,
    callback
  ) => {
    callback(
      null,
      uploadDirectory
    );
  },

  filename: (
    req,
    file,
    callback
  ) => {
    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(
        file.originalname
      )}`;

    callback(
      null,
      uniqueName
    );
  },
});


const fileFilter = (
  req,
  file,
  callback
) => {
  if (
    file.mimetype ===
    "application/pdf"
  ) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "Only PDF files are allowed"
      ),
      false
    );
  }
};


const uploadResume = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});


module.exports = uploadResume;