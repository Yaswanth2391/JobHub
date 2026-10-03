const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const CompanyAdmin = require("../models/CompanyAdmin");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Application = require("../models/Application");
const PlatformSettings = require("../models/PlatformSettings");
const SuperAdmin = require("../models/SuperAdmin");

const PUBLIC_JOB_STATUSES = ["published", "active"];

const normalizeDateRange = (startDate, endDate) => {
  const now = new Date();
  const defaultEnd = new Date(now);
  defaultEnd.setUTCHours(23, 59, 59, 999);

  const defaultStart = new Date(defaultEnd);
  defaultStart.setUTCDate(defaultStart.getUTCDate() - 29);
  defaultStart.setUTCHours(0, 0, 0, 0);

  const parsedStart = startDate
    ? new Date(`${startDate}T00:00:00.000Z`)
    : defaultStart;

  const parsedEnd = endDate
    ? new Date(`${endDate}T23:59:59.999Z`)
    : defaultEnd;

  if (
    Number.isNaN(parsedStart.getTime()) ||
    Number.isNaN(parsedEnd.getTime())
  ) {
    return {
      start: defaultStart,
      end: defaultEnd,
    };
  }

  return {
    start: parsedStart,
    end: parsedEnd,
  };
};

const createDateSeries = (start, end) => {
  const days = [];
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);

  const final = new Date(end);
  final.setUTCHours(0, 0, 0, 0);

  while (cursor <= final && days.length < 366) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
};

const getRegistrationSeries = async (Model, start, end) => {
  const results = await Model.aggregate([
    {
      $match: {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return new Map(
    results.map((item) => [
      item._id,
      item.count,
    ]),
  );
};

const getCompanyNames = async () => {
  const names = await CompanyAdmin.distinct("companyName");

  return names.filter(Boolean);
};

const buildRecentActivity = async () => {
  const [companies, admins, candidates, jobs] =
    await Promise.all([
      CompanyAdmin.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .select("companyName email createdAt"),
      CompanyAdmin.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .select("companyName email createdAt"),
      Candidate.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .select("fullName email createdAt"),
      Job.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .select("jobTitle companyName status createdAt"),
    ]);

  const activity = [];

  companies.forEach((item) => {
    activity.push({
      id: `company-${item._id}`,
      type: "company",
      title: "New company registered",
      description: item.companyName || item.email,
      createdAt: item.createdAt,
    });
  });

  admins.forEach((item) => {
    activity.push({
      id: `admin-${item._id}`,
      type: "admin",
      title: "Company admin added",
      description: item.email,
      createdAt: item.createdAt,
    });
  });

  candidates.forEach((item) => {
    activity.push({
      id: `user-${item._id}`,
      type: "user",
      title: "New user registered",
      description: item.email || item.fullName,
      createdAt: item.createdAt,
    });
  });

  jobs.forEach((item) => {
    activity.push({
      id: `job-${item._id}`,
      type: "job",
      title: "Job posted",
      description: `${item.jobTitle || "Job"}${
        item.companyName ? ` · ${item.companyName}` : ""
      }`,
      createdAt: item.createdAt,
    });
  });

  return activity
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt),
    )
    .slice(0, 8);
};

const getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query || {};
    const { start, end } = normalizeDateRange(
      startDate,
      endDate,
    );

    const [companyNames, companyAdmins, users, jobs, hired, closed, draft, registrationsCandidates, registrationsCompanies, recentActivity] =
      await Promise.all([
        getCompanyNames(),
        CompanyAdmin.countDocuments({}),
        Candidate.countDocuments({}),
        Job.countDocuments({}),
        Application.countDocuments({
          status: "Hired",
        }),
        Job.countDocuments({
          status: "closed",
        }),
        Job.countDocuments({
          status: "draft",
        }),
        getRegistrationSeries(
          Candidate,
          start,
          end,
        ),
        getRegistrationSeries(
          CompanyAdmin,
          start,
          end,
        ),
        buildRecentActivity(),
      ]);

    const now = new Date();

    const active = await Job.countDocuments({
      status: {
        $in: PUBLIC_JOB_STATUSES,
      },
      applicationDeadline: {
        $gte: now,
      },
    });

    const expired = await Job.countDocuments({
      applicationDeadline: {
        $lt: now,
      },
      status: {
        $in: PUBLIC_JOB_STATUSES,
      },
    });

    const dateSeries = createDateSeries(
      start,
      end,
    );

    const registrations = dateSeries.map((date) => ({
      date,
      candidates:
        registrationsCandidates.get(date) || 0,
      companies:
        registrationsCompanies.get(date) || 0,
    }));

    return res.status(200).json({
      success: true,
      range: {
        startDate: start
          .toISOString()
          .slice(0, 10),
        endDate: end
          .toISOString()
          .slice(0, 10),
      },
      stats: {
        companies: companyNames.length,
        companyAdmins,
        users,
        activeJobs: active,
        jobs,
        hired,
      },
      jobStatus: {
        active,
        closed,
        draft,
        expired,
      },
      registrations,
      recentActivity,
    });
  } catch (error) {
    console.error(
      "Super Admin Dashboard Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
    });
  }
};

const getCompanies = async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1,
    );
    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 10,
        1,
      ),
      50,
    );
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const industry = (req.query.industry || "").trim();

    const match = {};

    if (search) {
      match.companyName = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      match.status = status;
    }

    if (industry) {
      match.industry = industry;
    }

    const [industries, grouped] = await Promise.all([
      CompanyAdmin.distinct("industry", {
        industry: { $exists: true, $nin: ["", null] },
      }),
      CompanyAdmin.aggregate([
        { $match: match },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$companyName",
          companyName: {
            $first: "$companyName",
          },
          industry: {
            $first: "$industry",
          },
          location: {
            $first: "$location",
          },
          status: {
            $first: "$status",
          },
          logo: {
            $first: "$companyLogo",
          },
          registeredOn: {
            $first: "$createdAt",
          },
          adminCount: {
            $sum: 1,
          },
          adminId: {
            $first: "$_id",
          },
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "companyName",
          foreignField: "companyName",
          as: "jobs",
        },
      },
      {
        $addFields: {
          jobs: {
            $size: "$jobs",
          },
        },
      },
      {
        $sort: {
          registeredOn: -1,
        },
      },
      ]),
    ]);

    const total = grouped.length;
    const startIndex = (page - 1) * limit;
    const companies = grouped.slice(
      startIndex,
      startIndex + limit,
    );

    return res.status(200).json({
      success: true,
      companies,
      industries: industries.sort(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(
          Math.ceil(total / limit),
          1,
        ),
      },
    });
  } catch (error) {
    console.error(
      "Super Admin Companies Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load companies",
    });
  }
};

const createCompany = async (req, res) => {
  try {
    const {
      companyName,
      email,
      phone,
      password,
      industry,
      location,
    } = req.body || {};

    if (
      !companyName ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, email, phone and password are required",
      });
    }

    const existing = await CompanyAdmin.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    const companyAdmin = await CompanyAdmin.create({
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      industry: (industry || "").trim(),
      location: (location || "").trim(),
      status: "Active",
      role: "Company Admin",
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      company: {
        id: companyAdmin._id,
        companyName: companyAdmin.companyName,
        email: companyAdmin.email,
        phone: companyAdmin.phone,
        industry: companyAdmin.industry,
        location: companyAdmin.location,
        status: companyAdmin.status,
        createdAt: companyAdmin.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Super Admin Create Company Error:",
      error,
    );

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create company",
    });
  }
};

const updateCompany = async (req, res) => {
  try {
    const companyAdminId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(companyAdminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    const companyAdmin = await CompanyAdmin.findById(
      companyAdminId,
    );

    if (!companyAdmin) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const oldCompanyName = companyAdmin.companyName;
    const {
      companyName,
      industry,
      location,
      status,
    } = req.body || {};

    if (companyName !== undefined) {
      const nextCompanyName = String(
        companyName,
      ).trim();

      if (!nextCompanyName) {
        return res.status(400).json({
          success: false,
          message: "Company name is required",
        });
      }

      companyAdmin.companyName = nextCompanyName;
    }

    if (industry !== undefined) {
      companyAdmin.industry = String(
        industry,
      ).trim();
    }

    if (location !== undefined) {
      companyAdmin.location = String(
        location,
      ).trim();
    }

    if (status !== undefined) {
      companyAdmin.status = status;
    }

    await companyAdmin.save();

    const updatePayload = {
      companyName: companyAdmin.companyName,
      industry: companyAdmin.industry,
      location: companyAdmin.location,
      status: companyAdmin.status,
    };

    await CompanyAdmin.updateMany(
      {
        companyName: oldCompanyName,
        _id: {
          $ne: companyAdmin._id,
        },
      },
      updatePayload,
    );

    if (
      companyAdmin.companyName !==
      oldCompanyName
    ) {
      await Job.updateMany(
        {
          companyName: oldCompanyName,
        },
        {
          $set: {
            companyName:
              companyAdmin.companyName,
          },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
    });
  } catch (error) {
    console.error(
      "Super Admin Update Company Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update company",
    });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    const companyAdmin = await CompanyAdmin.findById(
      id,
    );

    if (!companyAdmin) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const companyName = companyAdmin.companyName;

    await CompanyAdmin.deleteMany({
      companyName,
    });

    await Job.updateMany(
      {
        companyName,
      },
      {
        $set: {
          status: "closed",
        },
      },
    );

    return res.status(200).json({
      success: true,
      message:
        "Company removed and its jobs were closed",
    });
  } catch (error) {
    console.error(
      "Super Admin Delete Company Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to remove company",
    });
  }
};

const getCompanyAdmins = async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1,
    );
    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 10,
        1,
      ),
      50,
    );
    const search = (req.query.search || "").trim();
    const company = (req.query.company || "").trim();
    const status = (req.query.status || "").trim();

    const query = {};

    if (search) {
      query.$or = [
        {
          companyName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          role: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (company) {
      query.companyName = company;
    }

    if (status) {
      query.status = status;
    }

    const [admins, total, companies] = await Promise.all([
      CompanyAdmin.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "_id companyName email phone role status industry location createdAt updatedAt",
        ),
      CompanyAdmin.countDocuments(query),
      getCompanyNames(),
    ]);

    return res.status(200).json({
      success: true,
      admins,
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(
          Math.ceil(total / limit),
          1,
        ),
      },
    });
  } catch (error) {
    console.error(
      "Super Admin Company Admins Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load company admins",
    });
  }
};

const createCompanyAdmin = async (req, res) => {
  try {
    const {
      companyName,
      email,
      phone,
      password,
      role,
    } = req.body || {};

    if (
      !companyName ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company, email, phone and password are required",
      });
    }

    const existing = await CompanyAdmin.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    const admin = await CompanyAdmin.create({
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      role: (role || "Company Admin").trim(),
      status: "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Company admin created successfully",
      admin: {
        id: admin._id,
        companyName: admin.companyName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        status: admin.status,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Super Admin Create Company Admin Error:",
      error,
    );

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create company admin",
    });
  }
};

const updateCompanyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
    }

    const admin = await CompanyAdmin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Company admin not found",
      });
    }

    const {
      companyName,
      email,
      phone,
      role,
      status,
      industry,
      location,
      password,
    } = req.body || {};

    if (email !== undefined) {
      const normalizedEmail = String(
        email,
      ).trim().toLowerCase();

      const existing = await CompanyAdmin.findOne({
        email: normalizedEmail,
        _id: {
          $ne: id,
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "An account already exists with this email",
        });
      }

      admin.email = normalizedEmail;
    }

    if (companyName !== undefined) {
      admin.companyName = String(companyName).trim();
    }

    if (phone !== undefined) {
      admin.phone = String(phone).trim();
    }

    if (role !== undefined) {
      admin.role = String(role).trim();
    }

    if (status !== undefined) {
      admin.status = status;
    }

    if (industry !== undefined) {
      admin.industry = String(industry).trim();
    }

    if (location !== undefined) {
      admin.location = String(location).trim();
    }

    if (password) {
      admin.password = await bcrypt.hash(
        String(password),
        10,
      );
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Company admin updated successfully",
    });
  } catch (error) {
    console.error(
      "Super Admin Update Company Admin Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update company admin",
    });
  }
};

const deleteCompanyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
    }

    const deleted = await CompanyAdmin.findByIdAndDelete(
      id,
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Company admin not found",
      });
    }

    await Job.updateMany(
      {
        companyAdmin: id,
      },
      {
        $set: {
          status: "closed",
        },
      },
    );

    return res.status(200).json({
      success: true,
      message:
        "Company admin removed and linked jobs were closed",
    });
  } catch (error) {
    console.error(
      "Super Admin Delete Company Admin Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to remove company admin",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1,
    );
    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 10,
        1,
      ),
      50,
    );
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const location = (req.query.location || "").trim();

    const query = {};

    if (search) {
      query.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    const [users, total, locations] = await Promise.all([
      Candidate.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "_id fullName email phone location status createdAt updatedAt",
        ),
      Candidate.countDocuments(query),
      Candidate.distinct("location"),
    ]);

    return res.status(200).json({
      success: true,
      users,
      locations: locations.filter(Boolean).sort(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(
          Math.ceil(total / limit),
          1,
        ),
      },
    });
  } catch (error) {
    console.error(
      "Super Admin Users Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load users",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await Candidate.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      fullName,
      email,
      phone,
      location,
      status,
    } = req.body || {};

    if (email !== undefined) {
      const normalizedEmail = String(
        email,
      ).trim().toLowerCase();

      const existing = await Candidate.findOne({
        email: normalizedEmail,
        _id: {
          $ne: id,
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "An account already exists with this email",
        });
      }

      user.email = normalizedEmail;
    }

    if (fullName !== undefined) {
      user.fullName = String(fullName).trim();
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (location !== undefined) {
      user.location = String(location).trim();
    }

    if (status !== undefined) {
      user.status = status;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error(
      "Super Admin Update User Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const deleted = await Candidate.findByIdAndDelete(
      id,
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    console.error(
      "Super Admin Delete User Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to remove user",
    });
  }
};

const getPlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne({});

    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "Get Platform Settings Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load platform settings",
    });
  }
};

const updatePlatformSettings = async (req, res) => {
  try {
    const allowedFields = [
      "platformName",
      "tagline",
      "supportEmail",
      "supportPhone",
      "maintenanceMode",
      "allowNewRegistrations",
      "maxJobsPerCompany",
      "jobCategories",
      "jobLocations",
      "emailTemplates",
      "systemConfiguration",
    ];

    const payload = {};

    allowedFields.forEach((field) => {
      if (req.body?.[field] !== undefined) {
        payload[field] = req.body[field];
      }
    });

    if (payload.maxJobsPerCompany !== undefined) {
      payload.maxJobsPerCompany = Math.max(
        Number(payload.maxJobsPerCompany) || 1,
        1,
      );
    }

    let settings = await PlatformSettings.findOne({});

    if (!settings) {
      settings = await PlatformSettings.create(
        payload,
      );
    } else {
      Object.assign(settings, payload);
      await settings.save();
    }

    return res.status(200).json({
      success: true,
      message: "Platform settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error(
      "Update Platform Settings Error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save platform settings",
    });
  }
};


const getSuperAdminProfile = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin
      .findById(req.superAdmin._id)
      .select("_id fullName email role status createdAt updatedAt lastLoginAt");

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super admin account not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile: superAdmin,
    });
  } catch (error) {
    console.error("Get Super Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load super admin profile",
    });
  }
};

const updateSuperAdminProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body || {};

    const normalizedName = String(fullName || "").trim();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required",
      });
    }

    const existing = await SuperAdmin.findOne({
      email: normalizedEmail,
      _id: { $ne: req.superAdmin._id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Another super admin already uses this email",
      });
    }

    const superAdmin = await SuperAdmin.findById(
      req.superAdmin._id,
    );

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super admin account not found",
      });
    }

    superAdmin.fullName = normalizedName;
    superAdmin.email = normalizedEmail;

    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: superAdmin._id,
        fullName: superAdmin.fullName,
        email: superAdmin.email,
        role: superAdmin.role,
        status: superAdmin.status,
        lastLoginAt: superAdmin.lastLoginAt,
      },
    });
  } catch (error) {
    console.error("Update Super Admin Profile Error:", error);

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Another super admin already uses this email",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update super admin profile",
    });
  }
};

const changeSuperAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (String(currentPassword) === String(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    const superAdmin = await SuperAdmin.findById(
      req.superAdmin._id,
    );

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super admin account not found",
      });
    }

    const passwordMatches = await bcrypt.compare(
      String(currentPassword),
      superAdmin.password,
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    superAdmin.password = await bcrypt.hash(
      String(newPassword),
      10,
    );

    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please sign in again.",
    });
  } catch (error) {
    console.error("Change Super Admin Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};

module.exports = {
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
};
