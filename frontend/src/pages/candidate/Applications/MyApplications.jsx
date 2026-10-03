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
  SlidersHorizontal,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  MapPin,
  CalendarDays,
  Eye,
  LoaderCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../../services/api";
import jobHubAppIcon from "../../../assets/images/jobhub-app-icon.png";

import "./MyApplications.css";

const MyApplications = () => {
  const navigate = useNavigate();

  // =====================================
  // STATE
  // =====================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState("All");

  const [filterOpen, setFilterOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");

  const [candidate, setCandidate] = useState(() => {
    try {
      const storedCandidate = localStorage.getItem("jobhubCandidate");
      return storedCandidate ? JSON.parse(storedCandidate) : null;
    } catch (error) {
      console.error("Unable to load candidate:", error);
      return null;
    }
  });

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================
  // LOAD MY APPLICATIONS
  // =====================================

  useEffect(() => {
    const fetchApplications = async () => {
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
          `${API_BASE_URL}/api/candidates/applications/my-applications`,
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
              "Unable to fetch applications."
          );
        }

        setApplications(
          data.applications || []
        );
      } catch (error) {
        console.error(
          "Fetch applications error:",
          error
        );

        setError(
          error.message ||
            "Unable to load applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // =====================================
  // NORMALIZE STATUS
  // =====================================

  const getDisplayStatus = (status) => {
    if (status === "Under Review") {
      return "Interview";
    }

    if (status === "Shortlisted") {
      return "Interview";
    }

    if (status === "Selected") {
      return "Hired";
    }

    return status || "Applied";
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
  // TAB COUNTS
  // =====================================

  const tabCounts = useMemo(() => {
    return {
      All: applications.length,

      Applied: applications.filter(
        (application) =>
          getDisplayStatus(
            application.status
          ) === "Applied"
      ).length,

      Interview: applications.filter(
        (application) =>
          getDisplayStatus(
            application.status
          ) === "Interview"
      ).length,

      Hired: applications.filter(
        (application) =>
          getDisplayStatus(
            application.status
          ) === "Hired"
      ).length,

      Rejected: applications.filter(
        (application) =>
          getDisplayStatus(
            application.status
          ) === "Rejected"
      ).length,
    };
  }, [applications]);

  // =====================================
  // FILTER APPLICATIONS
  // =====================================

  const filteredApplications = useMemo(() => {
    return applications.filter(
      (application) => {
        const searchValue = searchTerm
          .trim()
          .toLowerCase();

        const jobTitle =
          application.jobTitle || "";

        const companyName =
          application.companyName || "";

        const matchesSearch =
          jobTitle
            .toLowerCase()
            .includes(searchValue) ||
          companyName
            .toLowerCase()
            .includes(searchValue);

        const displayStatus =
          getDisplayStatus(
            application.status
          );

        const matchesTab =
          activeTab === "All"
            ? true
            : displayStatus === activeTab;

        const matchesFilter =
          statusFilter === "All"
            ? true
            : displayStatus === statusFilter;

        return (
          matchesSearch &&
          matchesTab &&
          matchesFilter
        );
      }
    );
  }, [
    applications,
    searchTerm,
    activeTab,
    statusFilter,
  ]);

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

  const handleViewJob = (application) => {
    if (!application.jobId) {
      return;
    }

    navigate(
      `/jobs/${application.jobId}`
    );
  };

  const tabs = [
    "All",
    "Applied",
    "Interview",
    "Hired",
    "Rejected",
  ];

  return (
    <div className="myApplicationsPage">

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
        {/* LOGO */}

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

        {/* NAVIGATION */}

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
            className="dashboardNavItem dashboardNavItemActive"
          >
            <FileText size={16} />

            <span>My Applications</span>
          </button>

          <button
            type="button"
            className="dashboardNavItem"
            onClick={() =>
              handleNavigation(
                "/saved-jobs"
              )
            }
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

        {/* LOGOUT */}

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

        {/* HEADER */}

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

        {/* CONTENT */}

        <main className="applicationsContent">

          {/* PAGE HEADER */}

          <div className="applicationsPageHeader">

            <h1>My Applications</h1>

            <div className="applicationsHeaderActions">

              {/* SEARCH */}

              <div className="applicationsSearch">
                <Search size={15} />

                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />
              </div>

              {/* FILTER */}

              <div className="applicationsFilterWrapper">

                <button
                  type="button"
                  className="applicationsFilterButton"
                  onClick={() =>
                    setFilterOpen(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  <SlidersHorizontal size={15} />

                  <span>Filter</span>
                </button>

                {filterOpen && (
                  <div className="applicationsFilterMenu">

                    <p>
                      Filter by Status
                    </p>

                    {[
                      "All",
                      "Applied",
                      "Interview",
                      "Hired",
                      "Rejected",
                    ].map(
                      (status) => (
                        <button
                          type="button"
                          key={status}
                          className={
                            statusFilter ===
                            status
                              ? "filterStatusActive"
                              : ""
                          }
                          onClick={() => {
                            setStatusFilter(
                              status
                            );

                            setFilterOpen(
                              false
                            );
                          }}
                        >
                          {status}
                        </button>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>
          </div>

          {/* APPLICATION CARD */}

          <section className="applicationsCard">

            {/* TABS */}

            <div className="applicationTabs">

              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab}
                  className={`applicationTab ${
                    activeTab === tab
                      ? "applicationTabActive"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab(tab)
                  }
                >
                  {tab}

                  <span>
                    ({tabCounts[tab]})
                  </span>
                </button>
              ))}

            </div>

            {/* LOADING */}

            {loading && (
              <div className="applicationsLoading">

                <LoaderCircle size={32} />

                <p>
                  Loading your applications...
                </p>

              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="applicationsError">

                <h3>
                  Unable to load applications
                </h3>

                <p>{error}</p>

              </div>
            )}

            {/* DESKTOP TABLE */}

            {!loading && !error && (
              <div className="applicationsTableWrapper">

                <table className="applicationsTable">

                  <thead>
                    <tr>
                      <th>Job Title</th>

                      <th>Company</th>

                      <th>Date Applied</th>

                      <th>Status</th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredApplications.length >
                    0 ? (
                      filteredApplications.map(
                        (application) => (
                          <tr
                            key={
                              application._id
                            }
                          >

                            <td className="applicationJobTitle">
                              {application.jobTitle}
                            </td>

                            <td>
                              {
                                application.companyName
                              }
                            </td>

                            <td>
                              {formatDate(
                                application.createdAt
                              )}
                            </td>

                            <td>

                              <span
                                className={`applicationStatus status${getDisplayStatus(
                                  application.status
                                ).replace(
                                  /\s/g,
                                  ""
                                )}`}
                              >
                                {getDisplayStatus(
                                  application.status
                                )}
                              </span>

                            </td>

                            <td>

                              <div className="applicationActions">

                                <button
                                  type="button"
                                  className="viewApplicationButton"
                                  onClick={() =>
                                    handleViewJob(
                                      application
                                    )
                                  }
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  className="moreApplicationButton"
                                >
                                  <MoreHorizontal
                                    size={18}
                                  />
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )
                    ) : (
                      <tr>

                        <td
                          colSpan="5"
                          className="applicationsEmpty"
                        >
                          <FileText size={38} />

                          <h3>
                            No applications found
                          </h3>

                          <p>
                            Try changing your
                            search or filter.
                          </p>
                        </td>

                      </tr>
                    )}

                  </tbody>

                </table>

              </div>
            )}

            {/* MOBILE CARDS */}

            {!loading && !error && (
              <div className="applicationsMobileList">

                {filteredApplications.length >
                0 ? (
                  filteredApplications.map(
                    (application) => (
                      <div
                        className="applicationMobileCard"
                        key={
                          application._id
                        }
                      >

                        <div className="applicationMobileTop">

                          <div>
                            <h3>
                              {
                                application.jobTitle
                              }
                            </h3>

                            <p>
                              {
                                application.companyName
                              }
                            </p>
                          </div>

                          <span
                            className={`applicationStatus status${getDisplayStatus(
                              application.status
                            ).replace(
                              /\s/g,
                              ""
                            )}`}
                          >
                            {getDisplayStatus(
                              application.status
                            )}
                          </span>

                        </div>

                        <div className="applicationMobileDetails">

                          <span>
                            <MapPin size={14} />

                            {application.location ||
                              "Location not specified"}
                          </span>

                          <span>
                            <CalendarDays size={14} />

                            {formatDate(
                              application.createdAt
                            )}
                          </span>

                        </div>

                        <button
                          type="button"
                          className="mobileViewJobButton"
                          onClick={() =>
                            handleViewJob(
                              application
                            )
                          }
                        >
                          <Eye size={16} />

                          View Job Details
                        </button>

                      </div>
                    )
                  )
                ) : (
                  <div className="mobileApplicationsEmpty">

                    <FileText size={38} />

                    <h3>
                      No applications found
                    </h3>

                    <p>
                      Try changing your
                      search or filter.
                    </p>

                  </div>
                )}

              </div>
            )}

            {/* FOOTER */}

            {!loading &&
              !error &&
              applications.length > 0 && (
                <div className="applicationsFooter">

                  <p>
                    Showing{" "}
                    <strong>
                      {filteredApplications.length >
                      0
                        ? 1
                        : 0}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {filteredApplications.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {applications.length}
                    </strong>{" "}
                    applications
                  </p>

                  <div className="applicationPagination">

                    <button type="button">
                      <ChevronLeft size={16} />
                    </button>

                    <button
                      type="button"
                      className="paginationActive"
                    >
                      1
                    </button>

                    <button type="button">
                      <ChevronRight size={16} />
                    </button>

                  </div>

                </div>
              )}

          </section>

        </main>

      </div>

    </div>
  );
};

export default MyApplications;