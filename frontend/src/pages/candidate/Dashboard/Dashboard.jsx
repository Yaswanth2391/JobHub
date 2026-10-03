import {
  Bell,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Menu,
  Search,
  UserRound,
  X,
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
import jobHubAppIcon from "../../../assets/images/jobhub-app-icon.png";

import API_BASE_URL from "../../../services/api";

import heroImage from "../../../assets/images/hero.png";

import "./Dashboard.css";

/* =========================================================
   HELPERS
   ========================================================= */

const getInitials = (name) => {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");
};

const getFirstName = (name) => {
  if (!name) {
    return "there";
  }

  return name
    .trim()
    .split(/\s+/)[0] || "there";
};

const getJobTitle = (job) => {
  return (
    job?.jobTitle ||
    job?.title ||
    "Job"
  );
};

const getCompanyName = (job) => {
  return (
    job?.companyName ||
    job?.company ||
    "Company"
  );
};

const getCompanyLogo = (job) => {
  return (
    job?.companyLogo ||
    job?.logo ||
    ""
  );
};

const getLocation = (job) => {
  return (
    job?.location ||
    "Location not specified"
  );
};

const formatDate = (date) => {
  if (!date) {
    return "Recently";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Recently";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const getRelativeTime = (date) => {
  if (!date) {
    return "Recently";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Recently";
  }

  const difference =
    Date.now() -
    parsedDate.getTime();

  const minutes = Math.floor(
    difference /
      (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(
    days / 7
  );

  if (weeks < 5) {
    return `${weeks}w ago`;
  }

  return formatDate(date);
};

const normalizeStatus = (
  status
) => {
  switch (status) {
    case "Interview Scheduled":
    case "Shortlisted":
    case "Interview":
      return "Interview";

    case "Under Review":
    case "Reviewing":
    case "In Review":
      return "In Review";

    case "Hired":
    case "Selected":
      return "Hired";

    case "Rejected":
      return "Rejected";

    case "Applied":
    default:
      return "Applied";
  }
};

const getLogoUrl = (logo) => {
  if (!logo) {
    return "";
  }

  if (
    logo.startsWith("http://") ||
    logo.startsWith("https://") ||
    logo.startsWith("data:")
  ) {
    return logo;
  }

  return `${API_BASE_URL}${
    logo.startsWith("/")
      ? ""
      : "/"
  }${logo}`;
};

/* =========================================================
   COMPONENT
   ========================================================= */

function Dashboard() {
  const navigate =
    useNavigate();

  /* =======================================================
     STATE
     ======================================================= */

  const [candidate, setCandidate] =
    useState(() => {
      try {
        const storedCandidate = localStorage.getItem(
          "jobhubCandidate"
        );

        return storedCandidate
          ? JSON.parse(storedCandidate)
          : null;
      } catch (error) {
        console.error(
          "Unable to load candidate:",
          error
        );
        return null;
      }
    });

  const [jobs, setJobs] =
    useState([]);

  const [applications, setApplications] =
    useState([]);

  const [savedJobs, setSavedJobs] =
    useState([]);

  const [unreadAlerts, setUnreadAlerts] =
    useState(0);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [savingJobId, setSavingJobId] =
    useState("");

  /* =======================================================
     LOAD DASHBOARD DATA
     ======================================================= */

  useEffect(() => {
    const loadDashboardData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const token =
            localStorage.getItem(
              "jobhubCandidateToken"
            );

          if (!token) {
            navigate("/login");
            return;
          }

          const authenticatedHeaders =
            {
              Authorization: `Bearer ${token}`,
            };

          /* ===============================================
             PROFILE
          =============================================== */

          const profileResponse =
            await fetch(
              `${API_BASE_URL}/api/candidate/profile`,
              {
                method: "GET",
                headers:
                  authenticatedHeaders,
              }
            );

          if (
            profileResponse.ok
          ) {
            const profileData =
              await profileResponse.json();

            if (
              profileData.candidate
            ) {
              setCandidate(
                profileData.candidate
              );

              localStorage.setItem(
                "jobhubCandidate",
                JSON.stringify(
                  profileData.candidate
                )
              );
            }
          }

          /* ===============================================
             PARALLEL DATA
          =============================================== */

          const [
            jobsResponse,
            applicationsResponse,
            savedJobsResponse,
            alertsResponse,
          ] = await Promise.all([
            fetch(
              `${API_BASE_URL}/api/jobs`,
              {
                method: "GET",
              }
            ),

            fetch(
              `${API_BASE_URL}/api/candidates/applications/my-applications`,
              {
                method: "GET",
                headers:
                  authenticatedHeaders,
              }
            ),

            fetch(
              `${API_BASE_URL}/api/candidates/saved-jobs`,
              {
                method: "GET",
                headers:
                  authenticatedHeaders,
              }
            ),

            fetch(
              `${API_BASE_URL}/api/candidates/job-alerts`,
              {
                method: "GET",
                headers:
                  authenticatedHeaders,
              }
            ),
          ]);

          /* ===============================================
             JOBS
          =============================================== */

          if (
            jobsResponse.ok
          ) {
            const jobsData =
              await jobsResponse.json();

            setJobs(
              Array.isArray(
                jobsData.jobs
              )
                ? jobsData.jobs
                : []
            );
          }

          /* ===============================================
             APPLICATIONS
          =============================================== */

          if (
            applicationsResponse.ok
          ) {
            const applicationsData =
              await applicationsResponse.json();

            setApplications(
              Array.isArray(
                applicationsData.applications
              )
                ? applicationsData.applications
                : []
            );
          }

          /* ===============================================
             SAVED JOBS
          =============================================== */

          if (
            savedJobsResponse.ok
          ) {
            const savedJobsData =
              await savedJobsResponse.json();

            setSavedJobs(
              Array.isArray(
                savedJobsData.savedJobs
              )
                ? savedJobsData.savedJobs
                : []
            );
          }

          /* ===============================================
             JOB ALERTS
          =============================================== */

          if (
            alertsResponse.ok
          ) {
            const alertsData =
              await alertsResponse.json();

            const alertList =
              Array.isArray(
                alertsData.alerts
              )
                ? alertsData.alerts
                : [];

            const unreadCount =
              alertList.reduce(
                (
                  total,
                  alert
                ) => {
                  const matches =
                    Array.isArray(
                      alert?.matches
                    )
                      ? alert.matches
                      : [];

                  return (
                    total +
                    matches.filter(
                      (match) =>
                        !match?.viewedAt
                    ).length
                  );
                },
                0
              );

            setUnreadAlerts(
              unreadCount
            );
          }
        } catch (error) {
          console.error(
            "Dashboard load error:",
            error
          );

          setError(
            error.message ||
              "Unable to load dashboard."
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboardData();
  }, [navigate]);

  /* =======================================================
     CANDIDATE INFORMATION
     ======================================================= */

  const candidateName =
    candidate?.fullName ||
    "Candidate";

  const candidateInitials =
    getInitials(
      candidateName
    );

  /* =======================================================
     SAVED JOB IDS
     ======================================================= */

  const savedJobIds =
    useMemo(() => {
      return new Set(
        savedJobs
          .map(
            (savedJob) =>
              savedJob?.job?._id
          )
          .filter(Boolean)
          .map(String)
      );
    }, [savedJobs]);

  /* =======================================================
     APPLIED JOB IDS
     ======================================================= */

  const appliedJobIds =
    useMemo(() => {
      return new Set(
        applications
          .map(
            (application) =>
              application?.jobId
          )
          .filter(Boolean)
          .map(String)
      );
    }, [applications]);

  /* =======================================================
     RECOMMENDED JOBS
     ======================================================= */

  const recommendedJobs =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      const candidateSkills =
        Array.isArray(
          candidate?.skills
        )
          ? candidate.skills
              .map((skill) =>
                String(skill)
                  .trim()
                  .toLowerCase()
              )
              .filter(Boolean)
          : [];

      const availableJobs =
        jobs.filter(
          (job) =>
            !appliedJobIds.has(
              String(job._id)
            )
        );

      const scoredJobs =
        availableJobs.map(
          (job) => {
            const jobSkills =
              Array.isArray(
                job?.skills
              )
                ? job.skills
                    .map((skill) =>
                      String(skill)
                        .trim()
                        .toLowerCase()
                    )
                    .filter(
                      Boolean
                    )
                : [];

            const searchableText =
              [
                job?.jobTitle,
                job?.department,
                job?.description,
                job?.location,
                job?.jobType,
                job?.experience,
                getCompanyName(
                  job
                ),
                ...jobSkills,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            let score = 0;

            candidateSkills.forEach(
              (skill) => {
                if (
                  searchableText.includes(
                    skill
                  )
                ) {
                  score += 3;
                }
              }
            );

            if (search) {
              if (
                searchableText.includes(
                  search
                )
              ) {
                score += 15;
              } else {
                score -= 20;
              }
            }

            return {
              ...job,
              recommendationScore:
                score,
            };
          }
        );

      scoredJobs.sort(
        (a, b) => {
          if (
            b.recommendationScore !==
            a.recommendationScore
          ) {
            return (
              b.recommendationScore -
              a.recommendationScore
            );
          }

          return (
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
          );
        }
      );

      return scoredJobs.slice(
        0,
        search ? 6 : 3
      );
    }, [
      jobs,
      candidate,
      searchTerm,
      appliedJobIds,
    ]);

  /* =======================================================
     RECENT APPLICATIONS
     ======================================================= */

  const recentApplications =
    useMemo(() => {
      return [
        ...applications,
      ]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
        )
        .slice(0, 4);
    }, [applications]);

  /* =======================================================
     UPCOMING INTERVIEWS
     ======================================================= */

  const upcomingInterviews =
    useMemo(() => {
      return applications
        .filter(
          (application) =>
            application?.interview
              ?.scheduled &&
            application?.interview
              ?.date
        )
        .sort(
          (a, b) =>
            new Date(
              a.interview.date
            ).getTime() -
            new Date(
              b.interview.date
            ).getTime()
        )
        .slice(0, 3);
    }, [applications]);

  /* =======================================================
     STATUS COUNTS
     ======================================================= */

  const statusCounts =
    useMemo(() => {
      const counts = {
        Applied: 0,
        "In Review": 0,
        Interview: 0,
        Hired: 0,
        Rejected: 0,
      };

      applications.forEach(
        (application) => {
          const status =
            normalizeStatus(
              application.status
            );

          if (
            Object.prototype.hasOwnProperty.call(
              counts,
              status
            )
          ) {
            counts[status] += 1;
          }
        }
      );

      return counts;
    }, [applications]);

  const applicationTotal =
    applications.length;

  /* =======================================================
     DONUT CHART
     ======================================================= */

  const donutGradient =
    useMemo(() => {
      const segments = [
        {
          value:
            statusCounts.Applied,
          color: "#315bd0",
        },
        {
          value:
            statusCounts[
              "In Review"
            ],
          color: "#f0ad4e",
        },
        {
          value:
            statusCounts.Interview,
          color: "#7556d8",
        },
        {
          value:
            statusCounts.Hired,
          color: "#27a866",
        },
        {
          value:
            statusCounts.Rejected,
          color: "#df5b72",
        },
      ];

      const total =
        segments.reduce(
          (sum, item) =>
            sum + item.value,
          0
        );

      if (!total) {
        return "conic-gradient(#e7ebf2 0deg 360deg)";
      }

      let current = 0;

      const parts =
        segments.map(
          (segment) => {
            const start =
              current;

            const size =
              (segment.value /
                total) *
              360;

            current += size;

            return `${segment.color} ${start}deg ${current}deg`;
          }
        );

      return `conic-gradient(${parts.join(
        ", "
      )})`;
    }, [statusCounts]);

  /* =======================================================
     STATS
     ======================================================= */

  const stats = [
    {
      label:
        "Jobs Applied",
      value:
        applications.length,
      icon:
        BriefcaseBusiness,
      className:
        "candidateDashboardStatBlue",
    },
    {
      label:
        "Saved Jobs",
      value:
        savedJobs.length,
      icon:
        Bookmark,
      className:
        "candidateDashboardStatPurple",
    },
    {
      label:
        "Interviews Scheduled",
      value:
        upcomingInterviews.length,
      icon:
        CalendarDays,
      className:
        "candidateDashboardStatOrange",
    },
    {
      label:
        "Offers Received",
      value:
        statusCounts.Hired,
      icon:
        CheckCircle2,
      className:
        "candidateDashboardStatGreen",
    },
  ];

  /* =======================================================
     SAVE / UNSAVE JOB
     ======================================================= */

  const handleToggleSave =
    async (job) => {
      const token =
        localStorage.getItem(
          "jobhubCandidateToken"
        );

      if (
        !token ||
        !job?._id
      ) {
        return;
      }

      const jobId =
        String(job._id);

      try {
        setSavingJobId(
          jobId
        );

        if (
          savedJobIds.has(
            jobId
          )
        ) {
          const response =
            await fetch(
              `${API_BASE_URL}/api/candidates/saved-jobs/${jobId}`,
              {
                method:
                  "DELETE",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data.message ||
                "Unable to remove saved job."
            );
          }

          setSavedJobs(
            (previous) =>
              previous.filter(
                (savedJob) =>
                  String(
                    savedJob
                      ?.job
                      ?._id
                  ) !==
                  jobId
              )
          );
        } else {
          const response =
            await fetch(
              `${API_BASE_URL}/api/candidates/saved-jobs`,
              {
                method:
                  "POST",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  "Content-Type":
                    "application/json",
                },
                body:
                  JSON.stringify({
                    jobId,
                  }),
              }
            );

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data.message ||
                "Unable to save job."
            );
          }

          setSavedJobs(
            (previous) => [
              {
                ...data.savedJob,
                job,
              },
              ...previous,
            ]
          );
        }
      } catch (error) {
        console.error(
          "Save job error:",
          error
        );

        setError(
          error.message ||
            "Unable to update saved job."
        );
      } finally {
        setSavingJobId("");
      }
    };

  /* =======================================================
     NAVIGATION
     ======================================================= */

  const goTo =
    (path) => {
      setSidebarOpen(false);
      navigate(path);
    };

  const openJob =
    (jobId) => {
      if (!jobId) {
        return;
      }

      navigate(
        `/jobs/${jobId}`
      );
    };

  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout =
    () => {
      localStorage.removeItem(
        "jobhubCandidateToken"
      );

      localStorage.removeItem(
        "jobhubCandidate"
      );

      navigate("/");
    };

  /* =======================================================
     MOBILE MENU
     ======================================================= */

  const mobileMenuItems = [
    {
      label:
        "Dashboard",
      icon:
        BriefcaseBusiness,
      path:
        "/dashboard",
    },
    {
      label:
        "My Profile",
      icon:
        UserRound,
      path:
        "/profile",
    },
    {
      label:
        "My Applications",
      icon:
        FileText,
      path:
        "/my-applications",
    },
    {
      label:
        "Saved Jobs",
      icon:
        Bookmark,
      path:
        "/saved-jobs",
    },
    {
      label:
        "Job Alerts",
      icon:
        Bell,
      path:
        "/job-alerts",
    },
    {
      label:
        "Settings",
      icon:
        FileText,
      path:
        "/settings",
    },
  ];

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="candidateDashboardPage">
        <CandidateSidebar />

        <section className="candidateDashboardMain">
          <header className="candidateDashboardTopbar">
            <div className="candidateDashboardMobileBrand">
              <button
                type="button"
                className="candidateDashboardMobileMenuButton"
                onClick={() =>
                  setSidebarOpen(
                    true
                  )
                }
              >
                <Menu size={19} />
              </button>

              <img
                src={jobHubAppIcon}
                alt="JobHub"
                className="candidateDashboardMobileBrandLogo"
              />
            </div>

            <div className="candidateDashboardTopbarRight">
              <button
                type="button"
                className="candidateDashboardNotificationButton"
                onClick={() =>
                  navigate(
                    "/job-alerts"
                  )
                }
              >
                <Bell size={18} />
              </button>

              <div className="candidateDashboardTopbarCandidate">
                <div className="candidateDashboardAvatar">
                  {candidateInitials}
                </div>

                <div className="candidateDashboardCandidateInfo">
                  <strong>
                    {candidateName}
                  </strong>

                  <span>
                    Candidate
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="candidateDashboardLoading">
            <div className="candidateDashboardLoadingSpinner" />

            <h2>
              Loading your dashboard...
            </h2>

            <p>
              Getting your applications,
              saved jobs and opportunities ready.
            </p>
          </div>
        </section>
      </div>
    );
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="candidateDashboardPage">

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {sidebarOpen && (
        <div
          className="candidateDashboardOverlay"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
        />
      )}

      {/* ===================================================
          MOBILE DRAWER
      =================================================== */}

      <aside
        className={`candidateDashboardMobileDrawer ${
          sidebarOpen
            ? "candidateDashboardMobileDrawerOpen"
            : ""
        }`}
      >
        <div className="candidateDashboardMobileDrawerHeader">
          <img
            src={jobHubAppIcon}
            alt="JobHub"
            className="candidateDashboardMobileDrawerLogo"
          />

          <button
            type="button"
            className="candidateDashboardMobileClose"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
          >
            <X size={18} />
          </button>
        </div>

        <div className="candidateDashboardMobileCandidate">
          <div className="candidateDashboardMobileCandidateAvatar">
            {candidateInitials}
          </div>

          <div>
            <strong>
              {candidateName}
            </strong>

            <span>
              Candidate
            </span>
          </div>
        </div>

        <nav className="candidateDashboardMobileNavigation">
          {mobileMenuItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  type="button"
                  key={
                    item.label
                  }
                  onClick={() =>
                    goTo(
                      item.path
                    )
                  }
                >
                  <Icon size={17} />

                  <span>
                    {item.label}
                  </span>
                </button>
              );
            }
          )}
        </nav>

        <button
          type="button"
          className="candidateDashboardMobileLogout"
          onClick={
            handleLogout
          }
        >
          <X size={17} />

          <span>
            Logout
          </span>
        </button>
      </aside>

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <CandidateSidebar />

      {/* ===================================================
          MAIN
      =================================================== */}

      <section className="candidateDashboardMain">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="candidateDashboardTopbar">

          <div className="candidateDashboardTopbarLeft">

            <button
              type="button"
              className="candidateDashboardMobileMenuButton"
              onClick={() =>
                setSidebarOpen(
                  true
                )
              }
            >
              <Menu size={19} />
            </button>

            <div className="candidateDashboardSearch">
              <Search size={16} />

              <input
                type="text"
                value={searchTerm}
                onChange={(
                  event
                ) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search jobs, companies, skills..."
              />

              {searchTerm && (
                <button
                  type="button"
                  className="candidateDashboardSearchClear"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="candidateDashboardTopbarRight">

            <button
              type="button"
              className="candidateDashboardNotificationButton"
              onClick={() =>
                navigate(
                  "/job-alerts"
                )
              }
            >
              <Bell size={18} />

              {unreadAlerts >
                0 && (
                <span className="candidateDashboardNotificationBadge">
                  {unreadAlerts >
                  9
                    ? "9+"
                    : unreadAlerts}
                </span>
              )}
            </button>

            <button
              type="button"
              className="candidateDashboardTopbarCandidate"
              onClick={() =>
                navigate(
                  "/profile"
                )
              }
            >
              <div className="candidateDashboardAvatar">
                {candidateInitials}
              </div>

              <div className="candidateDashboardCandidateInfo">
                <strong>
                  {candidateName}
                </strong>

                <span>
                  Candidate
                </span>
              </div>
            </button>

          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="candidateDashboardContent">

          {error && (
            <div className="candidateDashboardError">
              {error}
            </div>
          )}

          {/* ===============================================
              HERO
          =============================================== */}

          <section className="candidateDashboardHero">

            <div className="candidateDashboardHeroText">

              <span className="candidateDashboardHeroEyebrow">
                JOBHUB CANDIDATE DASHBOARD
              </span>

              <h1>
                Hello{" "}
                {getFirstName(
                  candidateName
                )}
                !
              </h1>

              <p>
                Great things happen to
                people who keep searching.
                Explore new opportunities
                and keep moving toward your
                next career goal.
              </p>

              <button
                type="button"
                className="candidateDashboardPrimaryButton"
                onClick={() => {
                  document
                    .querySelector(
                      ".candidateDashboardRecommended"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }}
              >
                Explore Jobs

                <ChevronRight
                  size={16}
                />
              </button>

            </div>

            <div className="candidateDashboardHeroVisual">

              <div className="candidateDashboardHeroCircle candidateDashboardHeroCircleOne" />

              <div className="candidateDashboardHeroCircle candidateDashboardHeroCircleTwo" />

              <img
                src={heroImage}
                alt="Candidate"
                className="candidateDashboardHeroImage"
              />

              <div className="candidateDashboardHeroMessage">
                <span>
                  Your next
                </span>

                <strong>
                  opportunity
                  <br />
                  awaits.
                </strong>
              </div>

            </div>

          </section>

          {/* ===============================================
              STATS
          =============================================== */}

          <section className="candidateDashboardStats">

            {stats.map(
              (stat) => {
                const Icon =
                  stat.icon;

                return (
                  <article
                    className="candidateDashboardStatCard"
                    key={
                      stat.label
                    }
                  >
                    <div
                      className={`candidateDashboardStatIcon ${stat.className}`}
                    >
                      <Icon
                        size={19}
                      />
                    </div>

                    <div className="candidateDashboardStatInfo">
                      <strong>
                        {stat.value}
                      </strong>

                      <span>
                        {stat.label}
                      </span>
                    </div>
                  </article>
                );
              }
            )}

          </section>

          {/* ===============================================
              RECOMMENDED + STATUS
          =============================================== */}

          <section className="candidateDashboardMainGrid">

            {/* =============================================
                RECOMMENDED JOBS
            ============================================= */}

            <article
              className="candidateDashboardCard candidateDashboardRecommended"
            >

              <div className="candidateDashboardCardHeader">

                <div>
                  <span>
                    OPPORTUNITIES
                  </span>

                  <h2>
                    Recommended Jobs
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .querySelector(
                        ".candidateDashboardRecommended"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      })
                  }
                >
                  View All

                  <ChevronRight
                    size={14}
                  />
                </button>

              </div>

              {recommendedJobs.length ===
              0 ? (
                <div className="candidateDashboardEmptyState">
                  <BriefcaseBusiness
                    size={25}
                  />

                  <strong>
                    No jobs available yet
                  </strong>

                  <span>
                    Published company jobs will
                    appear here automatically.
                  </span>
                </div>
              ) : (
                <div className="candidateDashboardJobsList">

                  {recommendedJobs.map(
                    (job) => {
                      const jobId =
                        String(
                          job._id
                        );

                      const saved =
                        savedJobIds.has(
                          jobId
                        );

                      const logo =
                        getCompanyLogo(
                          job
                        );

                      const logoUrl =
                        getLogoUrl(
                          logo
                        );

                      return (
                        <div
                          className="candidateDashboardJob"
                          key={
                            jobId
                          }
                        >

                          <button
                            type="button"
                            className="candidateDashboardCompanyLogo"
                            onClick={() =>
                              openJob(
                                job._id
                              )
                            }
                          >
                            {logoUrl ? (
                              <img
                                src={
                                  logoUrl
                                }
                                alt=""
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <span>
                                {getInitials(
                                  getCompanyName(
                                    job
                                  )
                                )}
                              </span>
                            )}
                          </button>

                          <div className="candidateDashboardJobContent">

                            <button
                              type="button"
                              className="candidateDashboardJobTitle"
                              onClick={() =>
                                openJob(
                                  job._id
                                )
                              }
                            >
                              {getJobTitle(
                                job
                              )}
                            </button>

                            <span className="candidateDashboardCompanyName">
                              {getCompanyName(
                                job
                              )}
                            </span>

                            <div className="candidateDashboardJobMeta">

                              <span>
                                <MapPin
                                  size={
                                    12
                                  }
                                />

                                {getLocation(
                                  job
                                )}
                              </span>

                              <span>
                                {job.jobType ||
                                  "Job"}
                              </span>

                            </div>

                            {Array.isArray(
                              job.skills
                            ) &&
                              job.skills.length >
                                0 && (
                                <div className="candidateDashboardTags">
                                  {job.skills
                                    .slice(
                                      0,
                                      3
                                    )
                                    .map(
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
                                        </span>
                                      )
                                    )}
                                </div>
                              )}

                          </div>

                          <div className="candidateDashboardJobActions">

                            <span>
                              {getRelativeTime(
                                job.createdAt
                              )}
                            </span>

                            <button
                              type="button"
                              className={`candidateDashboardSaveButton ${
                                saved
                                  ? "candidateDashboardSaveActive"
                                  : ""
                              }`}
                              onClick={() =>
                                handleToggleSave(
                                  job
                                )
                              }
                              disabled={
                                savingJobId ===
                                jobId
                              }
                            >
                              {saved ? (
                                <BookmarkCheck
                                  size={
                                    17
                                  }
                                />
                              ) : (
                                <Bookmark
                                  size={
                                    17
                                  }
                                />
                              )}
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </article>

            {/* =============================================
                APPLICATION STATUS
            ============================================= */}

            <article className="candidateDashboardCard candidateDashboardStatus">

              <div className="candidateDashboardCardHeader">

                <div>
                  <span>
                    APPLICATIONS
                  </span>

                  <h2>
                    Application Status
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/my-applications"
                    )
                  }
                >
                  View All

                  <ChevronRight
                    size={14}
                  />
                </button>

              </div>

              <div className="candidateDashboardStatusBody">

                <div
                  className="candidateDashboardDonut"
                  style={{
                    background:
                      donutGradient,
                  }}
                >
                  <div className="candidateDashboardDonutCenter">
                    <strong>
                      {
                        applicationTotal
                      }
                    </strong>

                    <span>
                      Applications
                    </span>
                  </div>
                </div>

                <div className="candidateDashboardLegend">

                  <div>
                    <span className="candidateDashboardDot candidateDashboardDotApplied" />

                    <span>
                      Applied
                    </span>

                    <strong>
                      {
                        statusCounts.Applied
                      }
                    </strong>
                  </div>

                  <div>
                    <span className="candidateDashboardDot candidateDashboardDotReview" />

                    <span>
                      In Review
                    </span>

                    <strong>
                      {
                        statusCounts[
                          "In Review"
                        ]
                      }
                    </strong>
                  </div>

                  <div>
                    <span className="candidateDashboardDot candidateDashboardDotInterview" />

                    <span>
                      Interview
                    </span>

                    <strong>
                      {
                        statusCounts.Interview
                      }
                    </strong>
                  </div>

                  <div>
                    <span className="candidateDashboardDot candidateDashboardDotHired" />

                    <span>
                      Hired
                    </span>

                    <strong>
                      {
                        statusCounts.Hired
                      }
                    </strong>
                  </div>

                  <div>
                    <span className="candidateDashboardDot candidateDashboardDotRejected" />

                    <span>
                      Rejected
                    </span>

                    <strong>
                      {
                        statusCounts.Rejected
                      }
                    </strong>
                  </div>

                </div>

              </div>

            </article>

          </section>

          {/* ===============================================
              UPCOMING INTERVIEWS
          =============================================== */}

          <section className="candidateDashboardCard candidateDashboardInterviews">

            <div className="candidateDashboardCardHeader">

              <div>
                <span>
                  NEXT STEPS
                </span>

                <h2>
                  Upcoming Interviews
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/my-applications"
                  )
                }
              >
                View All

                <ChevronRight
                  size={14}
                />
              </button>

            </div>

            {upcomingInterviews.length ===
            0 ? (
              <div className="candidateDashboardEmptyInterview">
                <div>
                  <CalendarDays
                    size={19}
                  />
                </div>

                <section>
                  <strong>
                    No upcoming interviews
                  </strong>

                  <span>
                    Your scheduled interviews will
                    appear here.
                  </span>
                </section>
              </div>
            ) : (
              <div className="candidateDashboardInterviewList">

                {upcomingInterviews.map(
                  (application) => (
                    <button
                      type="button"
                      className="candidateDashboardInterview"
                      key={
                        application._id
                      }
                      onClick={() =>
                        openJob(
                          application.jobId
                        )
                      }
                    >
                      <div className="candidateDashboardInterviewIcon">
                        <CalendarDays
                          size={18}
                        />
                      </div>

                      <div className="candidateDashboardInterviewInfo">
                        <strong>
                          {
                            application.jobTitle
                          }
                        </strong>

                        <span>
                          {
                            application.companyName
                          }
                        </span>

                        <small>
                          <Clock3
                            size={
                              12
                            }
                          />

                          {formatDate(
                            application
                              ?.interview
                              ?.date
                          )}

                          {application
                            ?.interview
                            ?.time
                            ? ` | ${application.interview.time}`
                            : ""}
                        </small>
                      </div>

                      <ChevronRight
                        size={17}
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </section>

          {/* ===============================================
              RECENT + SAVED
          =============================================== */}

          <section className="candidateDashboardLowerGrid">

            {/* =============================================
                RECENT APPLICATIONS
            ============================================= */}

            <article className="candidateDashboardCard candidateDashboardRecent">

              <div className="candidateDashboardCardHeader">

                <div>
                  <span>
                    RECENT ACTIVITY
                  </span>

                  <h2>
                    Recent Applications
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/my-applications"
                    )
                  }
                >
                  View All

                  <ChevronRight
                    size={14}
                  />
                </button>

              </div>

              {recentApplications.length ===
              0 ? (
                <div className="candidateDashboardEmptyState">
                  <FileText
                    size={24}
                  />

                  <strong>
                    No applications yet
                  </strong>

                  <span>
                    Apply for a job to start tracking
                    your application here.
                  </span>
                </div>
              ) : (
                <div className="candidateDashboardRecentList">

                  {recentApplications.map(
                    (application) => {
                      const status =
                        normalizeStatus(
                          application.status
                        );

                      return (
                        <div
                          className="candidateDashboardApplication"
                          key={
                            application._id
                          }
                        >

                          <div className="candidateDashboardApplicationLogo">
                            {application.companyLogo ? (
                              <img
                                src={getLogoUrl(
                                  application.companyLogo
                                )}
                                alt=""
                              />
                            ) : (
                              <span>
                                {getInitials(
                                  application.companyName
                                )}
                              </span>
                            )}
                          </div>

                          <div className="candidateDashboardApplicationDetails">
                            <strong>
                              {
                                application.jobTitle
                              }
                            </strong>

                            <span>
                              {
                                application.companyName
                              }
                            </span>

                            <small>
                              {
                                application.location ||
                                "Location unavailable"
                              }
                            </small>
                          </div>

                          <div className="candidateDashboardApplicationRight">

                            <span
                              className={`candidateDashboardStatusPill candidateDashboardStatus${status.replace(
                                /\s/g,
                                ""
                              )}`}
                            >
                              {
                                status
                              }
                            </span>

                            <small>
                              {formatDate(
                                application.createdAt
                              )}
                            </small>

                          </div>

                          <button
                            type="button"
                            className="candidateDashboardApplicationArrow"
                            onClick={() =>
                              openJob(
                                application.jobId
                              )
                            }
                          >
                            <ChevronRight
                              size={
                                16
                              }
                            />
                          </button>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </article>

            {/* =============================================
                SAVED JOBS
            ============================================= */}

            <article className="candidateDashboardCard candidateDashboardSaved">

              <div className="candidateDashboardCardHeader">

                <div>
                  <span>
                    SAVED FOR LATER
                  </span>

                  <h2>
                    Saved Jobs
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/saved-jobs"
                    )
                  }
                >
                  View All

                  <ChevronRight
                    size={14}
                  />
                </button>

              </div>

              {savedJobs.length ===
              0 ? (
                <div className="candidateDashboardEmptyState">
                  <Bookmark
                    size={24}
                  />

                  <strong>
                    No saved jobs
                  </strong>

                  <span>
                    Save interesting jobs to access
                    them quickly later.
                  </span>
                </div>
              ) : (
                <div className="candidateDashboardSavedList">

                  {savedJobs
                    .slice(
                      0,
                      3
                    )
                    .map(
                      (savedJob) => {
                        const job =
                          savedJob?.job;

                        if (!job) {
                          return null;
                        }

                        const logo =
                          getCompanyLogo(
                            job
                          );

                        return (
                          <div
                            className="candidateDashboardSavedItem"
                            key={
                              savedJob._id
                            }
                          >

                            <button
                              type="button"
                              className="candidateDashboardSavedLogo"
                              onClick={() =>
                                openJob(
                                  job._id
                                )
                              }
                            >
                              {logo ? (
                                <img
                                  src={getLogoUrl(
                                    logo
                                  )}
                                  alt=""
                                />
                              ) : (
                                <span>
                                  {getInitials(
                                    getCompanyName(
                                      job
                                    )
                                  )}
                                </span>
                              )}
                            </button>

                            <button
                              type="button"
                              className="candidateDashboardSavedContent"
                              onClick={() =>
                                openJob(
                                  job._id
                                )
                              }
                            >
                              <strong>
                                {getJobTitle(
                                  job
                                )}
                              </strong>

                              <span>
                                {getCompanyName(
                                  job
                                )}
                              </span>

                              <small>
                                <MapPin
                                  size={
                                    11
                                  }
                                />

                                {getLocation(
                                  job
                                )}
                              </small>
                            </button>

                            <button
                              type="button"
                              className="candidateDashboardSavedRemove"
                              onClick={() =>
                                handleToggleSave(
                                  job
                                )
                              }
                            >
                              <BookmarkCheck
                                size={
                                  17
                                }
                              />
                            </button>

                          </div>
                        );
                      }
                    )}

                </div>
              )}

            </article>

          </section>

          {/* ===============================================
              BOTTOM CTA
          =============================================== */}

          <section className="candidateDashboardCTA">

            <div className="candidateDashboardCTAContent">

              <span>
                KEEP GOING
              </span>

              <h2>
                Your next opportunity
                is waiting.
              </h2>

              <p>
                New jobs are posted regularly.
                Keep exploring, keep applying and
                stay ready for the right opportunity.
              </p>

              <div className="candidateDashboardCTAActions">

                <button
                  type="button"
                  onClick={() =>
                    document
                      .querySelector(
                        ".candidateDashboardRecommended"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      })
                  }
                >
                  Browse More Jobs

                  <ChevronRight
                    size={15}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/profile"
                    )
                  }
                >
                  Update Profile
                </button>

              </div>

            </div>

            <div className="candidateDashboardCTAImage">
              <img
                src={heroImage}
                alt="Candidate"
              />
            </div>

          </section>

        </main>

      </section>
    </div>
  );
}

export default Dashboard;