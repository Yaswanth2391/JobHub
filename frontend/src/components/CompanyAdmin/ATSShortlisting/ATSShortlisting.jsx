import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Bell,
  Eye,
  Search,
  CalendarDays,
  UserRoundX,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminSidebar from "../AdminSidebar/AdminSidebar";
import API_BASE_URL from "../../../services/api";

import "./ATSShortlisting.css";

function ATSShortlisting() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [selectedApplicationId, setSelectedApplicationId] =
    useState(null);

  const [atsReportApplication, setAtsReportApplication] =
    useState(null);

  // ==========================================
  // REJECT CANDIDATE POPUP
  // ==========================================

  const [showRejectForm, setShowRejectForm] =
    useState(false);

  const [rejectApplication, setRejectApplication] =
    useState(null);

  const [rejectionForm, setRejectionForm] =
    useState({
      reason: "",
      feedback: "",
      notifyCandidate: true,
    });

  const [updatingApplicationId, setUpdatingApplicationId] =
    useState(null);

  // ==========================================
  // GET TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("jobhubCompanyAdminToken");
  };

  // ==========================================
  // GET ADMIN DATA
  // ==========================================

  const getAdminData = () => {
    try {
      const storedAdmin = localStorage.getItem(
        "jobhubCompanyAdmin",
      );

      if (!storedAdmin) {
        return null;
      }

      return JSON.parse(storedAdmin);
    } catch (error) {
      console.error(
        "Company admin storage error:",
        error,
      );

      return null;
    }
  };

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

    return (
      application.jobId._id ||
      application.jobId.id ||
      ""
    );
  };

  // ==========================================
  // GET CANDIDATE NAME
  // ==========================================

  const getCandidateName = (application) => {
    return (
      application?.fullName ||
      application?.name ||
      application?.candidateName ||
      application?.candidate?.fullName ||
      "Unknown Candidate"
    );
  };

  // ==========================================
  // GET CANDIDATE EMAIL
  // ==========================================

  const getCandidateEmail = (application) => {
    return (
      application?.email ||
      application?.candidateEmail ||
      application?.candidate?.email ||
      "Not available"
    );
  };

  // ==========================================
  // GET EXPERIENCE
  // ==========================================

  const getExperience = (application) => {
    return (
      application?.experience ||
      application?.candidateExperience ||
      application?.yearsOfExperience ||
      "Fresher"
    );
  };

  // ==========================================
  // GET ATS SCORE
  // ==========================================

  const getAtsScore = (application) => {
    const score = Number(application?.atsScore);

    if (Number.isNaN(score)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, Math.round(score)),
    );
  };

  // ==========================================
  // GET MATCHED SKILLS
  // ==========================================

  const getMatchedSkills = (application) => {
    if (
      Array.isArray(
        application?.atsMatchedSkills,
      )
    ) {
      return application.atsMatchedSkills;
    }

    if (
      Array.isArray(
        application?.atsBreakdown?.skills?.matched,
      )
    ) {
      return application.atsBreakdown.skills.matched;
    }

    return [];
  };

  // ==========================================
  // GET MISSING SKILLS
  // ==========================================

  const getMissingSkills = (application) => {
    if (
      Array.isArray(
        application?.atsMissingSkills,
      )
    ) {
      return application.atsMissingSkills;
    }

    return [];
  };

  // ==========================================
  // OPEN ATS REPORT
  // ==========================================

  const handleOpenAtsReport = (application) => {
    setAtsReportApplication(application);
  };

  // ==========================================
  // CLOSE ATS REPORT
  // ==========================================

  const handleCloseAtsReport = () => {
    setAtsReportApplication(null);
  };

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

    return validStatuses.includes(status)
      ? status
      : "Applied";
  };

  // ==========================================
  // GET STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "Interview Scheduled":
        return "atsStatusInterview";

      case "Hired":
        return "atsStatusHired";

      case "Rejected":
        return "atsStatusRejected";

      default:
        return "atsStatusApplied";
    }
  };

  // ==========================================
  // GET SCORE CLASS
  // ==========================================

  const getScoreClass = (score) => {
    if (score >= 80) {
      return "atsScoreHigh";
    }

    if (score >= 60) {
      return "atsScoreMedium";
    }

    return "atsScoreLow";
  };

  // ==========================================
  // FETCH JOB
  // ==========================================

  const fetchJob = async () => {
    const token = getToken();

    if (!token) {
      navigate("/company-admin/login");
      return;
    }

    try {
      setJobLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load job details.",
        );
      }

      setJob(data.job || null);
    } catch (error) {
      console.error(
        "Fetch ATS job error:",
        error,
      );

      toast.error(
        error.message ||
          "Unable to load job details.",
      );
    } finally {
      setJobLoading(false);
    }
  };

  // ==========================================
  // FETCH APPLICATIONS
  // ==========================================

  const fetchApplications = async () => {
    const token = getToken();

    if (!token) {
      navigate("/company-admin/login");
      return;
    }

    try {
      setLoading(true);

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
          data.message ||
            "Unable to load applications.",
        );
      }

      const companyApplications =
        data.applications || [];

      const selectedJobApplications =
        companyApplications.filter(
          (application) =>
            getApplicationJobId(application) ===
            jobId,
        );

      setApplications(
        selectedJobApplications,
      );
    } catch (error) {
      console.error(
        "Fetch ATS applications error:",
        error,
      );

      toast.error(
        error.message ||
          "Unable to load applications.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!jobId) {
      toast.error("Invalid job selected.");

      navigate("/company-admin/applications");

      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/company-admin/login");

      return;
    }

    fetchJob();
    fetchApplications();
  }, [jobId]);

  // ==========================================
  // SORT APPLICATIONS BY ATS SCORE
  // HIGHEST → LOWEST
  // ==========================================

  const sortedApplications = useMemo(() => {
    return [...applications].sort(
      (first, second) =>
        getAtsScore(second) -
        getAtsScore(first),
    );
  }, [applications]);

  // ==========================================
  // FILTER APPLICATIONS
  // ==========================================

  const filteredApplications = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return sortedApplications.filter(
      (application) => {
        const candidateName =
          getCandidateName(
            application,
          ).toLowerCase();

        const candidateEmail =
          getCandidateEmail(
            application,
          ).toLowerCase();

        const status = normalizeStatus(
          application.status,
        );

        const matchesSearch =
          candidateName.includes(searchText) ||
          candidateEmail.includes(searchText);

        let matchesTab = true;

        if (activeTab === "Shortlisted") {
          matchesTab =
            status === "Interview Scheduled";
        }

        if (activeTab === "Not Matched") {
          matchesTab =
            getAtsScore(application) < 60;
        }

        return (
          matchesSearch &&
          matchesTab
        );
      },
    );
  }, [
    sortedApplications,
    search,
    activeTab,
  ]);

  // ==========================================
  // COUNTS
  // ==========================================

  const allCount =
    applications.length;

  const shortlistedCount =
    applications.filter(
      (application) =>
        normalizeStatus(
          application.status,
        ) === "Interview Scheduled",
    ).length;

  const notMatchedCount =
    applications.filter(
      (application) =>
        getAtsScore(application) < 60,
    ).length;

  // ==========================================
  // SELECT CANDIDATE
  // ==========================================

  const handleSelectCandidate = (
    applicationId,
  ) => {
    setSelectedApplicationId(
      (currentId) =>
        currentId === applicationId
          ? null
          : applicationId,
    );
  };

  // ==========================================
  // SCHEDULE INTERVIEW
  // ==========================================

  const handleScheduleInterview = (
    application,
  ) => {
    navigate(
      `/company-admin/schedule-interview/${application._id}`,
    );
  };

  // ==========================================
  // REJECT APPLICATION
  // ==========================================

  const handleOpenRejectForm = (application) => {
    setRejectApplication(application);
    setRejectionForm({
      reason: "",
      feedback: "",
      notifyCandidate: true,
    });
    setShowRejectForm(true);
  };

  const handleCloseRejectForm = () => {
    if (updatingApplicationId) {
      return;
    }

    setShowRejectForm(false);
    setRejectApplication(null);
    setRejectionForm({
      reason: "",
      feedback: "",
      notifyCandidate: true,
    });
  };

  const handleRejectionFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setRejectionForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReject = (application) => {
    handleOpenRejectForm(application);
  };

  const handleConfirmReject = async () => {
    if (!rejectApplication) {
      return;
    }

    const rejectionReason = rejectionForm.reason.trim();

    if (!rejectionReason) {
      toast.error("Please select a rejection reason.");
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/company-admin/login");
      return;
    }

    setUpdatingApplicationId(rejectApplication._id);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/applications/${rejectApplication._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Rejected",
            rejectionReason,
            rejectionFeedback: rejectionForm.feedback.trim(),
            notifyCandidate: rejectionForm.notifyCandidate,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reject application.",
        );
      }

      setApplications((currentApplications) =>
        currentApplications.map((item) =>
          item._id === rejectApplication._id
            ? {
                ...item,
                status: "Rejected",
                rejectionDetails: {
                  reason: rejectionReason,
                  feedback: rejectionForm.feedback.trim(),
                  notifyCandidate: rejectionForm.notifyCandidate,
                  rejectedAt: new Date().toISOString(),
                },
              }
            : item,
        ),
      );

      setSelectedApplicationId(null);
      setShowRejectForm(false);
      setRejectApplication(null);
      setRejectionForm({
        reason: "",
        feedback: "",
        notifyCandidate: true,
      });

      toast.success("Application rejected successfully.");
    } catch (error) {
      console.error("Reject application error:", error);
      toast.error(
        error.message || "Unable to reject application.",
      );
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  // ==========================================
  // REFRESH ATS
  // ==========================================

  const handleRefresh = () => {
    fetchApplications();
  };

  // ==========================================
  // VIEW APPLICATION
  // ==========================================

  const handleViewApplication = (
    application,
  ) => {
    navigate(
      "/company-admin/applications",
      {
        state: {
          applicationId:
            application._id,
        },
      },
    );
  };

  // ==========================================
  // SELECTED APPLICATION
  // ==========================================

  const selectedApplication =
    applications.find(
      (application) =>
        application._id ===
        selectedApplicationId,
    );

  // ==========================================
  // ADMIN DATA
  // ==========================================

  const adminData =
    getAdminData();

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || jobLoading) {
    return (
      <main className="atsShortlistingPage">
        <AdminSidebar />

        <section className="atsShortlistingMain">
          <div className="atsShortlistingLoading">
            <div className="atsShortlistingSpinner" />

            <p>
              Loading ATS shortlisting...
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="atsShortlistingPage">
      <AdminSidebar />

      <section className="atsShortlistingMain">
        {/* =====================================
            TOPBAR
        ===================================== */}

        <header className="atsShortlistingTopbar">
          <div className="atsShortlistingTopbarLeft">
            <button
              type="button"
              className="atsBackButton"
              onClick={() =>
                navigate(
                  "/company-admin/applications",
                )
              }
            >
              <ArrowLeft size={17} />

              <span>
                Applications
              </span>
            </button>
          </div>

          <div className="atsShortlistingTopbarRight">
            <button
              type="button"
              className="atsNotificationButton"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="atsAdminProfile">
              <div className="atsAdminAvatar">
                {(
                  adminData?.companyName ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="atsAdminInfo">
                <strong>
                  {adminData?.companyName || "Company"}
                </strong>
                <span>Company Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="atsShortlistingHeader">
          <div>
            <h1>
              ATS Shortlisting
              {job?.jobTitle
                ? ` - ${job.jobTitle}`
                : ""}
            </h1>

            <p>
              Review candidates based on
              their resume ATS score,
              matched skills, and
              application status.
            </p>
          </div>

          <button
            type="button"
            className="atsRefreshButton"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} />

            <span>
              Refresh ATS
            </span>
          </button>
        </div>

        {/* =====================================
            ATS INFO
        ===================================== */}

        <div className="atsInfoBanner">
          <div className="atsInfoIcon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <strong>
              Resume-based ATS shortlisting
            </strong>

            <span>
              Candidates are ranked using
              the ATS score calculated from
              their submitted resume.
            </span>
          </div>
        </div>

        {/* =====================================
            TABS
        ===================================== */}

        <div className="atsTabs">
          <button
            type="button"
            className={
              activeTab === "All"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("All")
            }
          >
            All

            <span>
              {allCount}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "Shortlisted"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "Shortlisted",
              )
            }
          >
            Shortlisted

            <span>
              {shortlistedCount}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "Not Matched"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "Not Matched",
              )
            }
          >
            Not Matched

            <span>
              {notMatchedCount}
            </span>
          </button>
        </div>

        {/* =====================================
            TOOLBAR
        ===================================== */}

        <div className="atsToolbar">
          <div className="atsSearchBox">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="atsToolbarInfo">
            <span>
              {filteredApplications.length}{" "}
              candidate
              {filteredApplications.length !==
              1
                ? "s"
                : ""}
            </span>
          </div>
        </div>

        {/* =====================================
            CANDIDATE TABLE
        ===================================== */}

        <div className="atsTableCard">
          <div className="atsTableWrapper">
            <table className="atsTable">
              <thead>
                <tr>
                  <th className="atsSelectColumn">
                    Select
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Match Score
                  </th>

                  <th>
                    Key Skills Matched
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
                {filteredApplications.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="atsEmptyCell"
                    >
                      <div className="atsEmptyState">
                        <Search
                          size={30}
                        />

                        <h3>
                          No candidates found
                        </h3>

                        <p>
                          There are no
                          applications matching
                          this ATS view.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map(
                    (application) => {
                      const score =
                        getAtsScore(
                          application,
                        );

                      const matchedSkills =
                        getMatchedSkills(
                          application,
                        );

                      const isSelected =
                        selectedApplicationId ===
                        application._id;

                      return (
                        <tr
                          key={
                            application._id
                          }
                          className={
                            isSelected
                              ? "selectedRow"
                              : ""
                          }
                        >
                          <td className="atsSelectColumn">
                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={() =>
                                handleSelectCandidate(
                                  application._id,
                                )
                              }
                              aria-label={`Select ${getCandidateName(
                                application,
                              )}`}
                            />
                          </td>

                          <td>
                            <div className="atsCandidateCell">
                              <div className="atsCandidateAvatar">
                                {getCandidateName(
                                  application,
                                )
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {getCandidateName(
                                    application,
                                  )}
                                </strong>

                                <span>
                                  {getCandidateEmail(
                                    application,
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`atsScore atsScoreButton ${getScoreClass(
                                score,
                              )}`}
                              onClick={() =>
                                handleOpenAtsReport(
                                  application,
                                )
                              }
                              title="View full ATS report"
                            >
                              {score}%
                            </button>
                          </td>

                          <td>
                            <div className="atsSkillsCell">
                              {matchedSkills.length >
                              0 ? (
                                matchedSkills
                                  .slice(
                                    0,
                                    5,
                                  )
                                  .map(
                                    (
                                      skill,
                                      index,
                                    ) => (
                                      <span
                                        key={`${skill}-${index}`}
                                      >
                                        {skill}
                                      </span>
                                    ),
                                  )
                              ) : (
                                <span className="atsNoSkills">
                                  No matched
                                  skills
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`atsStatusBadge ${getStatusClass(
                                application.status,
                              )}`}
                            >
                              {normalizeStatus(
                                application.status,
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="atsActions">
                              <button
                                type="button"
                                className="atsIconButton"
                                title="View Application"
                                onClick={() =>
                                  handleViewApplication(
                                    application,
                                  )
                                }
                              >
                                <Eye
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                className="atsReportButton"
                                title="View ATS Report"
                                onClick={() =>
                                  handleOpenAtsReport(
                                    application,
                                  )
                                }
                              >
                                ATS Report
                              </button>

                              <button


                                type="button"


                                className="atsScheduleButton"


                                disabled={


                                  normalizeStatus(


                                    application.status,


                                  ) !== "Applied"


                                }


                                onClick={() =>


                                  handleScheduleInterview(


                                    application,


                                  )


                                }


                                title="Shortlist and schedule interview"


                                aria-label={`Shortlist ${getCandidateName(


                                  application,


                                )} and schedule interview`}


                              >


                                <CheckCircle2 size={16} />


                                <span>


                                  Shortlist


                                </span>


                              </button>


                              


                              <button


                                type="button"


                                className="atsRejectButton"


                                disabled={


                                  normalizeStatus(


                                    application.status,


                                  ) !== "Applied"


                                }


                                onClick={() =>


                                  handleReject(


                                    application,


                                  )


                                }


                                title="Reject candidate"


                                aria-label={`Reject ${getCandidateName(


                                  application,


                                )}`}


                              >


                                <X size={16} />


                                <span>


                                  Reject


                                </span>


                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================================
            SELECTED CANDIDATE ACTION BAR
        ===================================== */}

        {selectedApplication && (
          <div className="atsSelectedBar">
            <div>
              <strong>
                {getCandidateName(
                  selectedApplication,
                )}
              </strong>

              <span>
                {getAtsScore(
                  selectedApplication,
                )}
                % ATS Score
              </span>
            </div>

            <div className="atsSelectedActions">
              <button
                type="button"
                className="atsSelectedScheduleButton"
                disabled={
                  normalizeStatus(
                    selectedApplication.status,
                  ) !== "Applied"
                }
                onClick={() =>
                  handleScheduleInterview(
                    selectedApplication,
                  )
                }
              >
                <CalendarDays
                  size={16}
                />

                Schedule Interview
              </button>

              <button
                type="button"
                className="atsSelectedRejectButton"
                disabled={
                  normalizeStatus(
                    selectedApplication.status,
                  ) !== "Applied"
                }
                onClick={() =>
                  handleReject(
                    selectedApplication,
                  )
                }
              >
                <UserRoundX size={16} />

                Reject
              </button>
            </div>
          </div>
        )}

        {/* =====================================
            REJECT CANDIDATE MODAL
        ===================================== */}

        {showRejectForm && rejectApplication && (
          <div
            className="atsRejectOverlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseRejectForm();
              }
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              background: "rgba(15, 23, 42, 0.62)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <div
              className="atsRejectModal"
              onMouseDown={(event) => event.stopPropagation()}
              style={{
                width: "min(860px, 100%)",
                maxHeight: "calc(100vh - 48px)",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: "20px",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.30)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "22px 24px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "14px", display: "grid", placeItems: "center", background: "#fef2f2", color: "#dc2626", flexShrink: 0 }}>
                    <X size={21} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#dc2626", marginBottom: "4px" }}>Candidate decision</span>
                    <h2 style={{ margin: 0, fontSize: "22px", lineHeight: 1.25, color: "#111827" }}>Reject Candidate</h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseRejectForm}
                  disabled={Boolean(updatingApplicationId)}
                  aria-label="Close rejection form"
                  style={{ width: "38px", height: "38px", border: "1px solid #e5e7eb", borderRadius: "10px", background: "#ffffff", color: "#6b7280", display: "grid", placeItems: "center", cursor: updatingApplicationId ? "not-allowed" : "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)" }}>
                <div style={{ padding: "24px", background: "#f8fafc", borderRight: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
                    <div style={{ width: "54px", height: "54px", borderRadius: "16px", display: "grid", placeItems: "center", background: "#e2e8f0", color: "#334155", fontSize: "20px", fontWeight: 800, flexShrink: 0 }}>
                      {getCandidateName(rejectApplication).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: "18px", color: "#111827", overflowWrap: "anywhere" }}>{getCandidateName(rejectApplication)}</h3>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>{job?.jobTitle || rejectApplication?.jobTitle || "Position not available"}</p>
                    </div>
                  </div>

                  {[
                    ["Email", getCandidateEmail(rejectApplication)],
                    ["Phone", rejectApplication?.phone || rejectApplication?.mobile || rejectApplication?.phoneNumber || rejectApplication?.candidate?.phone || "Not available"],
                    ["Company", job?.companyName || rejectApplication?.companyName || getAdminData()?.companyName || "Company"],
                    ["Experience", getExperience(rejectApplication)],
                    ["ATS Score", `${getAtsScore(rejectApplication)}%`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", marginBottom: "5px" }}>{label}</span>
                      <strong style={{ display: "block", fontSize: "14px", lineHeight: 1.45, color: "#334155", overflowWrap: "anywhere" }}>{value}</strong>
                    </div>
                  ))}

                  <div style={{ marginTop: "18px" }}>
                    <span style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", marginBottom: "7px" }}>Current Status</span>
                    <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: "999px", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: 700 }}>{normalizeStatus(rejectApplication.status)}</span>
                  </div>
                </div>

                <div style={{ padding: "24px" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#111827" }}>Rejection Details</h3>
                    <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#64748b" }}>Record why the candidate is not moving forward.</p>
                  </div>

                  <label htmlFor="ats-rejection-reason" style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                    Rejection Reason <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select id="ats-rejection-reason" name="reason" value={rejectionForm.reason} onChange={handleRejectionFormChange} disabled={Boolean(updatingApplicationId)} style={{ width: "100%", minHeight: "46px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#ffffff", color: "#0f172a", outline: "none", fontSize: "14px", boxSizing: "border-box" }}>
                    <option value="">Select a reason</option>
                    <option value="Skills mismatch">Skills mismatch</option>
                    <option value="Insufficient experience">Insufficient experience</option>
                    <option value="ATS score below requirement">ATS score below requirement</option>
                    <option value="Role mismatch">Role mismatch</option>
                    <option value="Qualification mismatch">Qualification mismatch</option>
                    <option value="Resume quality concerns">Resume quality concerns</option>
                    <option value="Position filled">Position filled</option>
                    <option value="Other">Other</option>
                  </select>

                  <label htmlFor="ats-rejection-feedback" style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", margin: "18px 0 8px" }}>Additional Feedback</label>
                  <textarea id="ats-rejection-feedback" name="feedback" value={rejectionForm.feedback} onChange={handleRejectionFormChange} disabled={Boolean(updatingApplicationId)} placeholder="Add notes or feedback for the candidate..." rows={6} style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#ffffff", color: "#0f172a", resize: "vertical", fontSize: "14px", lineHeight: 1.5, boxSizing: "border-box", fontFamily: "inherit" }} />

                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "16px", fontSize: "13px", color: "#475569", cursor: updatingApplicationId ? "not-allowed" : "pointer" }}>
                    <input type="checkbox" name="notifyCandidate" checked={rejectionForm.notifyCandidate} onChange={handleRejectionFormChange} disabled={Boolean(updatingApplicationId)} style={{ marginTop: "2px" }} />
                    <span>Send notification to candidate</span>
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "18px 24px", borderTop: "1px solid #e5e7eb" }}>
                <button type="button" onClick={handleCloseRejectForm} disabled={Boolean(updatingApplicationId)} style={{ minHeight: "42px", padding: "0 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#ffffff", color: "#334155", fontSize: "13px", fontWeight: 700, cursor: updatingApplicationId ? "not-allowed" : "pointer" }}>Cancel</button>
                <button type="button" onClick={handleConfirmReject} disabled={Boolean(updatingApplicationId)} style={{ minHeight: "42px", padding: "0 18px", border: "none", borderRadius: "10px", background: "#dc2626", color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: updatingApplicationId ? "not-allowed" : "pointer", opacity: updatingApplicationId ? 0.7 : 1 }}>
                  {updatingApplicationId ? "Rejecting..." : "Reject Candidate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================
            FULL ATS REPORT MODAL
        ===================================== */}

        {atsReportApplication && (
          <div
            className="atsReportOverlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseAtsReport();
              }
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              background: "rgba(15, 23, 42, 0.62)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <div
              className="atsReportModal"
              onMouseDown={(event) => event.stopPropagation()}
              style={{
                position: "relative",
                width: "min(1040px, 100%)",
                maxHeight: "calc(100vh - 48px)",
                margin: "auto",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                borderRadius: "18px",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.28)",
              }}
            >
              <div className="atsReportHeader">
                <div className="atsReportHeaderInfo">
                  <div className="atsReportCandidateAvatar">
                    {getCandidateName(atsReportApplication)
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2>ATS Evaluation Report</h2>
                    <p>{getCandidateName(atsReportApplication)}</p>
                    <span>{getCandidateEmail(atsReportApplication)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="atsReportCloseButton"
                  onClick={handleCloseAtsReport}
                  aria-label="Close ATS report"
                >
                  <X size={20} />
                </button>
              </div>

              <div
                className="atsReportBody"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                }}
              >
                <div className="atsReportOverview">
                  <div className={`atsReportScoreCircle ${getScoreClass(
                    getAtsScore(atsReportApplication),
                  )}`}>
                    <strong>{getAtsScore(atsReportApplication)}</strong>
                    <span>/ 100</span>
                  </div>

                  <div className="atsReportOverviewText">
                    <span>Overall ATS Score</span>
                    <strong>
                      {getAtsScore(atsReportApplication) >= 80
                        ? "Strong Match"
                        : getAtsScore(atsReportApplication) >= 60
                          ? "Moderate Match"
                          : "Low Match"}
                    </strong>
                    <p>
                      Score calculated from the candidate's submitted resume
                      against the selected job requirements.
                    </p>
                  </div>
                </div>

                <section className="atsReportSection">
                  <div className="atsReportSectionHeader">
                    <div>
                      <h3>Score Breakdown</h3>
                      <p>Detailed evaluation across all ATS categories.</p>
                    </div>
                  </div>

                  <div className="atsReportBreakdown">
                    {[
                      {
                        label: "Skills Match",
                        data: atsReportApplication?.atsBreakdown?.skills,
                        max: 40,
                        description:
                          `${atsReportApplication?.atsBreakdown?.skills?.matched ?? 0} of ` +
                          `${atsReportApplication?.atsBreakdown?.skills?.required ?? 0} required skills matched`,
                      },
                      {
                        label: "Experience Match",
                        data: atsReportApplication?.atsBreakdown?.experience,
                        max: 25,
                        description:
                          `Professional work experience: ${atsReportApplication?.atsBreakdown?.experience?.candidateYears ?? 0} years`,
                      },
                      {
                        label: "Resume Quality",
                        data: atsReportApplication?.atsBreakdown?.resumeQuality,
                        max: 15,
                        description: "Resume structure and completeness evaluation",
                      },
                      {
                        label: "Role Match",
                        data: atsReportApplication?.atsBreakdown?.roleMatch,
                        max: 10,
                        description: "Job role keywords detected in resume",
                      },
                      {
                        label: "Education Match",
                        data: atsReportApplication?.atsBreakdown?.education,
                        max: 10,
                        description: "Education requirements matched from resume",
                      },
                    ].map((metric) => {
                      const score = Number(metric.data?.score || 0);
                      const maxScore = Number(metric.data?.maxScore || metric.max);

                      return (
                        <div className="atsReportMetric" key={metric.label}>
                          <div className="atsReportMetricTop">
                            <span>{metric.label}</span>
                            <strong>
                              {score}/{maxScore}
                            </strong>
                          </div>

                          <div className="atsReportProgress">
                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, (score / maxScore) * 100),
                                )}%`,
                              }}
                            />
                          </div>

                          <small>{metric.description}</small>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="atsReportSection">
                  <div className="atsReportSectionHeader">
                    <div>
                      <h3>Skills Analysis</h3>
                      <p>
                        Skills detected and compared with the job requirements.
                      </p>
                    </div>
                  </div>

                  <div className="atsReportSkillsGrid">
                    <div className="atsReportSkillsBlock matched">
                      <h4>
                        <CheckCircle2 size={16} />
                        Matched Skills
                      </h4>

                      <div className="atsReportSkillTags">
                        {getMatchedSkills(atsReportApplication).length > 0 ? (
                          getMatchedSkills(atsReportApplication).map(
                            (skill, index) => (
                              <span key={`${skill}-${index}`}>{skill}</span>
                            ),
                          )
                        ) : (
                          <em>No matched skills</em>
                        )}
                      </div>
                    </div>

                    <div className="atsReportSkillsBlock missing">
                      <h4>Missing Skills</h4>

                      <div className="atsReportSkillTags">
                        {getMissingSkills(atsReportApplication).length > 0 ? (
                          getMissingSkills(atsReportApplication).map(
                            (skill, index) => (
                              <span key={`${skill}-${index}`}>{skill}</span>
                            ),
                          )
                        ) : (
                          <em>No missing required skills</em>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="atsReportSection">
                  <div className="atsReportSectionHeader">
                    <div>
                      <h3>Work Experience Analysis</h3>
                      <p>Only professional work experience from the submitted resume is used for this ATS category.</p>
                    </div>
                  </div>

                  <div className="atsReportDetailsGrid">
                    <div>
                      <span>Professional Work Experience</span>
                      <strong>
                        {atsReportApplication?.atsBreakdown?.experience
                          ?.candidateYears ?? 0}{" "}
                        years
                      </strong>
                    </div>

                    <div>
                      <span>Required Minimum</span>
                      <strong>
                        {atsReportApplication?.atsBreakdown?.experience
                          ?.requiredMin ?? 0}{" "}
                        years
                      </strong>
                    </div>

                    <div>
                      <span>Required Maximum</span>
                      <strong>
                        {atsReportApplication?.atsBreakdown?.experience
                          ?.requiredMax ?? 0}{" "}
                        years
                      </strong>
                    </div>

                    <div>
                      <span>Experience Match</span>
                      <strong>
                        {atsReportApplication?.atsBreakdown?.experience
                          ?.matched
                          ? "Matched"
                          : "Not Matched"}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="atsReportSection">
                  <div className="atsReportSectionHeader">
                    <div>
                      <h3>Resume Quality</h3>
                      <p>
                        Completeness checks performed on the submitted resume.
                      </p>
                    </div>
                  </div>

                  <div className="atsResumeChecks">
                    {Object.entries(
                      atsReportApplication?.atsBreakdown?.resumeQuality?.checks ||
                        {},
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className={
                          value
                            ? "atsResumeCheck passed"
                            : "atsResumeCheck failed"
                        }
                      >
                        {value ? <CheckCircle2 size={15} /> : <X size={15} />}

                        <span>
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (character) =>
                              character.toUpperCase(),
                            )}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="atsReportSection">
                  <div className="atsReportSectionHeader">
                    <div>
                      <h3>Role Match</h3>
                      <p>
                        Job-related keywords detected in the submitted resume.
                      </p>
                    </div>
                  </div>

                  <div className="atsReportKeywordList">
                    {(
                      atsReportApplication?.atsBreakdown?.roleMatch
                        ?.matchedKeywords || []
                    ).length > 0 ? (
                      atsReportApplication.atsBreakdown.roleMatch.matchedKeywords.map(
                        (keyword, index) => (
                          <span key={`${keyword}-${index}`}>{keyword}</span>
                        ),
                      )
                    ) : (
                      <p>No specific role keywords were matched.</p>
                    )}
                  </div>
                </section>

                <section className="atsReportSection">
                  <div className="atsReportSectionHeader">
                    <div>
                      <h3>Education Match</h3>
                      <p>
                        Education requirement matching from the resume.
                      </p>
                    </div>
                  </div>

                  <div className="atsEducationResult">
                    <div>
                      <span>Match Result</span>
                      <strong>
                        {atsReportApplication?.atsBreakdown?.education?.matched
                          ? "Education Matched"
                          : "Education Not Matched"}
                      </strong>
                    </div>

                    <div>
                      <span>Score</span>
                      <strong>
                        {atsReportApplication?.atsBreakdown?.education?.score ??
                          0}
                        /
                        {atsReportApplication?.atsBreakdown?.education
                          ?.maxScore ?? 10}
                      </strong>
                    </div>
                  </div>
                </section>
              </div>

              <div className="atsReportFooter">
                <button
                  type="button"
                  className="atsReportCloseFooterButton"
                  onClick={handleCloseAtsReport}
                >
                  Close Report
                </button>

                <button
                  type="button"
                  className="atsReportViewApplicationButton"
                  onClick={() => {
                    const application = atsReportApplication;
                    handleCloseAtsReport();
                    handleViewApplication(application);
                  }}
                >
                  View Application
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default ATSShortlisting;