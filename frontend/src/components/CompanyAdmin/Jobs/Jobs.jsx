import {
  Bell,
  Plus,
  BriefcaseBusiness,
  MapPin,
  Building2,
  CalendarDays,
  Users,
  X,
  Save,
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import AdminSidebar from "../AdminSidebar/AdminSidebar";

import API_BASE_URL from "../../../services/api";

import "./Jobs.css";

function Jobs() {
  const getCompanyAdminData = () => {
    try {
      const storedAdmin = localStorage.getItem("jobhubCompanyAdmin");
      return storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch (error) {
      console.error("Unable to load company admin data:", error);
      return null;
    }
  };

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [jobsLoading, setJobsLoading] = useState(true);

  const [jobs, setJobs] = useState([]);

  const [skillInput, setSkillInput] = useState("");

  const [editingJobId, setEditingJobId] = useState(null);

  /* =====================================
     JOB FILTER STATES
  ===================================== */

  const [activeTab, setActiveTab] =
    useState("published");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [showFilter, setShowFilter] =
    useState(false);

  const [jobTypeFilter, setJobTypeFilter] =
    useState("all");

  /* =====================================
     PAGINATION
  ===================================== */

  const [currentPage, setCurrentPage] =
    useState(1);

  const jobsPerPage = 6;

  /* =====================================
     FORM DATA
  ===================================== */

  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    jobType: "",
    location: "",
    experience: "",
    openings: "",
    description: "",
    skills: [],
    applicationDeadline: "",
  });

  /* =====================================
     GET COMPANY JOBS
  ===================================== */

  const fetchJobs = async () => {
    const token = localStorage.getItem(
      "jobhubCompanyAdminToken"
    );

    if (!token) {
      setJobsLoading(false);
      return;
    }

    try {
      setJobsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch jobs"
        );
      }

      setJobs(data.jobs || []);
    } catch (error) {
      console.error(
        "Fetch jobs error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to load jobs"
      );
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  /* =====================================
     JOB COUNTS
  ===================================== */

  const activeJobsCount =
    jobs.filter(
      (job) =>
        job.status === "published"
    ).length;

  const closedJobsCount =
    jobs.filter(
      (job) =>
        job.status === "closed"
    ).length;

  const draftJobsCount =
    jobs.filter(
      (job) =>
        job.status === "draft"
    ).length;

  /* =====================================
     FILTER JOBS
  ===================================== */

  const filteredJobs = jobs.filter(
    (job) => {
      /* STATUS */

      if (
        job.status !== activeTab
      ) {
        return false;
      }

      /* SEARCH */

      const search =
        searchQuery
          .trim()
          .toLowerCase();

      if (search) {
        const searchableText = `
          ${job.jobTitle || ""}
          ${job.department || ""}
          ${job.location || ""}
          ${job.jobType || ""}
        `.toLowerCase();

        if (
          !searchableText.includes(
            search
          )
        ) {
          return false;
        }
      }

      /* JOB TYPE */

      if (
        jobTypeFilter !== "all" &&
        job.jobType !==
          jobTypeFilter
      ) {
        return false;
      }

      return true;
    }
  );

  /* =====================================
     PAGINATION
  ===================================== */

  const totalPages = Math.ceil(
    filteredJobs.length /
      jobsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    jobsPerPage;

  const paginatedJobs =
    filteredJobs.slice(
      startIndex,
      startIndex + jobsPerPage
    );

  /* =====================================
     RESET PAGE WHEN FILTER CHANGES
  ===================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    searchQuery,
    jobTypeFilter,
  ]);

  /* =====================================
     HANDLE INPUT
  ===================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =====================================
     ADD SKILL
  ===================================== */

  const addSkill = () => {
    const trimmedSkill =
      skillInput.trim();

    if (!trimmedSkill) {
      return;
    }

    if (
      formData.skills.includes(
        trimmedSkill
      )
    ) {
      toast.warning(
        "Skill already added"
      );

      return;
    }

    setFormData(
      (previous) => ({
        ...previous,
        skills: [
          ...previous.skills,
          trimmedSkill,
        ],
      })
    );

    setSkillInput("");
  };

  /* =====================================
     REMOVE SKILL
  ===================================== */

  const removeSkill = (skill) => {
    setFormData(
      (previous) => ({
        ...previous,
        skills:
          previous.skills.filter(
            (item) =>
              item !== skill
          ),
      })
    );
  };

  /* =====================================
     RESET FORM
  ===================================== */

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      department: "",
      jobType: "",
      location: "",
      experience: "",
      openings: "",
      description: "",
      skills: [],
      applicationDeadline: "",
    });

    setSkillInput("");

    setEditingJobId(null);
  };

  /* =====================================
     OPEN CREATE FORM
  ===================================== */

  const openCreateForm = () => {
    resetForm();

    setShowForm(true);
  };

  /* =====================================
     OPEN EDIT FORM
  ===================================== */

  const openEditForm = (job) => {
    const deadline =
      job.applicationDeadline
        ? new Date(
            job.applicationDeadline
          )
            .toISOString()
            .split("T")[0]
        : "";

    setFormData({
      jobTitle:
        job.jobTitle || "",

      department:
        job.department || "",

      jobType:
        job.jobType || "",

      location:
        job.location || "",

      experience:
        job.experience || "",

      openings:
        job.openings || "",

      description:
        job.description || "",

      skills:
        Array.isArray(
          job.skills
        )
          ? job.skills
          : [],

      applicationDeadline:
        deadline,
    });

    setSkillInput("");

    setEditingJobId(
      job._id
    );

    setShowForm(true);
  };

  /* =====================================
     SUBMIT CREATE / UPDATE JOB
  ===================================== */

  const handleSubmit = async (
    event,
    status
  ) => {
    event.preventDefault();

    const token =
      localStorage.getItem(
        "jobhubCompanyAdminToken"
      );

    if (!token) {
      toast.error(
        "Please login again"
      );

      return;
    }

    const requiredFields = [
      ["Job Title", formData.jobTitle],
      ["Department", formData.department],
      ["Job Type", formData.jobType],
      ["Location", formData.location],
      ["Experience Required", formData.experience],
      ["Number of Openings", formData.openings],
      ["Job Description", formData.description],
      ["Application Deadline", formData.applicationDeadline],
    ];

    const missingField = requiredFields.find(
      ([, value]) =>
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    );

    if (missingField) {
      toast.error(
        `Please fill the ${missingField[0]} field.`
      );

      return;
    }

    if (formData.skills.length === 0) {
      toast.error(
        "Please add at least one required skill"
      );

      return;
    }

    const openingsNumber = Number(formData.openings);

    if (!Number.isInteger(openingsNumber) || openingsNumber < 1) {
      toast.error(
        "Number of openings must be at least 1."
      );

      return;
    }

    const isEditing = Boolean(editingJobId);

    try {
      setLoading(true);

      const url = isEditing
        ? `${API_BASE_URL}/api/company-admin/jobs/${editingJobId}`
        : `${API_BASE_URL}/api/company-admin/jobs`;

      const response =
        await fetch(url, {
          method: isEditing
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ...formData,
            status,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Unable to update job"
              : "Unable to save job")
        );
      }

      toast.success(
        data.message
      );

      resetForm();

      setShowForm(false);

      await fetchJobs();
    } catch (error) {
      console.error(
        isEditing
          ? "Update job error:"
          : "Create job error:",
        error
      );

      toast.error(
        error.message ||
          (editingJobId
            ? "Unable to update job"
            : "Unable to save job")
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     DELETE JOB
  ===================================== */

  const handleDelete = async (
    jobId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem(
        "jobhubCompanyAdminToken"
      );

    if (!token) {
      toast.error(
        "Please login again"
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_BASE_URL}/api/company-admin/jobs/${jobId}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete job"
        );
      }

      toast.success(
        data.message
      );

      setJobs(
        (previous) =>
          previous.filter(
            (job) =>
              job._id !== jobId
          )
      );
    } catch (error) {
      console.error(
        "Delete job error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to delete job"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     CLEAR FILTERS
  ===================================== */

  const clearFilters = () => {
    setSearchQuery("");
    setJobTypeFilter("all");
    setCurrentPage(1);
  };

  /* =====================================
     GET APPLICATION COUNT
     
     We don't have an applicationCount
     field in the Job model yet.
     
     So don't show fake numbers.
  ===================================== */

  const getApplicationCount = (
    job
  ) => {
    if (
      typeof job.applicationCount ===
      "number"
    ) {
      return job.applicationCount;
    }

    if (
      typeof job.applicationsCount ===
      "number"
    ) {
      return job.applicationsCount;
    }

    if (
      Array.isArray(
        job.applications
      )
    ) {
      return job.applications.length;
    }

    return "—";
  };

  const companyAdmin = getCompanyAdminData();
  const companyName = companyAdmin?.companyName || "Company";
  const companyInitial = companyName.charAt(0).toUpperCase();

  return (
    <main className="companyJobsPage">
      <AdminSidebar />

      <section className="companyJobsMain">
        {/* =====================================
            TOPBAR
        ===================================== */}

        <header className="companyJobsTopbar">
          {/* MOBILE LOGO */}

          <div className="companyJobsMobileLogo">
            <span>J</span>
            obHub
          </div>

          {/* JOB TABS */}

          <div className="companyJobsTabs">
            <button
              type="button"
              className={
                activeTab ===
                "published"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "published"
                )
              }
            >
              Active (
              {activeJobsCount}
              )
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "closed"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "closed"
                )
              }
            >
              Closed (
              {closedJobsCount}
              )
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "draft"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "draft"
                )
              }
            >
              Drafts (
              {draftJobsCount}
              )
            </button>
          </div>

          {/* SEARCH + FILTER */}

          <div className="companyJobsToolbar">
            <div className="companyJobsSearch">
              <Search size={15} />

              <input
                type="text"
                placeholder="Search jobs..."
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event.target
                      .value
                  )
                }
              />

              {searchQuery && (
                <button
                  type="button"
                  className="companyJobsSearchClear"
                  onClick={() =>
                    setSearchQuery(
                      ""
                    )
                  }
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="companyJobsFilterWrapper">
              <button
                type="button"
                className={`companyJobsFilterButton ${
                  jobTypeFilter !==
                  "all"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setShowFilter(
                    (previous) =>
                      !previous
                  )
                }
              >
                <SlidersHorizontal
                  size={15}
                />

                <span>
                  Filter
                </span>
              </button>

              {showFilter && (
                <div className="companyJobsFilterMenu">
                  <div className="companyJobsFilterHeader">
                    <strong>
                      Filter by Job Type
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        setShowFilter(
                          false
                        )
                      }
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {[
                    "all",
                    "Full Time",
                    "Part Time",
                    "Internship",
                    "Contract",
                    "Remote",
                  ].map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        className={
                          jobTypeFilter ===
                          type
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setJobTypeFilter(
                            type
                          );

                          setShowFilter(
                            false
                          );
                        }}
                      >
                        {type ===
                        "all"
                          ? "All Job Types"
                          : type}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* COMPANY ADMIN */}

          <div className="companyJobsTopbarRight">
            <button
              type="button"
              className="companyJobsNotification"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="companyJobsAdmin">
              <div className="companyJobsAdminAvatar">
                {companyInitial}
              </div>

              <div className="companyJobsAdminInfo">
                <strong>{companyName}</strong>
                <span>Company Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================
            CONTENT
        ===================================== */}

        <section className="companyJobsContent">
          {/* HEADING */}

          <div className="companyJobsHeading">
            <div>
              <h1>
                Jobs
              </h1>

              <p>
                Create and manage your company job postings.
              </p>
            </div>

            <button
              type="button"
              className="companyJobsDesktopPostButton"
              onClick={
                openCreateForm
              }
              disabled={loading}
            >
              <Plus size={18} />

              Post New Job
            </button>
          </div>

          {/* =====================================
              LOADING
          ===================================== */}

          {jobsLoading && (
            <div className="companyJobsLoading">
              Loading your jobs...
            </div>
          )}

          {/* =====================================
              JOB TABLE
          ===================================== */}

          {!jobsLoading &&
            filteredJobs.length >
              0 && (
              <>
                <div className="companyJobsTableWrapper">
                  <table className="companyJobsTable">
                    <thead>
                      <tr>
                        <th>
                          Job Title
                        </th>

                        <th>
                          Department
                        </th>

                        <th>
                          Location
                        </th>

                        <th>
                          Applications
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedJobs.map(
                        (job) => (
                          <tr
                            key={
                              job._id
                            }
                          >
                            {/* JOB TITLE */}

                            <td>
                              <div className="companyJobsTableTitle">
                                <strong>
                                  {
                                    job.jobTitle
                                  }
                                </strong>

                                <span>
                                  <BriefcaseBusiness
                                    size={
                                      13
                                    }
                                  />

                                  {
                                    job.jobType
                                  }
                                </span>
                              </div>
                            </td>

                            {/* DEPARTMENT */}

                            <td>
                              <span className="companyJobsTableText">
                                <Building2
                                  size={
                                    14
                                  }
                                />

                                {
                                  job.department
                                }
                              </span>
                            </td>

                            {/* LOCATION */}

                            <td>
                              <span className="companyJobsTableText">
                                <MapPin
                                  size={
                                    14
                                  }
                                />

                                {
                                  job.location
                                }
                              </span>
                            </td>

                            {/* APPLICATIONS */}

                            <td>
                              <span className="companyJobsApplicationCount">
                                {
                                  getApplicationCount(
                                    job
                                  )
                                }
                              </span>
                            </td>

                            {/* STATUS */}

                            <td>
                              <span
                                className={`companyJobsTableStatus ${job.status}`}
                              >
                                {job.status ===
                                "published"
                                  ? "Active"
                                  : job.status ===
                                    "draft"
                                  ? "Draft"
                                  : "Closed"}
                              </span>
                            </td>

                            {/* ACTIONS */}

                            <td>
                              <div className="companyJobsTableActions">
                                <button
                                  type="button"
                                  className="companyJobsViewButton"
                                  title="View Job"
                                  onClick={() =>
                                    openEditForm(
                                      job
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                >
                                  <Eye
                                    size={
                                      16
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="companyJobsEditButton"
                                  title="Edit Job"
                                  onClick={() =>
                                    openEditForm(
                                      job
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                >
                                  <Pencil
                                    size={
                                      16
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="companyJobsDeleteButton"
                                  title="Delete Job"
                                  onClick={() =>
                                    handleDelete(
                                      job._id
                                    )
                                  }
                                  disabled={
                                    loading
                                  }
                                >
                                  <Trash2
                                    size={
                                      16
                                    }
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =====================================
                    PAGINATION
                ===================================== */}

                {totalPages >
                  1 && (
                  <div className="companyJobsPagination">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (previous) =>
                            Math.max(
                              previous -
                                1,
                              1
                            )
                        )
                      }
                      disabled={
                        currentPage ===
                        1
                      }
                      aria-label="Previous page"
                    >
                      <ChevronLeft
                        size={17}
                      />
                    </button>

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (
                        _,
                        index
                      ) => {
                        const page =
                          index +
                          1;

                        return (
                          <button
                            key={
                              page
                            }
                            type="button"
                            className={
                              currentPage ===
                              page
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              setCurrentPage(
                                page
                              )
                            }
                          >
                            {
                              page
                            }
                          </button>
                        );
                      }
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (previous) =>
                            Math.min(
                              previous +
                                1,
                              totalPages
                            )
                        )
                      }
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      aria-label="Next page"
                    >
                      <ChevronRight
                        size={17}
                      />
                    </button>
                  </div>
                )}
              </>
            )}

          {/* =====================================
              EMPTY STATE
          ===================================== */}

          {!jobsLoading &&
            filteredJobs.length ===
              0 && (
              <div className="companyJobsEmpty">
                <div className="companyJobsEmptyIcon">
                  <BriefcaseBusiness
                    size={32}
                  />
                </div>

                <h2>
                  {jobs.length ===
                  0
                    ? "No jobs posted yet"
                    : "No matching jobs"}
                </h2>

                <p>
                  {jobs.length ===
                  0
                    ? "Create your first job posting and start finding the right candidates."
                    : "Try changing your search or filter to find the job you are looking for."}
                </p>

                {jobs.length ===
                0 ? (
                  <button
                    type="button"
                    onClick={
                      openCreateForm
                    }
                    disabled={
                      loading
                    }
                  >
                    <Plus
                      size={17}
                    />

                    Post Your First Job
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
        </section>

        {/* =====================================
            CREATE / EDIT JOB MODAL
        ===================================== */}

        {showForm && (
          <div className="companyJobModalOverlay">
            <div className="companyJobModal">
              <div className="companyJobModalHeader">
                <div>
                  <h2>
                    {editingJobId
                      ? "Edit Job"
                      : "Post a New Job"}
                  </h2>

                  <p>
                    {editingJobId
                      ? "Update the job details below."
                      : "Fill in the job details below."}
                  </p>
                </div>

                <button
                  type="button"
                  className="companyJobCloseButton"
                  onClick={() => {
                    setShowForm(
                      false
                    );

                    resetForm();
                  }}
                  disabled={
                    loading
                  }
                >
                  <X size={21} />
                </button>
              </div>

              <form>
                <div className="companyJobFormGrid">
                  {/* JOB TITLE */}

                  <div className="companyJobInputGroup">
                    <label>
                      Job Title *
                    </label>

                    <input
                      type="text"
                      name="jobTitle"
                      placeholder="Frontend Developer"
                      value={
                        formData.jobTitle
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      required
                    />
                  </div>

                  {/* DEPARTMENT */}

                  <div className="companyJobInputGroup">
                    <label>
                      Department *
                    </label>

                    <input
                      type="text"
                      name="department"
                      placeholder="Engineering"
                      value={
                        formData.department
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      required
                    />
                  </div>

                  {/* JOB TYPE */}

                  <div className="companyJobInputGroup">
                    <label>
                      Job Type *
                    </label>

                    <select
                      name="jobType"
                      value={
                        formData.jobType
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      required
                    >
                      <option value="">
                        Select job type
                      </option>

                      <option value="Full Time">
                        Full Time
                      </option>

                      <option value="Part Time">
                        Part Time
                      </option>

                      <option value="Internship">
                        Internship
                      </option>

                      <option value="Contract">
                        Contract
                      </option>

                      <option value="Remote">
                        Remote
                      </option>
                    </select>
                  </div>

                  {/* LOCATION */}

                  <div className="companyJobInputGroup">
                    <label>
                      Location *
                    </label>

                    <input
                      type="text"
                      name="location"
                      placeholder="Hyderabad, Telangana"
                      value={
                        formData.location
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      required
                    />
                  </div>

                  {/* EXPERIENCE */}

                  <div className="companyJobInputGroup">
                    <label>
                      Experience Required *
                    </label>

                    <input
                      type="text"
                      name="experience"
                      placeholder="0 - 2 Years"
                      value={
                        formData.experience
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      required
                    />
                  </div>

                  {/* OPENINGS */}

                  <div className="companyJobInputGroup">
                    <label>
                      Number of Openings *
                    </label>

                    <input
                      type="number"
                      name="openings"
                      min="1"
                      placeholder="1"
                      value={
                        formData.openings
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      required
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div className="companyJobInputGroup companyJobFullWidth">
                  <label>
                    Job Description *
                  </label>

                  <textarea
                    name="description"
                    placeholder="Describe the role, responsibilities and requirements..."
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    required
                  />
                </div>

                {/* SKILLS */}

                <div className="companyJobInputGroup companyJobFullWidth">
                  <label>
                    Required Skills *
                  </label>

                  <div className="companyJobSkillsInput">
                    <input
                      type="text"
                      placeholder="Enter a skill and press Add"
                      value={
                        skillInput
                      }
                      onChange={(
                        event
                      ) =>
                        setSkillInput(
                          event
                            .target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          event.preventDefault();

                          addSkill();
                        }
                      }}
                      disabled={
                        loading
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        addSkill
                      }
                      disabled={
                        loading
                      }
                    >
                      Add Skill
                    </button>
                  </div>

                  {formData.skills
                    .length >
                    0 && (
                    <div className="companyJobSkillTags">
                      {formData.skills.map(
                        (
                          skill
                        ) => (
                          <span
                            key={
                              skill
                            }
                          >
                            {
                              skill
                            }

                            <button
                              type="button"
                              onClick={() =>
                                removeSkill(
                                  skill
                                )
                              }
                              disabled={
                                loading
                              }
                            >
                              <X
                                size={
                                  13
                                }
                              />
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* DEADLINE */}

                <div className="companyJobInputGroup companyJobFullWidth">
                  <label>
                    Application Deadline *
                  </label>

                  <input
                    type="date"
                    name="applicationDeadline"
                    value={
                      formData.applicationDeadline
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    required
                  />
                </div>

                {/* ACTIONS */}

                <div className="companyJobFormActions">
                  <button
                    type="button"
                    className="companyJobDraftButton"
                    onClick={(
                      event
                    ) =>
                      handleSubmit(
                        event,
                        "draft"
                      )
                    }
                    disabled={
                      loading
                    }
                  >
                    <Save
                      size={17}
                    />

                    {loading
                      ? "Saving..."
                      : "Save Draft"}
                  </button>

                  <button
                    type="button"
                    className="companyJobPublishButton"
                    onClick={(
                      event
                    ) =>
                      handleSubmit(
                        event,
                        "published"
                      )
                    }
                    disabled={
                      loading
                    }
                  >
                    {loading
                      ? editingJobId
                        ? "Updating..."
                        : "Publishing..."
                      : editingJobId
                      ? "Update Job"
                      : "Publish Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Jobs;