import { useEffect, useMemo, useState } from "react";

import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  MapPin,
  Building2,
  Eye,
  Trash2,
  LoaderCircle,
  CalendarDays,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../../services/api";
import jobHubAppIcon from "../../../assets/images/jobhub-app-icon.png";

import "./SavedJobs.css";

const SavedJobs = () => {
  const navigate = useNavigate();

  // =====================================
  // STATE
  // =====================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [candidate, setCandidate] = useState(() => {
    try {
      const storedCandidate = localStorage.getItem("jobhubCandidate");
      return storedCandidate ? JSON.parse(storedCandidate) : null;
    } catch (error) {
      console.error("Unable to load candidate:", error);
      return null;
    }
  });

  const [savedJobs, setSavedJobs] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [removingJobId, setRemovingJobId] = useState("");

  // =====================================
  // LOAD SAVED JOBS
  // =====================================

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setLoading(true);

        setError("");

        const token = localStorage.getItem(
          "jobhubCandidateToken"
        );

        if (!token) {
          setError(
            "You are not logged in. Please login again."
          );

          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/candidates/saved-jobs`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,

              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to fetch saved jobs."
          );
        }

        setSavedJobs(
          Array.isArray(data.savedJobs)
            ? data.savedJobs
            : []
        );
      } catch (error) {
        console.error(
          "Fetch saved jobs error:",
          error
        );

        setError(
          error.message ||
            "Unable to load saved jobs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  // =====================================
  // SEARCH
  // =====================================

  const filteredSavedJobs = useMemo(() => {
    const searchValue = searchTerm
      .trim()
      .toLowerCase();

    if (!searchValue) {
      return savedJobs;
    }

    return savedJobs.filter((savedJob) => {
      const job = savedJob.job || {};

      const jobTitle =
        job.title ||
        job.jobTitle ||
        "";

      const companyName =
        job.companyName ||
        job.company ||
        "";

      const location =
        job.location ||
        "";

      return (
        jobTitle
          .toLowerCase()
          .includes(searchValue) ||
        companyName
          .toLowerCase()
          .includes(searchValue) ||
        location
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [savedJobs, searchTerm]);

  // =====================================
  // INITIALS
  // =====================================

  const getInitials = (fullName) => {
    if (!fullName) {
      return "U";
    }

    return fullName
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name.charAt(0).toUpperCase()
      )
      .join("");
  };

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    const formattedDate = new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "Recently";
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================
  // NAVIGATION
  // =====================================

  const handleNavigation = (path) => {
    setSidebarOpen(false);

    navigate(path);
  };

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    localStorage.removeItem(
      "jobhubCandidateToken"
    );

    localStorage.removeItem(
      "jobhubCandidate"
    );

    setCandidate(null);

    navigate("/");
  };

  // =====================================
  // VIEW JOB
  // =====================================

  const handleViewJob = (savedJob) => {
    const job = savedJob.job;

    if (!job?._id) {
      return;
    }

    navigate(`/jobs/${job._id}`);
  };

  // =====================================
  // REMOVE SAVED JOB
  // =====================================

  const handleRemoveSavedJob = async (
    savedJob
  ) => {
    try {
      // IMPORTANT:
      // Use the SavedJob document ID,
      // not the populated Job ID.

      const savedJobId = savedJob?._id;

      if (!savedJobId) {
        console.error(
          "Saved job ID is missing:",
          savedJob
        );

        return;
      }

      const token = localStorage.getItem(
        "jobhubCandidateToken"
      );

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      setRemovingJobId(savedJobId);

      console.log(
        "Removing saved job:",
        savedJobId
      );

      const response = await fetch(
        `${API_BASE_URL}/api/candidates/saved-jobs/${savedJobId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "Remove saved job response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to remove saved job."
        );
      }

      // Remove the exact SavedJob record
      // from the UI.

      setSavedJobs((previousJobs) =>
        previousJobs.filter(
          (item) =>
            item._id !== savedJobId
        )
      );
    } catch (error) {
      console.error(
        "Remove saved job error:",
        error
      );

      alert(
        error.message ||
          "Unable to remove saved job."
      );
    } finally {
      setRemovingJobId("");
    }
  };

  return (
    <div className="savedJobsPage">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="dashboardOverlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`dashboardSidebar ${
          sidebarOpen
            ? "dashboardSidebarOpen"
            : ""
        }`}
      >
        <div className="dashboardLogo">
          <img
            src={jobHubAppIcon}
            alt="JobHub"
            className="dashboardLogoImage"
          />

          <span>JobHub</span>

          <button
            type="button"
            className="sidebarCloseButton"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <nav className="dashboardNavigation">

          <button
            type="button"
            className="dashboardNavItem"
            onClick={() =>
              handleNavigation("/")
            }
          >
            <LayoutDashboard size={16} />

            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="dashboardNavItem"
            onClick={() =>
              handleNavigation("/profile")
            }
          >
            <User size={16} />

            <span>My Profile</span>
          </button>

          <button
            type="button"
            className="dashboardNavItem"
            onClick={() =>
              handleNavigation(
                "/my-applications"
              )
            }
          >
            <FileText size={16} />

            <span>My Applications</span>
          </button>

          <button
            type="button"
            className="dashboardNavItem dashboardNavItemActive"
          >
            <Bookmark size={16} />

            <span>Saved Jobs</span>
          </button>

          <button
            type="button"
            className="dashboardNavItem"
            onClick={() =>
              handleNavigation(
                "/job-alerts"
              )
            }
          >
            <Bell size={16} />

            <span>Job Alerts</span>
          </button>

          <button
            type="button"
            className="dashboardNavItem"
            onClick={() =>
              handleNavigation(
                "/settings"
              )
            }
          >
            <Settings size={16} />

            <span>Settings</span>
          </button>

        </nav>

        <div className="dashboardSidebarBottom">

          <button
            type="button"
            className="dashboardLogoutButton"
            onClick={handleLogout}
          >
            <LogOut size={16} />

            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* MAIN AREA */}

      <div className="dashboardMainArea">

        <header className="dashboardTopHeader">

          <div className="dashboardHeaderLeft">

            <button
              type="button"
              className="mobileSidebarButton"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={22} />
            </button>

          </div>

          <div className="dashboardHeaderRight">

            <button
              type="button"
              className="headerNotificationButton"
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

                <span>Candidate</span>

              </div>

            </div>

          </div>

        </header>

        <main className="savedJobsContent">

          {/* PAGE HEADER */}

          <div className="savedJobsPageHeader">

            <div>

              <h1>Saved Jobs</h1>

              <p>
                Jobs you saved for later.
              </p>

            </div>

            <div className="savedJobsSearch">

              <Search size={16} />

              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

            </div>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="savedJobsLoading">

              <LoaderCircle size={32} />

              <p>
                Loading your saved jobs...
              </p>

            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="savedJobsError">

              <h3>
                Unable to load saved jobs
              </h3>

              <p>{error}</p>

            </div>
          )}

          {/* JOB LIST */}

          {!loading && !error && (
            <>
              {filteredSavedJobs.length > 0 ? (
                <div className="savedJobsGrid">

                  {filteredSavedJobs.map(
                    (savedJob) => {

                      const job =
                        savedJob.job || {};

                      const isRemoving =
                        removingJobId ===
                        savedJob._id;

                      return (
                        <article
                          className="savedJobCard"
                          key={savedJob._id}
                        >

                          {/* TOP */}

                          <div className="savedJobCardTop">

                            <div className="savedJobCompanyIcon">
                              <Building2 size={22} />
                            </div>

                            <button
                              type="button"
                              className="removeSavedJobButton"
                              onClick={() =>
                                handleRemoveSavedJob(
                                  savedJob
                                )
                              }
                              disabled={
                                isRemoving
                              }
                              title="Remove from saved jobs"
                            >
                              {isRemoving ? (
                                <LoaderCircle
                                  size={16}
                                />
                              ) : (
                                <Trash2
                                  size={16}
                                />
                              )}
                            </button>

                          </div>

                          {/* JOB INFO */}

                          <div className="savedJobInfo">

                            <h2>
                              {job.title ||
                                job.jobTitle ||
                                "Job Title"}
                            </h2>

                            <p className="savedJobCompany">
                              {job.companyName ||
                                job.company ||
                                "Company"}
                            </p>

                          </div>

                          {/* DETAILS */}

                          <div className="savedJobDetails">

                            <span>

                              <MapPin size={14} />

                              {job.location ||
                                "Location not specified"}

                            </span>

                            <span>

                              <CalendarDays
                                size={14}
                              />

                              Saved{" "}

                              {formatDate(
                                savedJob.createdAt
                              )}

                            </span>

                          </div>

                          {/* VIEW JOB */}

                          <button
                            type="button"
                            className="viewSavedJobButton"
                            onClick={() =>
                              handleViewJob(
                                savedJob
                              )
                            }
                          >
                            <Eye size={16} />

                            View Job
                          </button>

                        </article>
                      );
                    }
                  )}

                </div>
              ) : (

                /* EMPTY STATE */

                <div className="savedJobsEmpty">

                  <Bookmark size={42} />

                  <h3>
                    No saved jobs found
                  </h3>

                  <p>
                    {searchTerm
                      ? "Try changing your search."
                      : "Jobs you save will appear here."}
                  </p>

                  {!searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/")
                      }
                    >
                      Browse Jobs
                    </button>
                  )}

                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default SavedJobs;