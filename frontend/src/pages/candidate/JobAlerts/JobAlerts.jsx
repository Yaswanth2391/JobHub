import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CheckCircle2,
  Edit3,
  MapPin,
  Menu,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
  LoaderCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import CandidateSidebar from "../../../components/CandidateSidebar/CandidateSidebar";

import API_BASE_URL from "../../../services/api";

import "./JobAlerts.css";

const emptyAlertForm = {
  title: "",
  keywords: "",
  location: "",
  employmentType: "All",
  frequency: "Daily",
  enabled: true,
};

function JobAlerts() {
  const navigate = useNavigate();

  /* =====================================
     CANDIDATE
  ===================================== */

  const [candidate, setCandidate] =
    useState(null);

  /* =====================================
     SIDEBAR
  ===================================== */

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  /* =====================================
     ALERTS
  ===================================== */

  const [alerts, setAlerts] =
    useState([]);

  const [isLoadingAlerts, setIsLoadingAlerts] =
    useState(true);

  const [isSavingAlert, setIsSavingAlert] =
    useState(false);

  const [deletingAlertId, setDeletingAlertId] =
    useState(null);

  const [togglingAlertId, setTogglingAlertId] =
    useState(null);

  /* =====================================
     SEARCH
  ===================================== */

  const [searchTerm, setSearchTerm] =
    useState("");

  /* =====================================
     MODAL
  ===================================== */

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingAlert, setEditingAlert] =
    useState(null);

  const [alertForm, setAlertForm] =
    useState(emptyAlertForm);

  const [formError, setFormError] =
    useState("");

  const [pageError, setPageError] =
    useState("");

  /* =====================================
     GET TOKEN
  ===================================== */

  const getToken = () => {
    return (
      localStorage.getItem(
        "jobhubCandidateToken"
      ) || ""
    );
  };

  /* =====================================
     CANDIDATE INITIALS
  ===================================== */

  const getInitials = (fullName) => {
    if (!fullName) {
      return "U";
    }

    return fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name
          .charAt(0)
          .toUpperCase()
      )
      .join("");
  };

  /* =====================================
     LOAD CANDIDATE
  ===================================== */

  useEffect(() => {
    const storedCandidate =
      localStorage.getItem(
        "jobhubCandidate"
      );

    if (!storedCandidate) {
      return;
    }

    try {
      setCandidate(
        JSON.parse(storedCandidate)
      );
    } catch (error) {
      console.error(
        "Unable to load candidate:",
        error
      );

      setCandidate(null);
    }
  }, []);

  /* =====================================
     API REQUEST HELPER
  ===================================== */

  const apiRequest = async (
    endpoint,
    options = {}
  ) => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      throw new Error(
        "Please login to continue."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers: {
          ...(options.body
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),
          Authorization:
            `Bearer ${token}`,
          ...(options.headers || {}),
        },
      }
    );

    const contentType =
      response.headers.get(
        "content-type"
      );

    let data = {};

    if (
      contentType &&
      contentType.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      throw new Error(
        text ||
          "Backend returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Something went wrong."
      );
    }

    return data;
  };

  /* =====================================
     LOAD ALERTS
  ===================================== */

  const fetchAlerts = async () => {
    try {
      setIsLoadingAlerts(true);
      setPageError("");

      const data =
        await apiRequest(
          "/api/candidates/job-alerts"
        );

      const serverAlerts =
        Array.isArray(data.alerts)
          ? data.alerts
          : [];

      /*
        One-time migration of old
        localStorage alerts.

        This prevents previously created
        alerts from being lost when we move
        the system to MongoDB.
      */

      const storedAlerts =
        localStorage.getItem(
          "jobhubJobAlerts"
        );

      let oldAlerts = [];

      if (storedAlerts) {
        try {
          const parsed =
            JSON.parse(
              storedAlerts
            );

          if (
            Array.isArray(parsed)
          ) {
            oldAlerts = parsed;
          }
        } catch (error) {
          console.error(
            "Unable to read old job alerts:",
            error
          );
        }
      }

      const migrationCompleted =
        localStorage.getItem(
          "jobhubJobAlertsMigrated"
        );

      /*
        Only migrate when MongoDB currently
        has no alerts for this candidate.
      */

      if (
        serverAlerts.length === 0 &&
        oldAlerts.length > 0 &&
        !migrationCompleted
      ) {
        let migrationSucceeded = true;

        for (
          const oldAlert of oldAlerts
        ) {
          try {
            await apiRequest(
              "/api/candidates/job-alerts",
              {
                method: "POST",
                body: JSON.stringify({
                  title:
                    oldAlert.title ||
                    "Job Alert",
                  keywords:
                    oldAlert.keywords ||
                    "",
                  location:
                    oldAlert.location ||
                    "",
                  employmentType:
                    oldAlert.employmentType ||
                    "All",
                  frequency:
                    oldAlert.frequency ||
                    "Daily",
                  enabled:
                    oldAlert.enabled !== false,
                }),
              }
            );
          } catch (error) {
            console.error(
              "Job alert migration error:",
              error
            );

            migrationSucceeded = false;
          }
        }

        if (
          migrationSucceeded
        ) {
          localStorage.setItem(
            "jobhubJobAlertsMigrated",
            "true"
          );

          localStorage.removeItem(
            "jobhubJobAlerts"
          );

          const refreshedData =
            await apiRequest(
              "/api/candidates/job-alerts"
            );

          setAlerts(
            Array.isArray(
              refreshedData.alerts
            )
              ? refreshedData.alerts
              : []
          );

          return;
        }
      }

      setAlerts(
        serverAlerts
      );
    } catch (error) {
      console.error(
        "Fetch job alerts error:",
        error
      );

      setPageError(
        error.message ||
          "Unable to load your job alerts."
      );
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  /* =====================================
     LOAD ALERTS ON PAGE LOAD
  ===================================== */

  useEffect(() => {
    fetchAlerts();
  }, []);

  /* =====================================
     OPEN CREATE MODAL
  ===================================== */

  const openCreateModal = () => {
    setEditingAlert(null);

    setAlertForm({
      ...emptyAlertForm,
    });

    setFormError("");
    setIsModalOpen(true);
  };

  /* =====================================
     OPEN EDIT MODAL
  ===================================== */

  const openEditModal = (alert) => {
    setEditingAlert(alert);

    setAlertForm({
      title:
        alert.title || "",
      keywords:
        alert.keywords || "",
      location:
        alert.location || "",
      employmentType:
        alert.employmentType ||
        "All",
      frequency:
        alert.frequency ||
        "Daily",
      enabled:
        alert.enabled !== false,
    });

    setFormError("");
    setIsModalOpen(true);
  };

  /* =====================================
     CLOSE MODAL
  ===================================== */

  const closeModal = () => {
    if (isSavingAlert) {
      return;
    }

    setIsModalOpen(false);
    setEditingAlert(null);

    setAlertForm({
      ...emptyAlertForm,
    });

    setFormError("");
  };

  /* =====================================
     FORM CHANGE
  ===================================== */

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setAlertForm(
      (current) => ({
        ...current,
        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );

    setFormError("");
  };

  /* =====================================
     SAVE ALERT
  ===================================== */

  const handleSaveAlert = async (
    event
  ) => {
    event.preventDefault();

    const title =
      alertForm.title.trim();

    const keywords =
      alertForm.keywords.trim();

    const location =
      alertForm.location.trim();

    if (!title) {
      setFormError(
        "Please enter a job alert name."
      );

      return;
    }

    if (!keywords && !location) {
      setFormError(
        "Add at least a keyword or location."
      );

      return;
    }

    try {
      setIsSavingAlert(true);
      setFormError("");
      setPageError("");

      const payload = {
        title,
        keywords,
        location,
        employmentType:
          alertForm.employmentType ||
          "All",
        frequency:
          alertForm.frequency ||
          "Daily",
        enabled:
          alertForm.enabled !== false,
      };

      if (editingAlert) {
        const data =
          await apiRequest(
            `/api/candidates/job-alerts/${editingAlert._id}`,
            {
              method: "PUT",
              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        setAlerts(
          (current) =>
            current.map(
              (alert) =>
                String(alert._id) ===
                String(
                  editingAlert._id
                )
                  ? {
                      ...alert,
                      ...data.alert,
                    }
                  : alert
            )
        );
      } else {
        const data =
          await apiRequest(
            "/api/candidates/job-alerts",
            {
              method: "POST",
              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        setAlerts(
          (current) => [
            data.alert,
            ...current,
          ]
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Save job alert error:",
        error
      );

      setFormError(
        error.message ||
          "Unable to save job alert."
      );
    } finally {
      setIsSavingAlert(false);
    }
  };

  /* =====================================
     TOGGLE ALERT
  ===================================== */

  const handleToggleAlert = async (
    alert
  ) => {
    try {
      setTogglingAlertId(
        alert._id
      );

      setPageError("");

      const data =
        await apiRequest(
          `/api/candidates/job-alerts/${alert._id}/toggle`,
          {
            method: "PATCH",
          }
        );

      setAlerts(
        (current) =>
          current.map(
            (currentAlert) =>
              String(
                currentAlert._id
              ) ===
              String(alert._id)
                ? {
                    ...currentAlert,
                    ...data.alert,
                  }
                : currentAlert
          )
      );
    } catch (error) {
      console.error(
        "Toggle job alert error:",
        error
      );

      setPageError(
        error.message ||
          "Unable to update job alert."
      );
    } finally {
      setTogglingAlertId(
        null
      );
    }
  };

  /* =====================================
     DELETE ALERT
  ===================================== */

  const handleDeleteAlert = async (
    alert
  ) => {
    const shouldDelete =
      window.confirm(
        "Delete this job alert?"
      );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingAlertId(
        alert._id
      );

      setPageError("");

      await apiRequest(
        `/api/candidates/job-alerts/${alert._id}`,
        {
          method: "DELETE",
        }
      );

      setAlerts(
        (current) =>
          current.filter(
            (currentAlert) =>
              String(
                currentAlert._id
              ) !==
              String(alert._id)
          )
      );
    } catch (error) {
      console.error(
        "Delete job alert error:",
        error
      );

      setPageError(
        error.message ||
          "Unable to delete job alert."
      );
    } finally {
      setDeletingAlertId(
        null
      );
    }
  };

  /* =====================================
     MARK MATCH AS VIEWED
  ===================================== */

  const handleMatchClick = async (
    alertId,
    match
  ) => {
    if (!match?.job?._id) {
      return;
    }

    try {
      if (!match.viewedAt) {
        await apiRequest(
          `/api/candidates/job-alerts/${alertId}/matches/${match.job._id}/viewed`,
          {
            method: "PATCH",
          }
        );

        setAlerts(
          (current) =>
            current.map(
              (alert) => {
                if (
                  String(
                    alert._id
                  ) !==
                  String(alertId)
                ) {
                  return alert;
                }

                return {
                  ...alert,
                  matches:
                    Array.isArray(
                      alert.matches
                    )
                      ? alert.matches.map(
                          (
                            currentMatch
                          ) =>
                            String(
                              currentMatch.job
                            ) ===
                            String(
                              match.job._id
                            )
                              ? {
                                  ...currentMatch,
                                  viewedAt:
                                    new Date().toISOString(),
                                }
                              : currentMatch
                        )
                      : [],
                };
              }
            )
        );
      }
    } catch (error) {
      console.error(
        "Mark alert match viewed error:",
        error
      );
    }

    navigate(
      `/jobs/${match.job._id}`
    );
  };

  /* =====================================
     SEARCH
  ===================================== */

  const filteredAlerts =
    useMemo(() => {
      const value =
        searchTerm
          .trim()
          .toLowerCase();

      if (!value) {
        return alerts;
      }

      return alerts.filter(
        (alert) => {
          const searchableValues = [
            alert.title,
            alert.keywords,
            alert.location,
            alert.employmentType,
            alert.frequency,
          ].filter(Boolean);

          return searchableValues.some(
            (item) =>
              String(item)
                .toLowerCase()
                .includes(value)
          );
        }
      );
    }, [
      alerts,
      searchTerm,
    ]);

  /* =====================================
     ACTIVE ALERT COUNT
  ===================================== */

  const activeAlertCount =
    alerts.filter(
      (alert) =>
        alert.enabled
    ).length;

  /* =====================================
     TOTAL NEW MATCHES
  ===================================== */

  const totalMatches =
    alerts.reduce(
      (total, alert) => {
        if (
          !Array.isArray(
            alert.matches
          )
        ) {
          return total;
        }

        return (
          total +
          alert.matches.filter(
            (match) =>
              match.job &&
              !match.viewedAt
          ).length
        );
      },
      0
    );

  return (
    <main className="candidateJobAlertsPage">
      {/* =====================================
          SIDEBAR
      ===================================== */}

      <CandidateSidebar />

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {isSidebarOpen && (
        <div
          className="candidateJobAlertsMobileOverlay"
          onClick={() =>
            setIsSidebarOpen(
              false
            )
          }
        />
      )}

      {/* =====================================
          MAIN
      ===================================== */}

      <section className="candidateJobAlertsMain">
        {/* =====================================
            TOPBAR
        ===================================== */}

        <header className="dashboardTopHeader candidateJobAlertsTopHeader">
          <div className="dashboardHeaderLeft">
            <button
              type="button"
              className="mobileSidebarButton"
              onClick={() =>
                setIsSidebarOpen(
                  true
                )
              }
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>

          <div className="dashboardHeaderRight">
            <button
              type="button"
              className="headerNotificationButton"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>

            <div className="headerCandidateInfo">
              <div className="headerCandidateAvatar">
                {getInitials(
                  candidate?.fullName
                )}
              </div>

              <div className="headerCandidateText">
                <strong>
                  {candidate?.fullName ||
                    "Candidate"}
                </strong>

                <span>
                  Candidate
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================
            CONTENT
        ===================================== */}

        <main className="candidateJobAlertsContent">
          {/* =====================================
              HERO
          ===================================== */}

          <section className="candidateJobAlertsHero">
            <div>
              <div className="candidateJobAlertsEyebrow">
                <Zap size={13} />

                Smart job matching
              </div>

              <h1>
                Job Alerts
              </h1>

              <p>
                Create alerts for the roles,
                skills and locations you want
                to track so you never miss a
                relevant opportunity.
              </p>
            </div>

            <div className="candidateJobAlertsHeroStats">
              <div>
                <strong>
                  {activeAlertCount}
                </strong>

                <span>
                  Active alerts
                </span>
              </div>

              <div>
                <strong>
                  {totalMatches}
                </strong>

                <span>
                  New matches
                </span>
              </div>

              <div>
                <strong>
                  {alerts.length}
                </strong>

                <span>
                  Total alerts
                </span>
              </div>
            </div>
          </section>

          {/* =====================================
              ERROR
          ===================================== */}

          {pageError && (
            <div className="candidateJobAlertFormError">
              {pageError}
            </div>
          )}

          {/* =====================================
              TOOLBAR
          ===================================== */}

          <section className="candidateJobAlertsToolbar">
            <div className="candidateJobAlertsSearch">
              <Search size={16} />

              <input
                type="text"
                placeholder="Search your job alerts..."
                value={
                  searchTerm
                }
                onChange={(
                  event
                ) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm(
                      ""
                    )
                  }
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="candidateJobAlertsCreateButton"
              onClick={
                openCreateModal
              }
            >
              <Plus size={16} />

              Create Alert
            </button>
          </section>

          {/* =====================================
              ALERTS
          ===================================== */}

          <section className="candidateJobAlertsListSection">
            <div className="candidateJobAlertsSectionHeader">
              <div>
                <h2>
                  Your alerts
                </h2>

                <p>
                  Manage the searches you want
                  JobHub to keep an eye on.
                </p>
              </div>
            </div>

            {/* =====================================
                LOADING
            ===================================== */}

            {isLoadingAlerts ? (
              <div className="candidateJobAlertsEmpty">
                <div className="candidateJobAlertsEmptyIcon">
                  <LoaderCircle
                    size={25}
                    className="jobAlertLoadingIcon"
                  />
                </div>

                <h3>
                  Loading your alerts...
                </h3>

                <p>
                  Please wait while we
                  fetch your saved job
                  alert preferences.
                </p>
              </div>
            ) : filteredAlerts.length ===
              0 ? (
              /* =====================================
                  EMPTY
              ===================================== */

              <div className="candidateJobAlertsEmpty">
                <div className="candidateJobAlertsEmptyIcon">
                  <Bell size={25} />
                </div>

                <h3>
                  {alerts.length ===
                  0
                    ? "No job alerts yet"
                    : "No matching alerts"}
                </h3>

                <p>
                  {alerts.length ===
                  0
                    ? "Create your first job alert to start tracking opportunities."
                    : "Try a different search term or create a new alert."}
                </p>

                <button
                  type="button"
                  className="candidateJobAlertsCreateButton"
                  onClick={
                    openCreateModal
                  }
                >
                  <Plus size={16} />

                  Create Alert
                </button>
              </div>
            ) : (
              /* =====================================
                  ALERT GRID
              ===================================== */

              <div className="candidateJobAlertsGrid">
                {filteredAlerts.map(
                  (alert) => {
                    const validMatches =
                      Array.isArray(
                        alert.matches
                      )
                        ? alert.matches.filter(
                            (
                              match
                            ) =>
                              match.job
                          )
                        : [];

                    const unreadMatches =
                      validMatches.filter(
                        (
                          match
                        ) =>
                          !match.viewedAt
                      );

                    return (
                      <article
                        className={`candidateJobAlertCard ${
                          alert.enabled
                            ? "active"
                            : "paused"
                        }`}
                        key={
                          alert._id
                        }
                      >
                        {/* =====================================
                            CARD TOP
                        ===================================== */}

                        <div className="candidateJobAlertCardTop">
                          <div className="candidateJobAlertIcon">
                            <BriefcaseBusiness
                              size={
                                19
                              }
                            />
                          </div>

                          <div className="candidateJobAlertCardActions">
                            <button
                              type="button"
                              className={`candidateJobAlertToggle ${
                                alert.enabled
                                  ? "on"
                                  : ""
                              }`}
                              onClick={() =>
                                handleToggleAlert(
                                  alert
                                )
                              }
                              disabled={
                                togglingAlertId ===
                                alert._id
                              }
                              aria-label={`${
                                alert.enabled
                                  ? "Pause"
                                  : "Activate"
                              } ${alert.title}`}
                              aria-pressed={
                                alert.enabled
                              }
                            >
                              <span />
                            </button>

                            <button
                              type="button"
                              className="candidateJobAlertIconButton"
                              onClick={() =>
                                openEditModal(
                                  alert
                                )
                              }
                              aria-label="Edit alert"
                              disabled={
                                togglingAlertId ===
                                  alert._id ||
                                deletingAlertId ===
                                  alert._id
                              }
                            >
                              <Edit3
                                size={
                                  15
                                }
                              />
                            </button>

                            <button
                              type="button"
                              className="candidateJobAlertIconButton danger"
                              onClick={() =>
                                handleDeleteAlert(
                                  alert
                                )
                              }
                              aria-label="Delete alert"
                              disabled={
                                deletingAlertId ===
                                alert._id
                              }
                            >
                              {deletingAlertId ===
                              alert._id ? (
                                <LoaderCircle
                                  size={
                                    15
                                  }
                                  className="jobAlertLoadingIcon"
                                />
                              ) : (
                                <Trash2
                                  size={
                                    15
                                  }
                                />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* =====================================
                            CARD BODY
                        ===================================== */}

                        <div className="candidateJobAlertCardBody">
                          <div className="candidateJobAlertStatus">
                            <CheckCircle2
                              size={
                                13
                              }
                            />

                            <span>
                              {alert.enabled
                                ? "Alert active"
                                : "Alert paused"}
                            </span>
                          </div>

                          <h3>
                            {alert.title}
                          </h3>

                          <div className="candidateJobAlertDetails">
                            <div>
                              <Search
                                size={
                                  14
                                }
                              />

                              <span>
                                {alert.keywords ||
                                  "Any skills"}
                              </span>
                            </div>

                            <div>
                              <MapPin
                                size={
                                  14
                                }
                              />

                              <span>
                                {alert.location ||
                                  "Any location"}
                              </span>
                            </div>

                            <div>
                              <Building2
                                size={
                                  14
                                }
                              />

                              <span>
                                {alert.employmentType ||
                                  "All"}
                              </span>
                            </div>
                          </div>

                          {/* =====================================
                              MATCH COUNT
                          ===================================== */}

                          {validMatches.length >
                            0 && (
                            <div
                              style={{
                                marginTop:
                                  "14px",
                                padding:
                                  "10px 12px",
                                borderRadius:
                                  "10px",
                                background:
                                  "#f5f8ff",
                                border:
                                  "1px solid #e5ebf7",
                                fontSize:
                                  "12px",
                                color:
                                  "#31507e",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "space-between",
                                gap:
                                  "10px",
                              }}
                            >
                              <span>
                                {
                                  unreadMatches.length
                                }{" "}
                                new matching{" "}
                                {unreadMatches.length ===
                                1
                                  ? "job"
                                  : "jobs"}
                              </span>

                              <strong>
                                {
                                  validMatches.length
                                }{" "}
                                total
                              </strong>
                            </div>
                          )}
                        </div>

                        {/* =====================================
                            MATCHED JOBS
                        ===================================== */}

                        {validMatches.length >
                          0 && (
                          <div
                            style={{
                              padding:
                                "0 18px 16px",
                            }}
                          >
                            <div
                              style={{
                                fontSize:
                                  "11px",
                                fontWeight:
                                  "700",
                                color:
                                  "#7d8797",
                                textTransform:
                                  "uppercase",
                                letterSpacing:
                                  "0.05em",
                                marginBottom:
                                  "8px",
                              }}
                            >
                              Matching jobs
                            </div>

                            <div
                              style={{
                                display:
                                  "flex",
                                flexDirection:
                                  "column",
                                gap:
                                  "7px",
                              }}
                            >
                              {validMatches
                                .slice(
                                  0,
                                  3
                                )
                                .map(
                                  (
                                    match,
                                    index
                                  ) => (
                                    <button
                                      type="button"
                                      key={`${alert._id}-${match.job._id}-${index}`}
                                      onClick={() =>
                                        handleMatchClick(
                                          alert._id,
                                          match
                                        )
                                      }
                                      style={{
                                        width:
                                          "100%",
                                        border:
                                          "1px solid #edf0f5",
                                        background:
                                          "#fff",
                                        borderRadius:
                                          "9px",
                                        padding:
                                          "9px 10px",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "space-between",
                                        gap:
                                          "10px",
                                        textAlign:
                                          "left",
                                        cursor:
                                          "pointer",
                                      }}
                                    >
                                      <span
                                        style={{
                                          minWidth:
                                            0,
                                        }}
                                      >
                                        <strong
                                          style={{
                                            display:
                                              "block",
                                            fontSize:
                                              "12px",
                                            color:
                                              "#172033",
                                            whiteSpace:
                                              "nowrap",
                                            overflow:
                                              "hidden",
                                            textOverflow:
                                              "ellipsis",
                                          }}
                                        >
                                          {match
                                            .job
                                            .jobTitle ||
                                            "Job opportunity"}
                                        </strong>

                                        <span
                                          style={{
                                            display:
                                              "block",
                                            marginTop:
                                              "3px",
                                            fontSize:
                                              "11px",
                                            color:
                                              "#8a94a5",
                                            whiteSpace:
                                              "nowrap",
                                            overflow:
                                              "hidden",
                                            textOverflow:
                                              "ellipsis",
                                          }}
                                        >
                                          {match
                                            .job
                                            .companyName ||
                                            "Company"}
                                          {" • "}
                                          {match
                                            .job
                                            .location ||
                                            "Location"}
                                        </span>
                                      </span>

                                      {!match.viewedAt && (
                                        <span
                                          style={{
                                            flexShrink:
                                              0,
                                            width:
                                              "7px",
                                            height:
                                              "7px",
                                            borderRadius:
                                              "50%",
                                            background:
                                              "#2563eb",
                                          }}
                                          aria-label="New match"
                                        />
                                      )}
                                    </button>
                                  )
                                )}

                              {validMatches.length >
                                3 && (
                                <span
                                  style={{
                                    fontSize:
                                      "11px",
                                    color:
                                      "#2563eb",
                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  +{" "}
                                  {validMatches.length -
                                    3}{" "}
                                  more matching jobs
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* =====================================
                            CARD FOOTER
                        ===================================== */}

                        <div className="candidateJobAlertCardFooter">
                          <span>
                            Frequency
                          </span>

                          <strong>
                            {alert.frequency ||
                              "Daily"}
                          </strong>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </main>
      </section>

      {/* =====================================
          CREATE / EDIT MODAL
      ===================================== */}

      {isModalOpen && (
        <div
          className="candidateJobAlertModalOverlay"
          onClick={closeModal}
        >
          <div
            className="candidateJobAlertModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* =====================================
                MODAL HEADER
            ===================================== */}

            <div className="candidateJobAlertModalHeader">
              <div>
                <span>
                  {editingAlert
                    ? "EDIT ALERT"
                    : "NEW ALERT"}
                </span>

                <h2>
                  {editingAlert
                    ? "Update job alert"
                    : "Create a job alert"}
                </h2>

                <p>
                  Tell us what kind of jobs
                  you want to keep track of.
                </p>
              </div>

              <button
                type="button"
                className="candidateJobAlertModalClose"
                onClick={closeModal}
                aria-label="Close"
                disabled={
                  isSavingAlert
                }
              >
                <X size={18} />
              </button>
            </div>

            {/* =====================================
                FORM
            ===================================== */}

            <form
              className="candidateJobAlertForm"
              onSubmit={
                handleSaveAlert
              }
            >
              {/* ALERT NAME */}

              <label>
                <span>
                  Alert name
                </span>

                <input
                  type="text"
                  name="title"
                  value={
                    alertForm.title
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="e.g. React Developer Jobs"
                  maxLength={80}
                  disabled={
                    isSavingAlert
                  }
                />
              </label>

              {/* KEYWORDS */}

              <label>
                <span>
                  Keywords / skills
                </span>

                <div className="candidateJobAlertInputWithIcon">
                  <Search size={15} />

                  <input
                    type="text"
                    name="keywords"
                    value={
                      alertForm.keywords
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="React, MERN, Node.js..."
                    disabled={
                      isSavingAlert
                    }
                  />
                </div>
              </label>

              {/* LOCATION */}

              <label>
                <span>
                  Location
                </span>

                <div className="candidateJobAlertInputWithIcon">
                  <MapPin size={15} />

                  <input
                    type="text"
                    name="location"
                    value={
                      alertForm.location
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Hyderabad, Bengaluru, Remote..."
                    disabled={
                      isSavingAlert
                    }
                  />
                </div>
              </label>

              {/* EMPLOYMENT + FREQUENCY */}

              <div className="candidateJobAlertFormGrid">
                <label>
                  <span>
                    Employment type
                  </span>

                  <div className="candidateJobAlertSelect">
                    <select
                      name="employmentType"
                      value={
                        alertForm.employmentType
                      }
                      onChange={
                        handleFormChange
                      }
                      disabled={
                        isSavingAlert
                      }
                    >
                      <option value="All">
                        All types
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

                    <ChevronDown
                      size={15}
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Alert frequency
                  </span>

                  <div className="candidateJobAlertSelect">
                    <select
                      name="frequency"
                      value={
                        alertForm.frequency
                      }
                      onChange={
                        handleFormChange
                      }
                      disabled={
                        isSavingAlert
                      }
                    >
                      <option value="Instant">
                        Instant
                      </option>

                      <option value="Daily">
                        Daily
                      </option>

                      <option value="Weekly">
                        Weekly
                      </option>
                    </select>

                    <ChevronDown
                      size={15}
                    />
                  </div>
                </label>
              </div>

              {/* ENABLED */}

              <label className="candidateJobAlertCheckbox">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={
                    alertForm.enabled
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={
                    isSavingAlert
                  }
                />

                <span>
                  Keep this alert active
                </span>
              </label>

              {/* ERROR */}

              {formError && (
                <div className="candidateJobAlertFormError">
                  {formError}
                </div>
              )}

              {/* =====================================
                  MODAL FOOTER
              ===================================== */}

              <div className="candidateJobAlertModalFooter">
                <button
                  type="button"
                  className="candidateJobAlertCancelButton"
                  onClick={
                    closeModal
                  }
                  disabled={
                    isSavingAlert
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="candidateJobAlertsCreateButton"
                  disabled={
                    isSavingAlert
                  }
                >
                  {isSavingAlert ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="jobAlertLoadingIcon"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={16}
                      />

                      {editingAlert
                        ? "Save Alert"
                        : "Create Alert"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default JobAlerts;