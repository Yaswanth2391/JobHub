const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config();

const app = express();

// Required when the app is deployed behind a reverse proxy (for example Render).
app.set("trust proxy", 1);

/* =====================================
   ROUTE IMPORTS
===================================== */

const candidateAuthRoutes = require("./routes/candidateAuthRoutes");

const candidateProfileRoutes = require(
  "./routes/candidateProfileRoutes"
);

const applicationRoutes = require(
  "./routes/applicationRoutes"
);

const savedJobRoutes = require(
  "./routes/savedJobRoutes"
);

const jobRoutes = require("./routes/jobRoutes");

const companyAdminAuthRoutes = require(
  "./routes/companyAdminAuthRoutes"
);

const companyJobRoutes = require(
  "./routes/companyJobRoutes"
);

const companyApplicationRoutes = require(
  "./routes/companyApplicationRoutes"
);

const companyAdminProfileRoutes = require(
  "./routes/companyAdminProfileRoutes"
);

const jobAlertRoutes = require(
  "./routes/jobAlertRoutes"
);

const superAdminAuthRoutes = require(
  "./routes/superAdminAuthRoutes"
);

const superAdminRoutes = require(
  "./routes/superAdminRoutes"
);

const SuperAdmin = require("./models/SuperAdmin");
const bcrypt = require("bcryptjs");

/* =====================================
   MIDDLEWARE
===================================== */

const configuredClientOrigins = (
  process.env.CLIENT_ORIGINS || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === "production" && configuredClientOrigins.length === 0) {
  throw new Error("CLIENT_ORIGINS must be configured in production.");
}

const corsOptions = configuredClientOrigins.length > 0
  ? {
      origin: (origin, callback) => {
        // Allow server-to-server and local tooling requests without an Origin header.
        if (!origin || configuredClientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin not allowed"));
      },
      credentials: true,
    }
  : {
      // Local development only. Production requires CLIENT_ORIGINS above.
      origin: true,
      credentials: true,
    };

app.use(cors(corsOptions));

app.use(express.json());

/* =====================================
   STATIC UPLOADS
===================================== */

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

/* =====================================
   MONGODB CONNECTION
===================================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log(
      "MongoDB connected successfully 🚀"
    );

    /* =====================================
       ENSURE DEFAULT SUPER ADMIN
    ===================================== */

    const superAdminCount = await SuperAdmin.countDocuments();

    if (superAdminCount === 0) {
      const email = (process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
      const password = process.env.SUPER_ADMIN_PASSWORD || "";

      if (!email || !password) {
        throw new Error(
          "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be configured before the first startup."
        );
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10,
      );

      await SuperAdmin.create({
        fullName: "Super Admin",
        email,
        password: hashedPassword,
        status: "Active",
      });

      console.log(
        `Default Super Admin created: ${email}`
      );


    }
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });

/* =====================================
   TEST ROUTE
===================================== */

app.get("/", (req, res) => {
  res.json({
    message:
      "JobHub Backend is running successfully 🚀",
  });
});

/* =====================================
   CANDIDATE AUTH ROUTES
===================================== */

app.use(
  "/api/candidates/auth",
  candidateAuthRoutes
);

/* =====================================
   CANDIDATE PROFILE ROUTES
===================================== */

app.use(
  "/api/candidate/profile",
  candidateProfileRoutes
);

/* =====================================
   CANDIDATE APPLICATION ROUTES
===================================== */

app.use(
  "/api/candidates/applications",
  applicationRoutes
);

/* =====================================
   CANDIDATE SAVED JOB ROUTES
===================================== */

app.use(
  "/api/candidates/saved-jobs",
  savedJobRoutes
);

/* =====================================
   CANDIDATE JOB ALERT ROUTES
===================================== */

app.use(
  "/api/candidates/job-alerts",
  jobAlertRoutes
);

/* =====================================
   PUBLIC JOB ROUTES
===================================== */

app.use(
  "/api/jobs",
  jobRoutes
);

/* =====================================
   COMPANY ADMIN AUTH ROUTES
===================================== */

app.use(
  "/api/company-admin/auth",
  companyAdminAuthRoutes
);

/* =====================================
   COMPANY ADMIN JOB ROUTES
===================================== */

app.use(
  "/api/company-admin/jobs",
  companyJobRoutes
);

/* =====================================
   COMPANY ADMIN APPLICATION ROUTES
===================================== */

app.use(
  "/api/company-admin/applications",
  companyApplicationRoutes
);

/* =====================================
   COMPANY ADMIN PROFILE ROUTES
===================================== */

app.use(
  "/api/company-admin/profile",
  companyAdminProfileRoutes
);

/* =====================================
   SUPER ADMIN AUTH ROUTES
===================================== */

app.use(
  "/api/super-admin/auth",
  superAdminAuthRoutes
);

/* =====================================
   SUPER ADMIN MANAGEMENT ROUTES
===================================== */

app.use(
  "/api/super-admin",
  superAdminRoutes
);

/* =====================================
   GLOBAL ERROR HANDLER
===================================== */

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled Server Error:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

/* =====================================
   SERVER
===================================== */

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Server is running on port ${PORT}`
    );

    console.log(
      `Local: http://localhost:${PORT}`
    );

    console.log(
      "Network: Use your computer IPv4 address"
    );
  }
);