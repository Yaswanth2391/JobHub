import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  X,
  BriefcaseBusiness,
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";

import { toast } from "react-toastify";

import AdminSidebar from "../AdminSidebar/AdminSidebar";
import API_BASE_URL from "../../../services/api";

import "./companyApplication.css";

function CompanyApplication() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  const ITEMS_PER_PAGE = 5;

  // ==========================================
  // GET COMPANY ADMIN TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("jobhubCompanyAdminToken");
  };

  // ==========================================
  // GET COMPANY ADMIN DATA
  // ==========================================

  const getAdminData = () => {
    try {
      const storedAdmin = localStorage.getItem("jobhubCompanyAdmin");

      if (!storedAdmin) {
        return null;
      }

      return JSON.parse(storedAdmin);
    } catch (error) {
      console.error("Company admin storage error:", error);
      return null;
    }
  };

  // ==========================================
  // FETCH COMPANY JOBS
  // ==========================================

  const fetchJobs = async () => {
    const token = getToken();

    if (!token) {
      navigate("/company-admin/login");
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
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load company jobs.");
      }

      const companyJobs = data.jobs || [];

      setJobs(companyJobs);

      const publishedJob = companyJobs.find(
        (job) => job.status === "published",
      );

      if (publishedJob) {
        setSelectedJobId(publishedJob._id);
      } else if (companyJobs.length > 0) {
        setSelectedJobId(companyJobs[0]._id);
      }
    } catch (error) {
      console.error("Fetch company jobs error:", error);
      toast.error(error.message || "Unable to load jobs.");
    } finally {
      setJobsLoading(false);
    }
  };

  // ==========================================
  // FETCH COMPANY APPLICATIONS
  // ==========================================

  const fetchApplications = async () => {
    const token = getToken();

    if (!token) {
      navigate("/company-admin/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch applications.",
        );
      }

      setApplications(data.applications || []);
    } catch (error) {
      console.error("Fetch applications error:", error);
      setError(error.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/company-admin/login");
      return;
    }

    fetchJobs();
    fetchApplications();
  }, []);

  // ==========================================
  // SELECTED JOB
  // ==========================================

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job._id === selectedJobId);
  }, [jobs, selectedJobId]);

  // ==========================================
  // GET APPLICATION JOB ID
  // ==========================================

  const getApplicationJobId = (application) => {
    if (!application?.jobId) {
      return "";
    }

    if (typeof application.jobId === "string") {
      return application.jobId;
    }

    return application.jobId._id || application.jobId.id || "";
  };

  // ==========================================
  // GET APPLICATION JOB TITLE
  // ==========================================

  const getApplicationJobTitle = (application) => {
    return application?.jobTitle || "";
  };

  // ==========================================
  // FILTER BY SELECTED JOB
  // ==========================================

  const jobApplications = useMemo(() => {
    if (!selectedJobId) {
      return applications;
    }

    return applications.filter(
      (application) => getApplicationJobId(application) === selectedJobId,
    );
  }, [applications, selectedJobId]);

  // ==========================================
  // NORMALIZE STATUS
  // ==========================================

  const normalizeStatus = (status) => {
    const validStatuses = [
      "Applied",
      "Interview Scheduled",
      "Hired",
      "Rejected",
    ];

    return validStatuses.includes(status) ? status : "Applied";
  };

  // ==========================================
  // TAB COUNTS
  // ==========================================

  const allCount = jobApplications.length;

  const appliedCount = jobApplications.filter(
    (application) => normalizeStatus(application.status) === "Applied",
  ).length;

  const interviewCount = jobApplications.filter(
    (application) =>
      normalizeStatus(application.status) === "Interview Scheduled",
  ).length;

  const hiredCount = jobApplications.filter(
    (application) => normalizeStatus(application.status) === "Hired",
  ).length;

  const rejectedCount = jobApplications.filter(
    (application) => normalizeStatus(application.status) === "Rejected",
  ).length;

  // ==========================================
  // FILTER APPLICATIONS
  // ==========================================

  const filteredApplications = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return jobApplications.filter((application) => {
      const candidateName =
        application.name ||
        application.candidateName ||
        application.fullName ||
        application.candidate?.fullName ||
        "";

      const candidateEmail =
        application.email ||
        application.candidateEmail ||
        application.candidate?.email ||
        "";

      const candidatePhone =
        application.phone ||
        application.mobile ||
        application.candidate?.phone ||
        "";

      const jobTitle = getApplicationJobTitle(application);
      const status = normalizeStatus(application.status);

      const matchesSearch =
        candidateName.toLowerCase().includes(searchText) ||
        candidateEmail.toLowerCase().includes(searchText) ||
        String(candidatePhone).includes(searchText) ||
        jobTitle.toLowerCase().includes(searchText);

      let matchesTab = true;

      if (activeTab === "Applied") {
        matchesTab = status === "Applied";
      }

      if (activeTab === "Interview") {
        matchesTab = status === "Interview Scheduled";
      }

      if (activeTab === "Hired") {
        matchesTab = status === "Hired";
      }

      if (activeTab === "Rejected") {
        matchesTab = status === "Rejected";
      }

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [
    jobApplications,
    search,
    activeTab,
    statusFilter,
  ]);

  // ==========================================
  // RESET PAGE WHEN FILTER CHANGES
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, statusFilter, selectedJobId]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / ITEMS_PER_PAGE),
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedApplications = filteredApplications.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "Interview Scheduled":
        return "applicationStatusInterview";
      case "Hired":
        return "applicationStatusHired";
      case "Rejected":
        return "applicationStatusRejected";
      default:
        return "applicationStatusApplied";
    }
  };

  // ==========================================
  // GET EXPERIENCE
  // ==========================================

  const getExperience = (application) => {
    return (
      application.experience ||
      application.candidateExperience ||
      application.yearsOfExperience ||
      "Fresher"
    );
  };

  // ==========================================
  // GET RESUME URL
  // ==========================================

  const getResumeUrl = (application) => {
    // Candidate resume is populated by the backend.
    if (application?.candidate?.resume?.url) {
      return application.candidate.resume.url;
    }

    // Keep support for an application-level resume if one exists.
    if (application?.resume) {
      if (typeof application.resume === "object") {
        return application.resume.url || application.resume.path || "";
      }

      if (String(application.resume).startsWith("http")) {
        return application.resume;
      }
    }

    return "";
  };

  // ==========================================
  // GET RESUME NAME
  // ==========================================

  const getResumeName = (application) => {
    return (
      application?.candidate?.resume?.name ||
      application?.resume?.name ||
      "Resume.pdf"
    );
  };

  // ==========================================
  // VIEW CANDIDATE
  // ==========================================

  const handleViewCandidate = (application) => {
    setSelectedApplication(application);
    setShowCandidateModal(true);
  };

  // ==========================================
  // CLOSE CANDIDATE MODAL
  // ==========================================

  const closeCandidateModal = () => {
    setSelectedApplication(null);
    setShowCandidateModal(false);
  };

  // ==========================================
  // RUN ATS FOR SELECTED JOB
  // ==========================================

  const handleRunATS = () => {
    if (!selectedJobId) {
      toast.error("Please select a job first.");
      return;
    }

    if (jobApplications.length === 0) {
      toast.info("There are no applications for this job yet.");
      return;
    }

    navigate(`/company-admin/ats-shortlisting/${selectedJobId}`);
  };

  // ==========================================
  // DOWNLOAD APPLICATIONS
  // ==========================================

  const handleDownload = () => {
    if (filteredApplications.length === 0) {
      toast.info("There are no applications to download.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Experience",
      "Status",
      "Job",
    ];

    const rows = filteredApplications.map((application) => [
      application.name ||
        application.candidateName ||
        application.fullName ||
        application.candidate?.fullName ||
        "",
      application.email ||
        application.candidateEmail ||
        application.candidate?.email ||
        "",
      getExperience(application),
      normalizeStatus(application.status),
      application.jobTitle || selectedJob?.jobTitle || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${selectedJob?.jobTitle || "applications"}-applications.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // HANDLE JOB CHANGE
  // ==========================================

  const handleJobChange = (event) => {
    setSelectedJobId(event.target.value);
    setActiveTab("All");
    setStatusFilter("All");
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "Not available";
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && jobsLoading) {
    return (
      <main className="companyApplicationsPage">
        <AdminSidebar />

        <section className="companyApplicationsMain">
          <div className="companyApplicationsLoading">
            <div className="companyApplicationsSpinner" />
            <p>Loading applications...</p>
          </div>
        </section>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="companyApplicationsPage">
      <AdminSidebar />

      <section className="companyApplicationsMain">
        {/* =====================================
            TOPBAR
        ===================================== */}

        <header className="companyApplicationsTopbar">
          <div className="companyApplicationsTopbarLeft">
            <h1 className="companyApplicationsTopbarTitle">
              Applications
            </h1>

            <div className="companyApplicationsMobileLogo">
              <span>J</span>obHub
            </div>
          </div>

          <div className="companyApplicationsTopbarRight">
            <button
              type="button"
              className="companyApplicationsNotification"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span />
            </button>

            <div className="companyApplicationsAdminProfile">
              <div className="companyApplicationsAdminAvatar">
                {(getAdminData()?.companyName || "C")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="companyApplicationsAdminInfo">
                <strong>
                  {getAdminData()?.companyName || "Company"}
                </strong>
                <span>Company Admin</span>
              </div>

              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        {/* =====================================
            CONTENT
        ===================================== */}

        <div className="companyApplicationsContent">
          {/* =====================================
              PAGE HEADER
          ===================================== */}

          <div className="companyApplicationsHeader">
            <div className="companyApplicationsHeaderLeft">
              <button
                type="button"
                className="companyApplicationsBackButton"
                onClick={() => navigate("/company-admin/jobs")}
              >
                <ArrowLeft size={16} />
                Back to Jobs
              </button>

              <h1>
                Applications
                {selectedJob && (
                  <>
                    {" - "}
                    {selectedJob.jobTitle || selectedJob.title}
                  </>
                )}
              </h1>

              <p className="companyApplicationsHeaderSubtitle">
                Review applications for the selected job and move suitable candidates to interview.
              </p>
            </div>

            <div className="companyApplicationsHeaderActions">
              <div className="companyApplicationsDesktopJobSelector">
                <label htmlFor="applicationJobDesktop">Job</label>
                <div className="companyApplicationsJobSelectWrapper">
                  <select
                    id="applicationJobDesktop"
                    value={selectedJobId}
                    onChange={handleJobChange}
                    disabled={jobsLoading || jobs.length === 0}
                  >
                    {jobs.length === 0 ? (
                      <option value="">No jobs available</option>
                    ) : (
                      jobs.map((job) => (
                        <option key={job._id} value={job._id}>
                          {job.jobTitle || job.title}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown size={15} />
                </div>
              </div>

              <button
                type="button"
                className="companyApplicationsRunATSButton"
                onClick={handleRunATS}
                disabled={jobsLoading || !selectedJobId || jobApplications.length === 0}
              >
                <BriefcaseBusiness size={16} />
                Run ATS
              </button>

              <button
                type="button"
                className="companyApplicationsDownloadButton"
                onClick={handleDownload}
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>

          {/* =====================================
              ERROR
          ===================================== */}

          {error && (
            <div className="companyApplicationsError">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* =====================================
              JOB SELECTOR
          ===================================== */}

          <div className="companyApplicationsJobSelector">
            <label htmlFor="applicationJob">Job</label>

            <div className="companyApplicationsJobSelectWrapper">
              <select
                id="applicationJob"
                value={selectedJobId}
                onChange={handleJobChange}
                disabled={jobsLoading}
              >
                {jobs.length === 0 ? (
                  <option value="">No jobs available</option>
                ) : (
                  jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.jobTitle || job.title}
                    </option>
                  ))
                )}
              </select>

              <ChevronDown size={15} />
            </div>
          </div>

          {/* =====================================
              TABS
          ===================================== */}

          <div className="companyApplicationsTabs">
            <button
              type="button"
              className={activeTab === "All" ? "active" : ""}
              onClick={() => setActiveTab("All")}
            >
              All ({allCount})
            </button>

            <button
              type="button"
              className={activeTab === "Applied" ? "active" : ""}
              onClick={() => setActiveTab("Applied")}
            >
              Applied ({appliedCount})
            </button>

            <button
              type="button"
              className={activeTab === "Interview" ? "active" : ""}
              onClick={() => setActiveTab("Interview")}
            >
              Interview ({interviewCount})
            </button>

            <button
              type="button"
              className={activeTab === "Hired" ? "active" : ""}
              onClick={() => setActiveTab("Hired")}
            >
              Hired ({hiredCount})
            </button>

            <button
              type="button"
              className={activeTab === "Rejected" ? "active" : ""}
              onClick={() => setActiveTab("Rejected")}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* =====================================
              TOOLBAR
          ===================================== */}

          <div className="companyApplicationsToolbar">
            <div className="companyApplicationsSearch">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  type="button"
                  className="companyApplicationsClearSearch"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="companyApplicationsFilterContainer">
              <button
                type="button"
                className={
                  statusFilter !== "All"
                    ? "companyApplicationsFilterButton active"
                    : "companyApplicationsFilterButton"
                }
                onClick={() => setShowFilter((previous) => !previous)}
              >
                <Filter size={16} />
                Filter
              </button>

              {showFilter && (
                <div className="companyApplicationsFilterMenu">
                  {[
                    "All",
                    "Applied",
                    "Interview Scheduled",
                    "Hired",
                    "Rejected",
                  ].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={statusFilter === status ? "selected" : ""}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilter(false);
                      }}
                    >
                      {status === "All" ? "All Status" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =====================================
              TABLE
          ===================================== */}

          <section className="companyApplicationsTableCard">
            <div className="companyApplicationsTableWrapper">
              <table className="companyApplicationsTable">
                <thead>
                  <tr>
                    <th className="applicationCheckboxColumn">
                      <input
                        type="checkbox"
                        aria-label="Select all applications"
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Experience</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th className="applicationActionsColumn">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="companyApplicationsTableLoading">
                        <div className="companyApplicationsInlineLoader" />
                        Loading applications...
                      </td>
                    </tr>
                  ) : paginatedApplications.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="companyApplicationsEmpty">
                        <div className="companyApplicationsEmptyIcon">
                          <FileText size={24} />
                        </div>
                        <strong>No applications found</strong>
                        <span>Try another search, job or status filter.</span>
                      </td>
                    </tr>
                  ) : (
                    paginatedApplications.map((application) => {
                      const candidateName =
                        application.name ||
                        application.candidateName ||
                        application.fullName ||
                        application.candidate?.fullName ||
                        "Unknown Candidate";

                      const candidateEmail =
                        application.email ||
                        application.candidateEmail ||
                        application.candidate?.email ||
                        "Email not provided";

                      const experience = getExperience(application);
                      const status = normalizeStatus(application.status);
                      const resumeUrl = getResumeUrl(application);
                      const initial = candidateName.charAt(0).toUpperCase();

                      return (
                        <tr key={application._id}>
                          <td className="applicationCheckboxColumn">
                            <input
                              type="checkbox"
                              aria-label={`Select ${candidateName}`}
                            />
                          </td>

                          <td>
                            <div className="applicationCandidateName">
                              <div className="applicationCandidateAvatar">
                                {initial}
                              </div>
                              <div className="applicationCandidateText">
                                <strong>{candidateName}</strong>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="applicationEmail">
                              {candidateEmail}
                            </span>
                          </td>

                          <td>
                            <span className="applicationRole">
                              {getApplicationJobTitle(application) || selectedJob?.jobTitle || "—"}
                            </span>
                          </td>

                          <td>
                            <span className="applicationExperience">
                              {experience}
                            </span>
                          </td>

                          <td>
                            {resumeUrl ? (
                              <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="applicationResumeButton"
                                title={`View ${getResumeName(application)}`}
                              >
                                <FileText size={19} />
                              </a>
                            ) : (
                              <span className="applicationNoResume">—</span>
                            )}
                          </td>

                          <td>
                            <span
                              className={`applicationStatus ${getStatusClass(status)}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="applicationActionsColumn">
                            <div className="applicationActions">
                              <button
                                type="button"
                                className="applicationViewButton"
                                title="View Application"
                                onClick={() => handleViewCandidate(application)}
                              >
                                <Eye size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* =====================================
                PAGINATION
            ===================================== */}

            {filteredApplications.length > 0 && (
              <div className="companyApplicationsPagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((previous) => Math.max(1, previous - 1))
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={currentPage === page ? "active" : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((previous) =>
                      Math.min(totalPages, previous + 1),
                    )
                  }
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </section>

      {/* =====================================
          CANDIDATE / ATS MODAL
      ===================================== */}

      {showCandidateModal && selectedApplication && (
        <div
          className="companyApplicationModalOverlay"
          onClick={closeCandidateModal}
        >
          <div
            className="companyApplicationModal companyApplicationAtsModal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="companyApplicationModalHeader">
              <div>
                <span className="companyApplicationModalEyebrow">
                  Candidate Application
                </span>

                <h2>
                  {selectedApplication.name ||
                    selectedApplication.candidateName ||
                    selectedApplication.fullName ||
                    selectedApplication.candidate?.fullName ||
                    "Candidate"}
                </h2>
              </div>

              <button type="button" onClick={closeCandidateModal}>
                <X size={19} />
              </button>
            </div>

            <div className="companyApplicationModalBody">
              {/* =====================================
                  CANDIDATE SUMMARY
              ===================================== */}

              <div className="companyApplicationCandidateSummary">
                <div className="companyApplicationModalAvatar">
                  {(
                    selectedApplication.name ||
                    selectedApplication.candidateName ||
                    selectedApplication.fullName ||
                    selectedApplication.candidate?.fullName ||
                    "C"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="companyApplicationCandidateSummaryInfo">
                  <strong>
                    {selectedApplication.jobTitle ||
                      selectedJob?.jobTitle ||
                      "Job Application"}
                  </strong>
                  <span>
                    Applied on {formatDate(selectedApplication.createdAt)}
                  </span>
                </div>

                <span
                  className={`applicationStatus ${getStatusClass(
                    selectedApplication.status,
                  )}`}
                >
                  {normalizeStatus(selectedApplication.status)}
                </span>
              </div>

              {/* =====================================
                  CONTACT DETAILS
              ===================================== */}

              <div className="companyApplicationModalDetails">
                <div>
                  <span>
                    <Mail size={14} />
                    Email
                  </span>
                  <strong>
                    {selectedApplication.email ||
                      selectedApplication.candidateEmail ||
                      selectedApplication.candidate?.email ||
                      "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>
                    <Phone size={14} />
                    Phone
                  </span>
                  <strong>
                    {selectedApplication.phone ||
                      selectedApplication.mobile ||
                      selectedApplication.candidate?.phone ||
                      "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>
                    <Clock3 size={14} />
                    Experience
                  </span>
                  <strong>{getExperience(selectedApplication)}</strong>
                </div>

                <div>
                  <span>
                    <MapPin size={14} />
                    Location
                  </span>
                  <strong>
                    {selectedApplication.location ||
                      selectedApplication.candidate?.location ||
                      "Not provided"}
                  </strong>
                </div>
              </div>

              {/* =====================================
                  RESUME
              ===================================== */}

              {getResumeUrl(selectedApplication) && (
                <a
                  href={getResumeUrl(selectedApplication)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="companyApplicationModalResume"
                >
                  <FileText size={17} />
                  <span>
                    <strong>{getResumeName(selectedApplication)}</strong>
                    <small>Open candidate resume</small>
                  </span>
                  <Eye size={16} />
                </a>
              )}

              {/* =====================================
                  CONTACT
              ===================================== */}

              <div className="companyApplicationModalActions">
                <a
                  href={`mailto:${
                    selectedApplication.email ||
                    selectedApplication.candidateEmail ||
                    selectedApplication.candidate?.email ||
                    ""
                  }`}
                  className="companyApplicationContactButton"
                >
                  <Mail size={16} />
                  Contact Candidate
                </a>

                <button
                  type="button"
                  className="companyApplicationCloseButton"
                  onClick={closeCandidateModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CompanyApplication;
