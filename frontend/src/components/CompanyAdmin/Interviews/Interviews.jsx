import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  RefreshCw,
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  Users,
  Mail,
  Phone,
  BriefcaseBusiness,
  ExternalLink,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCheck,
  Building2,
  Laptop,
  FileText,
  CircleDollarSign,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminSidebar from "../AdminSidebar/AdminSidebar";
import API_BASE_URL from "../../../services/api";

import "./Interviews.css";

const ITEMS_PER_PAGE = 7;

function Interviews() {
  const navigate = useNavigate();

  // ======================================
  // STATE
  // ======================================

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] =
    useState("Upcoming");

  const [selectedInterview, setSelectedInterview] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [updatingApplicationId, setUpdatingApplicationId] =
    useState(null);

  const [showHiringForm, setShowHiringForm] =
    useState(false);

  const [hiringApplication, setHiringApplication] =
    useState(null);

  const [hiringForm, setHiringForm] = useState({
    ctc: "",
    joiningDate: "",
    employmentType: "Full Time",
    workMode: "On-site",
    location: "",
    notes: "",
  });

  const [submittingHire, setSubmittingHire] =
    useState(false);

  const [showRejectForm, setShowRejectForm] =
    useState(false);

  const [rejectApplication, setRejectApplication] =
    useState(null);

  const [rejectionForm, setRejectionForm] = useState({
    reason: "",
    feedback: "",
    notifyCandidate: true,
  });

  // ======================================
  // TOKEN
  // ======================================

  const getToken = () => {
    return (
      localStorage.getItem(
        "jobhubCompanyAdminToken"
      ) ||
      localStorage.getItem(
        "companyAdminToken"
      ) ||
      localStorage.getItem(
        "adminToken"
      ) ||
      localStorage.getItem("token") ||
      ""
    );
  };

  // ======================================
  // ADMIN DATA
  // ======================================

  const getAdminData = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            "jobhubCompanyAdmin"
          )
        ) ||
        JSON.parse(
          localStorage.getItem(
            "companyAdmin"
          )
        ) ||
        JSON.parse(
          localStorage.getItem("admin")
        ) ||
        null
      );
    } catch {
      return null;
    }
  };

  const adminData = useMemo(
    () => getAdminData(),
    []
  );

  // ======================================
  // FETCH APPLICATIONS
  // ======================================

  const fetchInterviews = async (
    showRefreshLoader = false
  ) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getToken();

      if (!token) {
        toast.error(
          "Company admin session not found."
        );

        navigate("/company-admin/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/applications`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to fetch interviews."
        );
      }

      const scheduledApplications =
        (data.applications || []).filter(
          (application) =>
            application.status ===
            "Interview Scheduled"
        );

      setApplications(
        scheduledApplications
      );
    } catch (error) {
      console.error(
        "Fetch interviews error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to load interviews."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    fetchInterviews();
  }, []);

  // ======================================
  // HELPERS
  // ======================================

  const getCandidateName = (
    application
  ) => {
    return (
      application?.candidate?.fullName ||
      application?.fullName ||
      "Candidate"
    );
  };

  const getCandidateEmail = (
    application
  ) => {
    return (
      application?.candidate?.email ||
      application?.email ||
      ""
    );
  };

  const getCandidatePhone = (
    application
  ) => {
    return (
      application?.candidate?.phone ||
      application?.phone ||
      ""
    );
  };

  const getInterview = (
    application
  ) => {
    return (
      application?.interview || {}
    );
  };

  const getInterviewers = (
    application
  ) => {
    const interview =
      getInterview(application);

    return Array.isArray(
      interview.interviewers
    )
      ? interview.interviewers
      : [];
  };

  const getInterviewDate = (
    application
  ) => {
    const interview =
      getInterview(application);

    if (!interview.date) {
      return null;
    }

    const date = new Date(
      interview.date
    );

    if (
      Number.isNaN(date.getTime())
    ) {
      return null;
    }

    return date;
  };

  const formatDate = (
    application
  ) => {
    const date =
      getInterviewDate(application);

    if (!date) {
      return "Date not set";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (
    application
  ) => {
    const time =
      getInterview(application)
        .time;

    return time || "Time not set";
  };

  const getMode = (
    application
  ) => {
    return (
      getInterview(application)
        .mode || ""
    );
  };

  const getInterviewType = (
    application
  ) => {
    return (
      getInterview(application)
        .interviewType ||
      "Interview"
    );
  };

  const getInitials = (
    name
  ) => {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "C";
    }

    if (words.length === 1) {
      return words[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  // ======================================
  // INTERVIEW DATE STATUS
  // ======================================

  const getInterviewDateStatus = (
    application
  ) => {
    const date =
      getInterviewDate(application);

    if (!date) {
      return "upcoming";
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const interviewDate =
      new Date(date);

    interviewDate.setHours(
      0,
      0,
      0,
      0
    );

    if (
      interviewDate.getTime() <
      today.getTime()
    ) {
      return "completed";
    }

    return "upcoming";
  };

  // ======================================
  // FILTER APPLICATIONS
  // ======================================

  const filteredApplications =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      let filtered =
        [...applications];

      // ======================================
      // TAB
      // ======================================

      if (
        activeTab === "Upcoming"
      ) {
        filtered =
          filtered.filter(
            (application) =>
              getInterviewDateStatus(
                application
              ) === "upcoming"
          );
      }

      if (
        activeTab === "Completed"
      ) {
        filtered =
          filtered.filter(
            (application) =>
              getInterviewDateStatus(
                application
              ) === "completed"
          );
      }

      // ======================================
      // SEARCH
      // ======================================

      if (searchValue) {
        filtered =
          filtered.filter(
            (application) => {
              const candidateName =
                getCandidateName(
                  application
                ).toLowerCase();

              const jobTitle =
                (
                  application.jobTitle ||
                  ""
                ).toLowerCase();

              const email =
                getCandidateEmail(
                  application
                ).toLowerCase();

              const interviewType =
                getInterviewType(
                  application
                ).toLowerCase();

              return (
                candidateName.includes(
                  searchValue
                ) ||
                jobTitle.includes(
                  searchValue
                ) ||
                email.includes(
                  searchValue
                ) ||
                interviewType.includes(
                  searchValue
                )
              );
            }
          );
      }

      // ======================================
      // SORT BY DATE
      // ======================================

      filtered.sort(
        (first, second) => {
          const firstDate =
            getInterviewDate(
              first
            )?.getTime() || 0;

          const secondDate =
            getInterviewDate(
              second
            )?.getTime() || 0;

          return (
            firstDate - secondDate
          );
        }
      );

      return filtered;
    }, [
      applications,
      activeTab,
      search,
    ]);

  // ======================================
  // COUNTS
  // ======================================

  const upcomingCount =
    applications.filter(
      (application) =>
        getInterviewDateStatus(
          application
        ) === "upcoming"
    ).length;

  const completedCount =
    applications.filter(
      (application) =>
        getInterviewDateStatus(
          application
        ) === "completed"
    ).length;

  // ======================================
  // PAGINATION
  // ======================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredApplications.length /
        ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedApplications =
    filteredApplications.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );

  // ======================================
  // RESET PAGE ON SEARCH / TAB
  // ======================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    activeTab,
  ]);

  // ======================================
  // OPEN DETAILS
  // ======================================

  const handleOpenDetails = (
    application
  ) => {
    setSelectedInterview(
      application
    );
  };

  // ======================================
  // CLOSE DETAILS
  // ======================================

  const handleCloseDetails = () => {
    setSelectedInterview(null);
  };

  // ======================================
  // OPEN REJECT CONFIRMATION
  // ======================================

  const handleOpenRejectForm = (application) => {
    setRejectApplication(application);
    setRejectionForm({
      reason: "",
      feedback: "",
      notifyCandidate: true,
    });
    setShowRejectForm(true);
  };

  // ======================================
  // CLOSE REJECT CONFIRMATION
  // ======================================

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

  // ======================================
  // CONFIRM REJECTION
  // ======================================

  const handleRejectionFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setRejectionForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleConfirmReject = async () => {
    if (!rejectApplication?._id) {
      return;
    }

    if (!rejectionForm.reason.trim()) {
      toast.error("Please select a rejection reason.");
      return;
    }

    const applicationId = rejectApplication._id;

    try {
      setUpdatingApplicationId(applicationId);

      const token = getToken();

      if (!token) {
        toast.error(
          "Company admin session not found."
        );

        navigate("/company-admin/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Rejected",
            rejectionReason: rejectionForm.reason.trim(),
            rejectionFeedback: rejectionForm.feedback.trim(),
            notifyCandidate: rejectionForm.notifyCandidate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to reject candidate."
        );
      }

      toast.success(
        "Candidate rejected successfully."
      );

      setApplications((current) =>
        current.filter(
          (application) =>
            application._id !== applicationId
        )
      );

      setShowRejectForm(false);
      setRejectApplication(null);
      setSelectedInterview(null);
      setRejectionForm({
        reason: "",
        feedback: "",
        notifyCandidate: true,
      });
    } catch (error) {
      console.error(
        "Reject candidate error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to reject candidate."
      );
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  // ======================================
  // OPEN HIRING FORM
  // ======================================

  const handleOpenHiringForm = (
    application
  ) => {
    setHiringApplication(application);

    setHiringForm({
      ctc:
        application?.hiringDetails?.ctc ||
        "",

      joiningDate:
        application?.hiringDetails?.joiningDate
          ? new Date(
              application.hiringDetails.joiningDate
            )
              .toISOString()
              .split("T")[0]
          : "",

      employmentType:
        application?.hiringDetails
          ?.employmentType ||
        "Full Time",

      workMode:
        application?.hiringDetails?.workMode ||
        "On-site",

      location:
        application?.hiringDetails?.location ||
        application?.location ||
        "",

      notes:
        application?.hiringDetails?.notes ||
        "",
    });

    setShowHiringForm(true);
  };

  // ======================================
  // CLOSE HIRING FORM
  // ======================================

  const handleCloseHiringForm = () => {
    if (submittingHire) {
      return;
    }

    setShowHiringForm(false);
    setHiringApplication(null);
  };

  // ======================================
  // UPDATE HIRING FORM
  // ======================================

  const handleHiringFormChange = (
    event
  ) => {
    const { name, value } = event.target;

    setHiringForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ======================================
  // CONFIRM & HIRE
  // ======================================

  const handleConfirmHire = async (
    event
  ) => {
    event.preventDefault();

    if (!hiringApplication?._id) {
      toast.error(
        "Candidate information is missing."
      );

      return;
    }

    if (!hiringForm.ctc.trim()) {
      toast.error(
        "Please enter the salary / CTC."
      );

      return;
    }

    if (!hiringForm.joiningDate) {
      toast.error(
        "Please select the joining date."
      );

      return;
    }

    if (!hiringForm.location.trim()) {
      toast.error(
        "Please enter the joining location."
      );

      return;
    }

    try {
      setSubmittingHire(true);

      const token = getToken();

      if (!token) {
        toast.error(
          "Company admin session not found."
        );

        navigate(
          "/company-admin/login"
        );

        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/applications/${hiringApplication._id}/hire`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ctc: hiringForm.ctc.trim(),
            joiningDate:
              hiringForm.joiningDate,
            employmentType:
              hiringForm.employmentType,
            workMode: hiringForm.workMode,
            location:
              hiringForm.location.trim(),
            notes:
              hiringForm.notes.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to hire candidate."
        );
      }

      toast.success(
        "Candidate hired successfully."
      );

      setApplications((current) =>
        current.filter(
          (application) =>
            application._id !==
            hiringApplication._id
        )
      );

      setShowHiringForm(false);
      setHiringApplication(null);
      setSelectedInterview(null);
    } catch (error) {
      console.error(
        "Confirm hire error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to hire candidate."
      );
    } finally {
      setSubmittingHire(false);
    }
  };

  // ======================================
  // OPEN MEETING LINK
  // ======================================

  const handleOpenMeeting = (
    application
  ) => {
    const link =
      getInterview(application)
        .meetingLink;

    if (!link) {
      toast.error(
        "Meeting link is not available."
      );

      return;
    }

    window.open(
      link,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="interviewsPage">
        <AdminSidebar />

        <main className="interviewsMain">
          <div className="interviewsLoading">
            <div className="interviewsLoadingIcon">
              <Loader2 size={30} />
            </div>

            <h3>
              Loading interviews...
            </h3>

            <p>
              Please wait while we fetch the
              scheduled interviews.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ======================================
  // MAIN UI
  // ======================================

  return (
    <div className="interviewsPage">
      <AdminSidebar />

      <main className="interviewsMain">
        {/* ======================================
            TOP BAR
        ====================================== */}

        <header className="interviewsTopbar">
          <div>
            <span className="interviewsTopbarLabel">
              Company Admin
            </span>

            <h1>
              Interviews
            </h1>
          </div>

          <div className="interviewsAdminRight">
            <button
              type="button"
              className="interviewsNotification"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="interviewsAdmin">
              <div className="interviewsAdminAvatar">
                {(adminData?.companyName ||
                  adminData?.company ||
                  "JOBHUB")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="interviewsAdminInfo">
                <strong>
                  {adminData?.companyName ||
                    adminData?.company ||
                    "JOBHUB"}
                </strong>

                <span>
                  Company Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <section className="interviewsHeader">
          <div>
            <span className="interviewsEyebrow">
              Interview Management
            </span>

            <h2>
              Scheduled Interviews
            </h2>

            <p>
              Manage upcoming candidate interviews
              and record interview outcomes.
            </p>
          </div>

          <button
            type="button"
            className={`interviewsRefreshButton ${
              refreshing
                ? "refreshing"
                : ""
            }`}
            onClick={() =>
              fetchInterviews(true)
            }
            disabled={refreshing}
          >
            <RefreshCw size={17} />

            Refresh
          </button>
        </section>

        {/* ======================================
            STATS
        ====================================== */}

        <section className="interviewsStats">
          <div className="interviewsStatCard">
            <div className="interviewsStatIcon upcoming">
              <CalendarDays size={20} />
            </div>

            <div>
              <span>
                Upcoming
              </span>

              <strong>
                {upcomingCount}
              </strong>
            </div>
          </div>

          <div className="interviewsStatCard">
            <div className="interviewsStatIcon completed">
              <Check size={20} />
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {completedCount}
              </strong>
            </div>
          </div>

          <div className="interviewsStatCard">
            <div className="interviewsStatIcon total">
              <Users size={20} />
            </div>

            <div>
              <span>
                Total Scheduled
              </span>

              <strong>
                {applications.length}
              </strong>
            </div>
          </div>
        </section>

        {/* ======================================
            TABS + SEARCH
        ====================================== */}

        <section className="interviewsToolbar">
          <div className="interviewsTabs">
            <button
              type="button"
              className={
                activeTab ===
                "Upcoming"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "Upcoming"
                )
              }
            >
              Upcoming

              <span>
                {upcomingCount}
              </span>
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "Completed"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "Completed"
                )
              }
            >
              Completed

              <span>
                {completedCount}
              </span>
            </button>

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
                {applications.length}
              </span>
            </button>
          </div>

          <div className="interviewsSearch">
            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search candidate, role or email..."
            />
          </div>
        </section>

        {/* ======================================
            TABLE
        ====================================== */}

        <section className="interviewsTableCard">
          <div className="interviewsTableWrapper">
            <table className="interviewsTable">
              <thead>
                <tr>
                  <th>
                    Candidate
                  </th>

                  <th>
                    Position
                  </th>

                  <th>
                    Interview
                  </th>

                  <th>
                    Date & Time
                  </th>

                  <th>
                    Mode
                  </th>

                  <th>
                    Interviewers
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedApplications.map(
                  (application) => {
                    const candidateName =
                      getCandidateName(
                        application
                      );

                    const interview =
                      getInterview(
                        application
                      );

                    const interviewersList =
                      getInterviewers(
                        application
                      );

                    const mode =
                      getMode(
                        application
                      );

                    const isUpdating =
                      updatingApplicationId ===
                      application._id;

                    return (
                      <tr
                        key={
                          application._id
                        }
                      >
                        {/* CANDIDATE */}

                        <td>
                          <div className="interviewCandidate">
                            <div className="interviewCandidateAvatar">
                              {getInitials(
                                candidateName
                              )}
                            </div>

                            <div className="interviewCandidateInfo">
                              <strong>
                                {
                                  candidateName
                                }
                              </strong>

                              <span>
                                {
                                  getCandidateEmail(
                                    application
                                  )
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* POSITION */}

                        <td>
                          <div className="interviewPosition">
                            <strong>
                              {application.jobTitle ||
                                "Position"}
                            </strong>

                            <span>
                              {
                                application.companyName
                              }
                            </span>
                          </div>
                        </td>

                        {/* INTERVIEW TYPE */}

                        <td>
                          <span className="interviewTypeBadge">
                            {
                              getInterviewType(
                                application
                              )
                            }
                          </span>
                        </td>

                        {/* DATE / TIME */}

                        <td>
                          <div className="interviewDateTime">
                            <span>
                              <CalendarDays
                                size={14}
                              />

                              {formatDate(
                                application
                              )}
                            </span>

                            <span>
                              <Clock3
                                size={14}
                              />

                              {formatTime(
                                application
                              )}
                            </span>
                          </div>
                        </td>

                        {/* MODE */}

                        <td>
                          <div className="interviewMode">
                            {mode ===
                            "Online" ? (
                              <Video
                                size={15}
                              />
                            ) : (
                              <MapPin
                                size={15}
                              />
                            )}

                            <span>
                              {mode ||
                                "Not set"}
                            </span>
                          </div>
                        </td>

                        {/* INTERVIEWERS */}

                        <td>
                          <div className="interviewInterviewers">
                            {interviewersList
                              .slice(
                                0,
                                2
                              )
                              .map(
                                (
                                  interviewer
                                ) => (
                                  <span
                                    key={
                                      interviewer
                                    }
                                  >
                                    {
                                      interviewer
                                    }
                                  </span>
                                )
                              )}

                            {interviewersList.length >
                              2 && (
                              <span className="interviewMore">
                                +
                                {interviewersList.length -
                                  2}
                              </span>
                            )}

                            {interviewersList.length ===
                              0 && (
                              <span>
                                Not assigned
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="interviewActions">
                            <button
                              type="button"
                              className="interviewActionButton view"
                              title="View interview"
                              onClick={() =>
                                handleOpenDetails(
                                  application
                                )
                              }
                            >
                              <Eye
                                size={16}
                              />
                            </button>

                            {mode ===
                              "Online" &&
                              interview.meetingLink && (
                                <button
                                  type="button"
                                  className="interviewActionButton meeting"
                                  title="Open meeting"
                                  onClick={() =>
                                    handleOpenMeeting(
                                      application
                                    )
                                  }
                                >
                                  <ExternalLink
                                    size={
                                      16
                                    }
                                  />
                                </button>
                              )}

                            <button
                              type="button"
                              className="interviewActionButton hire"
                              title="Hire candidate"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleOpenHiringForm(
                                  application
                                )
                              }
                            >
                              {isUpdating ? (
                                <Loader2
                                  size={
                                    16
                                  }
                                  className="interviewSpinner"
                                />
                              ) : (
                                <Check
                                  size={
                                    16
                                  }
                                />
                              )}
                            </button>

                            <button
                              type="button"
                              className="interviewActionButton reject"
                              title="Reject candidate"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleOpenRejectForm(
                                  application
                                )
                              }
                            >
                              <X
                                size={16}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {/* ======================================
                EMPTY STATE
            ====================================== */}

            {paginatedApplications.length ===
              0 && (
              <div className="interviewsEmpty">
                <div className="interviewsEmptyIcon">
                  <CalendarDays
                    size={27}
                  />
                </div>

                <h3>
                  No interviews found
                </h3>

                <p>
                  {search
                    ? "No scheduled interviews match your search."
                    : activeTab ===
                      "Upcoming"
                    ? "There are no upcoming interviews."
                    : activeTab ===
                      "Completed"
                    ? "There are no completed interviews."
                    : "No interviews have been scheduled yet."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="interviewsClearSearch"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ======================================
              PAGINATION
          ====================================== */}

          {filteredApplications.length >
            ITEMS_PER_PAGE && (
            <div className="interviewsPagination">
              <span>
                Showing{" "}
                {startIndex + 1}-
                {Math.min(
                  startIndex +
                    ITEMS_PER_PAGE,
                  filteredApplications.length
                )}{" "}
                of{" "}
                {
                  filteredApplications.length
                }
              </span>

              <div className="interviewsPaginationButtons">
                <button
                  type="button"
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                <span>
                  {safeCurrentPage} /{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ======================================
          INTERVIEW DETAILS MODAL
      ====================================== */}

      {selectedInterview && (
        <div
          className="interviewDetailsOverlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseDetails();
            }
          }}
        >
          <div className="interviewDetailsModal">
            {/* MODAL HEADER */}

            <div className="interviewDetailsHeader">
              <div>
                <span>
                  Interview Details
                </span>

                <h2>
                  {getCandidateName(
                    selectedInterview
                  )}
                </h2>
              </div>

              <button
                type="button"
                className="interviewDetailsClose"
                onClick={
                  handleCloseDetails
                }
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="interviewDetailsBody">
              <div className="interviewDetailsProfile">
                <div className="interviewDetailsAvatar">
                  {getInitials(
                    getCandidateName(
                      selectedInterview
                    )
                  )}
                </div>

                <div>
                  <strong>
                    {getCandidateName(
                      selectedInterview
                    )}
                  </strong>

                  <span>
                    {
                      selectedInterview.jobTitle
                    }
                  </span>
                </div>
              </div>

              <div className="interviewDetailsGrid">
                <div className="interviewDetailItem">
                  <span>
                    <CalendarDays
                      size={16}
                    />
                    Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedInterview
                    )}
                  </strong>
                </div>

                <div className="interviewDetailItem">
                  <span>
                    <Clock3 size={16} />
                    Time
                  </span>

                  <strong>
                    {formatTime(
                      selectedInterview
                    )}
                  </strong>
                </div>

                <div className="interviewDetailItem">
                  <span>
                    <BriefcaseBusiness
                      size={16}
                    />
                    Interview Type
                  </span>

                  <strong>
                    {getInterviewType(
                      selectedInterview
                    )}
                  </strong>
                </div>

                <div className="interviewDetailItem">
                  <span>
                    {getMode(
                      selectedInterview
                    ) === "Online" ? (
                      <Video
                        size={16}
                      />
                    ) : (
                      <MapPin
                        size={16}
                      />
                    )}
                    Mode
                  </span>

                  <strong>
                    {getMode(
                      selectedInterview
                    ) || "Not set"}
                  </strong>
                </div>

                <div className="interviewDetailItem">
                  <span>
                    <Mail size={16} />
                    Email
                  </span>

                  <strong>
                    {getCandidateEmail(
                      selectedInterview
                    ) || "Not available"}
                  </strong>
                </div>

                <div className="interviewDetailItem">
                  <span>
                    <Phone size={16} />
                    Phone
                  </span>

                  <strong>
                    {getCandidatePhone(
                      selectedInterview
                    ) || "Not available"}
                  </strong>
                </div>
              </div>

              {/* INTERVIEWERS */}

              <div className="interviewDetailsSection">
                <h3>
                  Interviewers
                </h3>

                <div className="interviewDetailsInterviewerList">
                  {getInterviewers(
                    selectedInterview
                  ).length > 0 ? (
                    getInterviewers(
                      selectedInterview
                    ).map(
                      (interviewer) => (
                        <span
                          key={
                            interviewer
                          }
                        >
                          <Users
                            size={14}
                          />

                          {interviewer}
                        </span>
                      )
                    )
                  ) : (
                    <p>
                      No interviewers
                      assigned.
                    </p>
                  )}
                </div>
              </div>

              {/* ONLINE */}

              {getMode(
                selectedInterview
              ) === "Online" && (
                <div className="interviewDetailsSection">
                  <h3>
                    Meeting Link
                  </h3>

                  <div className="interviewMeetingBox">
                    <span>
                      {getInterview(
                        selectedInterview
                      ).meetingLink ||
                        "Meeting link not available."}
                    </span>

                    {getInterview(
                      selectedInterview
                    ).meetingLink && (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenMeeting(
                            selectedInterview
                          )
                        }
                      >
                        Open Meeting
                        <ExternalLink
                          size={14}
                        />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* OFFLINE */}

              {getMode(
                selectedInterview
              ) === "Offline" && (
                <div className="interviewDetailsSection">
                  <h3>
                    Interview Location
                  </h3>

                  <div className="interviewLocationBox">
                    <MapPin
                      size={17}
                    />

                    <span>
                      {getInterview(
                        selectedInterview
                      ).location ||
                        "Location not available."}
                    </span>
                  </div>
                </div>
              )}

              {/* NOTES */}

              <div className="interviewDetailsSection">
                <h3>
                  Additional Notes
                </h3>

                <div className="interviewNotesBox">
                  {getInterview(
                    selectedInterview
                  ).notes ? (
                    <p>
                      {
                        getInterview(
                          selectedInterview
                        ).notes
                      }
                    </p>
                  ) : (
                    <p className="empty">
                      No additional notes
                      were added.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="interviewDetailsFooter">
              <button
                type="button"
                className="interviewModalCloseButton"
                onClick={
                  handleCloseDetails
                }
              >
                Close
              </button>

              <div>
                <button
                  type="button"
                  className="interviewModalRejectButton"
                  disabled={
                    updatingApplicationId ===
                    selectedInterview._id
                  }
                  onClick={() =>
                    handleOpenRejectForm(
                      selectedInterview
                    )
                  }
                >
                  <X size={16} />

                  Reject
                </button>

                <button
                  type="button"
                  className="interviewModalHireButton"
                  disabled={
                    updatingApplicationId ===
                    selectedInterview._id
                  }
                  onClick={() =>
                    handleOpenHiringForm(
                      selectedInterview
                    )
                  }
                >
                  <Check size={16} />

                  Mark as Hired
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ======================================
          REJECT CANDIDATE MODAL
      ====================================== */}

      {showRejectForm && rejectApplication && (
        <div
          className="rejectCandidateOverlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !updatingApplicationId
            ) {
              handleCloseRejectForm();
            }
          }}
        >
          <div className="rejectCandidateModal">
            <div className="rejectCandidateHeader">
              <div className="rejectCandidateHeaderContent">
                <div className="rejectCandidateIcon">
                  <X size={24} />
                </div>
                <div>
                  <span className="rejectCandidateEyebrow">Candidate Decision</span>
                  <h2>Reject Candidate</h2>
                  <p>Record the rejection details before moving this candidate to Rejected.</p>
                </div>
              </div>

              <button
                type="button"
                className="rejectCandidateClose"
                onClick={handleCloseRejectForm}
                disabled={Boolean(updatingApplicationId)}
                aria-label="Close rejection dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="rejectCandidateForm"
              onSubmit={(event) => {
                event.preventDefault();
                handleConfirmReject();
              }}
            >
              <div className="rejectCandidateLayout">
                <aside className="rejectCandidatePanel">
                  <div className="rejectCandidateSummary">
                    <div className="rejectCandidateAvatar">
                      {getInitials(getCandidateName(rejectApplication))}
                    </div>
                    <div className="rejectCandidateIdentity">
                      <strong>{getCandidateName(rejectApplication)}</strong>
                      <span>{rejectApplication.jobTitle || "Position not available"}</span>
                    </div>
                  </div>

                  <div className="rejectCandidateContact">
                    <div>
                      <Mail size={16} />
                      <span>{getCandidateEmail(rejectApplication) || "Email not available"}</span>
                    </div>
                    <div>
                      <Phone size={16} />
                      <span>{getCandidatePhone(rejectApplication) || "Phone not available"}</span>
                    </div>
                  </div>

                  <div className="rejectCandidateDivider" />

                  <div className="rejectCandidateMeta">
                    <div className="rejectMetaItem">
                      <BriefcaseBusiness size={17} />
                      <div>
                        <span>Job Position</span>
                        <strong>{rejectApplication.jobTitle || "Position not available"}</strong>
                      </div>
                    </div>

                    <div className="rejectMetaItem">
                      <Building2 size={17} />
                      <div>
                        <span>Company</span>
                        <strong>
                          {rejectApplication.companyName ||
                            adminData?.companyName ||
                            adminData?.company ||
                            "Company"}
                        </strong>
                      </div>
                    </div>

                    <div className="rejectMetaItem">
                      <CalendarDays size={17} />
                      <div>
                        <span>Interview Date</span>
                        <strong>{formatDate(rejectApplication)} {formatTime(rejectApplication)}</strong>
                      </div>
                    </div>

                    <div className="rejectMetaItem">
                      <Users size={17} />
                      <div>
                        <span>Interviewers</span>
                        <strong>
                          {getInterviewers(rejectApplication).length > 0
                            ? getInterviewers(rejectApplication).join(", ")
                            : "Not assigned"}
                        </strong>
                      </div>
                    </div>

                    <div className="rejectMetaItem">
                      <Laptop size={17} />
                      <div>
                        <span>Interview Mode</span>
                        <strong>{getMode(rejectApplication) || "Not set"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="rejectCandidateStatus">
                    <div className="rejectStatusIcon">
                      <X size={15} />
                    </div>
                    <div>
                      <span>Current Status</span>
                      <strong>Interview Scheduled</strong>
                    </div>
                  </div>

                  <div className="rejectCandidateInfoBox">
                    <X size={17} />
                    <p>Once confirmed, this candidate will be moved to <strong>Rejected</strong> and removed from the active Interviews list.</p>
                  </div>
                </aside>

                <section className="rejectCandidateDetailsPanel">
                  <div className="rejectCandidateDetailsHeading">
                    <div>
                      <h3>Rejection Details</h3>
                      <p>Provide a clear reason and optional feedback for this decision.</p>
                    </div>
                  </div>

                  <div className="rejectCandidateFields">
                    <div className="rejectCandidateField">
                      <label htmlFor="rejection-reason">
                        <FileText size={15} />
                        Rejection Reason <span>*</span>
                      </label>
                      <select
                        id="rejection-reason"
                        name="reason"
                        value={rejectionForm.reason}
                        onChange={handleRejectionFormChange}
                        disabled={Boolean(updatingApplicationId)}
                        required
                      >
                        <option value="">Select a reason</option>
                        <option value="Not a good fit">Not a good fit</option>
                        <option value="Skills mismatch">Skills mismatch</option>
                        <option value="Experience mismatch">Experience mismatch</option>
                        <option value="Salary expectations">Salary expectations</option>
                        <option value="Position filled">Position filled</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="rejectCandidateField rejectCandidateFieldFull">
                      <label htmlFor="rejection-feedback">
                        <FileText size={15} />
                        Additional Feedback
                      </label>
                      <textarea
                        id="rejection-feedback"
                        name="feedback"
                        rows="7"
                        value={rejectionForm.feedback}
                        onChange={handleRejectionFormChange}
                        placeholder="Add feedback or comments about the candidate..."
                        disabled={Boolean(updatingApplicationId)}
                      />
                      <small>This feedback will be stored with the rejection record.</small>
                    </div>

                    <label className="rejectNotificationCheckbox">
                      <input
                        type="checkbox"
                        name="notifyCandidate"
                        checked={rejectionForm.notifyCandidate}
                        onChange={handleRejectionFormChange}
                        disabled={Boolean(updatingApplicationId)}
                      />
                      <span className="rejectCheckboxBox">
                        <Check size={13} />
                      </span>
                      <span>Send notification to candidate</span>
                    </label>
                  </div>

                  <div className="rejectCandidateDividerBottom" />

                  <div className="rejectCandidateFooter">
                    <button
                      type="button"
                      className="rejectCancelButton"
                      onClick={handleCloseRejectForm}
                      disabled={Boolean(updatingApplicationId)}
                    >
                      <X size={17} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="rejectConfirmButton"
                      disabled={Boolean(updatingApplicationId) || !rejectionForm.reason}
                    >
                      {updatingApplicationId ? (
                        <>
                          <Loader2 size={17} className="interviewSpinner" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <X size={17} />
                          Reject Candidate
                        </>
                      )}
                    </button>
                  </div>
                </section>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================
          HIRING DETAILS MODAL
      ====================================== */}

      {showHiringForm && hiringApplication && (
        <div
          className="hiringDetailsOverlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !submittingHire
            ) {
              handleCloseHiringForm();
            }
          }}
        >
          <div className="hiringDetailsModal">
            <div className="hiringDetailsHeader">
              <div className="hiringHeaderContent">
                <div className="hiringHeaderIcon">
                  <UserCheck size={25} />
                </div>
                <div>
                  <span className="hiringHeaderEyebrow">Hiring Details</span>
                  <h2>Mark Candidate as Hired</h2>
                  <p>Enter the final employment details before confirming the hire.</p>
                </div>
              </div>

              <div className="hiringAutomaticNotice">
                <Check size={17} />
                <span>Hired On will be recorded automatically.</span>
              </div>

              <button
                type="button"
                className="hiringDetailsClose"
                onClick={handleCloseHiringForm}
                disabled={submittingHire}
                aria-label="Close hiring details"
              >
                <X size={20} />
              </button>
            </div>

            <form className="hiringDetailsForm" onSubmit={handleConfirmHire}>
              <div className="hiringDetailsLayout">
                <aside className="hiringCandidatePanel">
                  <div className="hiringCandidateTop">
                    <div className="hiringCandidateAvatar">
                      {getInitials(getCandidateName(hiringApplication))}
                    </div>
                    <div className="hiringCandidateIdentity">
                      <strong>{getCandidateName(hiringApplication)}</strong>
                      <span>{hiringApplication.jobTitle || "Position"}</span>
                    </div>
                  </div>

                  <div className="hiringCandidateContact">
                    <div>
                      <Mail size={16} />
                      <span>{getCandidateEmail(hiringApplication) || "Email not available"}</span>
                    </div>
                    <div>
                      <Phone size={16} />
                      <span>{getCandidatePhone(hiringApplication) || "Phone not available"}</span>
                    </div>
                  </div>

                  <div className="hiringCandidateDivider" />

                  <div className="hiringCandidateMeta">
                    <div className="hiringMetaItem">
                      <BriefcaseBusiness size={17} />
                      <div><span>Job Position</span><strong>{hiringApplication.jobTitle || "Position not available"}</strong></div>
                    </div>
                    <div className="hiringMetaItem">
                      <Building2 size={17} />
                      <div><span>Company</span><strong>{hiringApplication.companyName || adminData?.companyName || adminData?.company || "Company"}</strong></div>
                    </div>
                    <div className="hiringMetaItem">
                      <CalendarDays size={17} />
                      <div><span>Interview Date</span><strong>{formatDate(hiringApplication)} {formatTime(hiringApplication)}</strong></div>
                    </div>
                    <div className="hiringMetaItem">
                      <Users size={17} />
                      <div><span>Interviewers</span><strong>{getInterviewers(hiringApplication).length > 0 ? getInterviewers(hiringApplication).join(", ") : "Not assigned"}</strong></div>
                    </div>
                    <div className="hiringMetaItem">
                      <Laptop size={17} />
                      <div><span>Interview Mode</span><strong>{getMode(hiringApplication) || "Not set"}</strong></div>
                    </div>
                  </div>

                  <div className="hiringCandidateStatus">
                    <div className="hiringStatusIcon"><Check size={15} /></div>
                    <div><span>Current Status</span><strong>Interview Scheduled</strong></div>
                  </div>

                  <div className="hiringCandidateInfoBox">
                    <Check size={17} />
                    <p>Once confirmed, this candidate will be marked as <strong>Hired</strong> and will be able to view these employment details from their account.</p>
                  </div>
                </aside>

                <section className="hiringEmploymentPanel">
                  <div className="hiringEmploymentHeading">
                    <div>
                      <h3>Employment Details</h3>
                      <p>Provide the final offer details for the candidate.</p>
                    </div>
                  </div>

                  <div className="hiringDetailsFields">
                    <div className="hiringField">
                      <label htmlFor="hiring-ctc"><CircleDollarSign size={15} />Salary / CTC <span>*</span></label>
                      <input id="hiring-ctc" name="ctc" type="text" value={hiringForm.ctc} onChange={handleHiringFormChange} placeholder="e.g. ₹5 LPA, 6.5 LPA, ₹50,000/month" disabled={submittingHire} required />
                      <small>Enter the annual CTC or monthly salary.</small>
                    </div>

                    <div className="hiringField">
                      <label htmlFor="hiring-joining-date"><CalendarDays size={15} />Joining Date <span>*</span></label>
                      <input id="hiring-joining-date" name="joiningDate" type="date" value={hiringForm.joiningDate} onChange={handleHiringFormChange} disabled={submittingHire} required />
                      <small>Select the expected joining date.</small>
                    </div>

                    <div className="hiringField">
                      <label htmlFor="hiring-employment-type"><BriefcaseBusiness size={15} />Employment Type <span>*</span></label>
                      <select id="hiring-employment-type" name="employmentType" value={hiringForm.employmentType} onChange={handleHiringFormChange} disabled={submittingHire} required>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                      <small>Select the type of employment.</small>
                    </div>

                    <div className="hiringField">
                      <label htmlFor="hiring-work-mode"><Laptop size={15} />Work Mode <span>*</span></label>
                      <select id="hiring-work-mode" name="workMode" value={hiringForm.workMode} onChange={handleHiringFormChange} disabled={submittingHire} required>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                      </select>
                      <small>Select the work arrangement.</small>
                    </div>

                    <div className="hiringField hiringFieldFull">
                      <label htmlFor="hiring-location"><MapPin size={15} />Joining Location <span>*</span></label>
                      <input id="hiring-location" name="location" type="text" value={hiringForm.location} onChange={handleHiringFormChange} placeholder="e.g. Hyderabad, Telangana" disabled={submittingHire} required />
                      <small>Enter the joining location or office address.</small>
                    </div>

                    <div className="hiringField hiringFieldFull">
                      <label htmlFor="hiring-notes"><FileText size={15} />Additional Notes</label>
                      <textarea id="hiring-notes" name="notes" rows="5" value={hiringForm.notes} onChange={handleHiringFormChange} placeholder="Add joining instructions or candidate-visible information..." disabled={submittingHire} />
                      <small>This information will be visible to the candidate from their account.</small>
                    </div>
                  </div>

                  <div className="hiringEmploymentDivider" />

                  <div className="hiringDetailsFooter">
                    <button type="button" className="hiringCancelButton" onClick={handleCloseHiringForm} disabled={submittingHire}>
                      <X size={17} />Cancel
                    </button>
                    <button type="submit" className="hiringConfirmButton" disabled={submittingHire}>
                      {submittingHire ? (
                        <><Loader2 size={17} className="interviewSpinner" />Confirming...</>
                      ) : (
                        <><Check size={17} />Confirm & Hire</>
                      )}
                    </button>
                  </div>
                </section>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Interviews;