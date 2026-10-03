import {
  Bell,
  BriefcaseBusiness,
  FileText,
  Clock3,
  UserCheck,
  UserX,
  CalendarDays,
  Menu,
  TrendingUp,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import AdminSidebar from "../AdminSidebar/AdminSidebar";

import API_BASE_URL from "../../../services/api";

import "./Dashboard.css";

function Dashboard() {
  const [companyAdmin, setCompanyAdmin] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* =====================================
     JOB STATES
  ===================================== */

  const [activeJobs, setActiveJobs] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(true);

  /* =====================================
     APPLICATION STATES
  ===================================== */

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  /* =====================================
     LOAD COMPANY ADMIN
  ===================================== */

  useEffect(() => {
    const storedCompanyAdmin = localStorage.getItem(
      "jobhubCompanyAdmin"
    );

    if (storedCompanyAdmin) {
      try {
        const parsedCompanyAdmin = JSON.parse(
          storedCompanyAdmin
        );

        setCompanyAdmin(parsedCompanyAdmin);
      } catch (error) {
        console.error(
          "Unable to load company information:",
          error
        );
      }
    }
  }, []);

  /* =====================================
     GET COMPANY ADMIN TOKEN
  ===================================== */

  const getCompanyAdminToken = () => {
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
      localStorage.getItem(
        "token"
      )
    );
  };

  /* =====================================
     GET COMPANY JOBS
  ===================================== */

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      const token = getCompanyAdminToken();

      if (!token) {
        setJobsLoading(false);
        return;
      }

      try {
        setJobsLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/company-admin/jobs`,
          {
            method: "GET",
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

        const companyJobs = Array.isArray(
          data.jobs
        )
          ? data.jobs
          : [];

        /* =====================================
           ACTIVE JOBS
           ONLY PUBLISHED JOBS
        ===================================== */

        const publishedJobs =
          companyJobs.filter(
            (job) =>
              job.status === "published"
          );

        setActiveJobs(
          publishedJobs.length
        );
      } catch (error) {
        console.error(
          "Dashboard jobs error:",
          error
        );

        setActiveJobs(0);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchCompanyJobs();
  }, []);

  /* =====================================
     GET COMPANY APPLICATIONS
  ===================================== */

  useEffect(() => {
    const fetchCompanyApplications =
      async () => {
        const token =
          getCompanyAdminToken();

        if (!token) {
          setApplicationsLoading(false);
          return;
        }

        try {
          setApplicationsLoading(true);

          const response = await fetch(
            `${API_BASE_URL}/api/company-admin/applications`,
            {
              method: "GET",
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
                "Unable to fetch company applications"
            );
          }

          const companyApplications =
            Array.isArray(
              data.applications
            )
              ? data.applications
              : [];

          setApplications(
            companyApplications
          );
        } catch (error) {
          console.error(
            "Dashboard applications error:",
            error
          );

          setApplications([]);
        } finally {
          setApplicationsLoading(
            false
          );
        }
      };

    fetchCompanyApplications();
  }, []);

  /* =====================================
     APPLICATION STATISTICS
  ===================================== */

  const applicationStats = useMemo(() => {
    const totalApplications =
      applications.length;

    const hiredApplications =
      applications.filter(
        (application) =>
          application.status === "Hired"
      ).length;

    const rejectedApplications =
      applications.filter(
        (application) =>
          application.status ===
          "Rejected"
      ).length;

    const inReviewApplications =
      applications.filter(
        (application) =>
          application.status ===
            "Applied" ||
          application.status ===
            "Interview Scheduled"
      ).length;

    return {
      totalApplications,
      inReviewApplications,
      hiredApplications,
      rejectedApplications,
    };
  }, [applications]);

  /* =====================================
     APPLICATION TREND - LAST 7 DAYS
  ===================================== */

  const applicationTrend = useMemo(() => {
    const today = new Date();

    const days = [];

    for (
      let index = 6;
      index >= 0;
      index -= 1
    ) {
      const date = new Date(today);

      date.setHours(
        0,
        0,
        0,
        0
      );

      date.setDate(
        today.getDate() - index
      );

      const key = [
        date.getFullYear(),
        String(
          date.getMonth() + 1
        ).padStart(2, "0"),
        String(
          date.getDate()
        ).padStart(2, "0"),
      ].join("-");

      days.push({
        key,
        label:
          date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),
        fullLabel:
          date.toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          ),
        count: 0,
      });
    }

    applications.forEach(
      (application) => {
        const applicationDate =
          application.createdAt;

        if (!applicationDate) {
          return;
        }

        const date = new Date(
          applicationDate
        );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return;
        }

        const key = [
          date.getFullYear(),
          String(
            date.getMonth() + 1
          ).padStart(2, "0"),
          String(
            date.getDate()
          ).padStart(2, "0"),
        ].join("-");

        const matchingDay =
          days.find(
            (day) =>
              day.key === key
          );

        if (matchingDay) {
          matchingDay.count += 1;
        }
      }
    );

    const maxCount = Math.max(
      ...days.map(
        (day) => day.count
      ),
      1
    );

    return days.map(
      (day) => ({
        ...day,

        height:
          day.count > 0
            ? `${Math.max(
                (day.count /
                  maxCount) *
                  100,
                10
              )}%`
            : "0%",
      })
    );
  }, [applications]);

  /* =====================================
     TREND TOTAL
  ===================================== */

  const trendTotal =
    applicationTrend.reduce(
      (total, day) =>
        total + day.count,
      0
    );

  /* =====================================
     RECENT APPLICATIONS
  ===================================== */

  const recentApplications =
    useMemo(() => {
      return [...applications]
        .sort((first, second) => {
          const firstTime =
            new Date(
              first.createdAt || 0
            ).getTime();

          const secondTime =
            new Date(
              second.createdAt || 0
            ).getTime();

          return (
            secondTime - firstTime
          );
        })
        .slice(0, 6);
    }, [applications]);

  /* =====================================
     FORMAT DATE
  ===================================== */

  const formatApplicationDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(
      dateValue
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================
     FORMAT CANDIDATE NAME
  ===================================== */

  const getCandidateName = (
    application
  ) => {
    return (
      application.fullName ||
      application.candidate
        ?.fullName ||
      "Candidate"
    );
  };

  /* =====================================
     FORMAT CANDIDATE EMAIL
  ===================================== */

  const getCandidateEmail = (
    application
  ) => {
    return (
      application.email ||
      application.candidate
        ?.email ||
      ""
    );
  };

  /* =====================================
     FORMAT JOB TITLE
  ===================================== */

  const getJobTitle = (
    application
  ) => {
    return (
      application.jobTitle ||
      "Job Application"
    );
  };

  /* =====================================
     STATUS CLASS
  ===================================== */

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "Hired":
        return "hired";

      case "Rejected":
        return "rejected";

      case "Interview Scheduled":
        return "scheduled";

      case "Applied":
      default:
        return "applied";
    }
  };

  /* =====================================
     COMPANY INFORMATION
  ===================================== */

  const companyName =
    companyAdmin?.companyName ||
    "Company";

  const companyInitial =
    companyName
      .charAt(0)
      .toUpperCase();

  /* =====================================
     SIDEBAR
  ===================================== */

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  /* =====================================
     RETURN
  ===================================== */

  return (
    <main className="companyDashboardPage">

      {/* =====================================
          MOBILE SIDEBAR OVERLAY
      ===================================== */}

      {isSidebarOpen && (
        <div
          className="companyDashboardSidebarOverlay"
          onClick={closeSidebar}
        />
      )}

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <section className="companyDashboardMain">

        {/* =====================================
            TOP HEADER
        ===================================== */}

        <header className="companyDashboardTopbar">

          {/* MOBILE LEFT */}

          <div className="companyDashboardMobileLeft">

            <button
              type="button"
              className="companyDashboardMenuButton"
              onClick={openSidebar}
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div className="companyDashboardMobileLogo">
              <span>J</span>
              obHub
            </div>

          </div>

          {/* TOPBAR RIGHT */}

          <div className="companyDashboardTopbarRight">

            <button
              type="button"
              className="companyDashboardNotification"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="companyDashboardAdmin">

              <div className="companyDashboardAvatar">
                {companyInitial}
              </div>

              <div className="companyDashboardAdminInfo">

                <strong>
                  {companyName}
                </strong>

                <span>
                  Company Admin
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* =====================================
            DASHBOARD CONTENT
        ===================================== */}

        <div className="companyDashboardContent">

          {/* =====================================
              WELCOME
          ===================================== */}

          <section className="companyDashboardWelcome">

            <div>

              <h1>
                Welcome back,{" "}
                {companyName}!
              </h1>

              <p>
                Here&apos;s what&apos;s
                happening with your
                hiring activity.
              </p>

            </div>

          </section>

          {/* =====================================
              STATISTICS
          ===================================== */}

          <section className="companyDashboardStats">

            {/* ACTIVE JOBS */}

            <article className="companyDashboardStatCard">

              <div className="companyDashboardStatIcon jobsIcon">
                <BriefcaseBusiness
                  size={20}
                />
              </div>

              <div>

                <span>
                  Active Jobs
                </span>

                <strong>
                  {jobsLoading
                    ? "..."
                    : activeJobs}
                </strong>

              </div>

            </article>

            {/* TOTAL APPLICATIONS */}

            <article className="companyDashboardStatCard">

              <div className="companyDashboardStatIcon applicationsIcon">
                <FileText
                  size={20}
                />
              </div>

              <div>

                <span>
                  Total Applications
                </span>

                <strong>
                  {applicationsLoading
                    ? "..."
                    : applicationStats.totalApplications}
                </strong>

              </div>

            </article>

            {/* IN REVIEW */}

            <article className="companyDashboardStatCard">

              <div className="companyDashboardStatIcon reviewIcon">
                <Clock3
                  size={20}
                />
              </div>

              <div>

                <span>
                  In Review
                </span>

                <strong>
                  {applicationsLoading
                    ? "..."
                    : applicationStats.inReviewApplications}
                </strong>

              </div>

            </article>

            {/* HIRED */}

            <article className="companyDashboardStatCard">

              <div className="companyDashboardStatIcon hiredIcon">
                <UserCheck
                  size={20}
                />
              </div>

              <div>

                <span>
                  Hired
                </span>

                <strong>
                  {applicationsLoading
                    ? "..."
                    : applicationStats.hiredApplications}
                </strong>

              </div>

            </article>

            {/* REJECTED */}

            <article className="companyDashboardStatCard">

              <div className="companyDashboardStatIcon rejectedIcon">
                <UserX
                  size={20}
                />
              </div>

              <div>

                <span>
                  Rejected
                </span>

                <strong>
                  {applicationsLoading
                    ? "..."
                    : applicationStats.rejectedApplications}
                </strong>

              </div>

            </article>

          </section>

          {/* =====================================
              MAIN DASHBOARD GRID
          ===================================== */}

          <section className="companyDashboardGrid">

            {/* =====================================
                APPLICATION TREND
            ===================================== */}

            <article className="companyDashboardPanel companyDashboardTrendPanel">

              <div className="companyDashboardPanelHeader">

                <div>

                  <h2>
                    Applications Trend
                  </h2>

                  <p>
                    Candidate applications
                    received over the
                    last 7 days.
                  </p>

                </div>

                <div className="companyDashboardPanelTrendSummary">

                  <TrendingUp
                    size={16}
                  />

                  <span>
                    {trendTotal}{" "}
                    application
                    {trendTotal === 1
                      ? ""
                      : "s"}
                  </span>

                </div>

              </div>

              <div className="companyDashboardTrendContent">

                {applicationsLoading ? (

                  <div className="companyDashboardDataLoading">

                    Loading application
                    activity...

                  </div>

                ) : (

                  <>

                    <div className="companyDashboardChartArea">

                      <div className="companyDashboardChartScale">

                        <span>
                          {Math.max(
                            ...applicationTrend.map(
                              (day) =>
                                day.count
                            ),
                            1
                          )}
                        </span>

                        <span>
                          {Math.ceil(
                            Math.max(
                              ...applicationTrend.map(
                                (day) =>
                                  day.count
                              ),
                              1
                            ) / 2
                          )}
                        </span>

                        <span>
                          0
                        </span>

                      </div>

                      <div className="companyDashboardBars">

                        {applicationTrend.map(
                          (day) => (

                            <div
                              className="companyDashboardBarColumn"
                              key={
                                day.key
                              }
                              title={`${day.fullLabel}: ${day.count} application${
                                day.count ===
                                1
                                  ? ""
                                  : "s"
                              }`}
                            >

                              <div className="companyDashboardBarTrack">

                                <div
                                  className={`companyDashboardBarFill ${
                                    day.count >
                                    0
                                      ? "hasValue"
                                      : ""
                                  }`}
                                  style={{
                                    height:
                                      day.height,
                                  }}
                                >

                                  {day.count >
                                    0 && (

                                    <span className="companyDashboardBarValue">
                                      {
                                        day.count
                                      }
                                    </span>

                                  )}

                                </div>

                              </div>

                              <span className="companyDashboardBarLabel">
                                {
                                  day.label
                                }
                              </span>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                    {/* ACTIVITY SUMMARY */}

                    <div className="companyDashboardActivitySummary">

                      <div>

                        <span className="activityDot appliedDot" />

                        <strong>
                          {
                            applicationStats.inReviewApplications
                          }
                        </strong>

                        <span>
                          in progress
                        </span>

                      </div>

                      <div>

                        <span className="activityDot hiredDot" />

                        <strong>
                          {
                            applicationStats.hiredApplications
                          }
                        </strong>

                        <span>
                          hired
                        </span>

                      </div>

                      <div>

                        <span className="activityDot rejectedDot" />

                        <strong>
                          {
                            applicationStats.rejectedApplications
                          }
                        </strong>

                        <span>
                          rejected
                        </span>

                      </div>

                    </div>

                  </>

                )}

              </div>

            </article>

            {/* =====================================
                RECENT APPLICATIONS
            ===================================== */}

            <article className="companyDashboardPanel companyDashboardRecentPanel">

              <div className="companyDashboardPanelHeader">

                <div>

                  <h2>
                    Recent Applications
                  </h2>

                  <p>
                    Latest candidate
                    activity across
                    your jobs.
                  </p>

                </div>

                <div className="companyDashboardRecentCount">

                  {applicationsLoading
                    ? "..."
                    : applications.length}

                </div>

              </div>

              <div className="companyDashboardRecentApplications">

                {applicationsLoading ? (

                  <div className="companyDashboardDataLoading">

                    Loading applications...

                  </div>

                ) : recentApplications.length ===
                  0 ? (

                  <div className="companyDashboardEmptyApplications">

                    <div className="companyDashboardEmptyApplicationsIcon">

                      <CalendarDays
                        size={25}
                      />

                    </div>

                    <h3>
                      No applications yet
                    </h3>

                    <p>
                      Applications from
                      candidates will
                      appear here after
                      they apply to your
                      jobs.
                    </p>

                  </div>

                ) : (

                  <div className="companyDashboardApplicationList">

                    {recentApplications.map(
                      (application) => {

                        const candidateName =
                          getCandidateName(
                            application
                          );

                        const candidateEmail =
                          getCandidateEmail(
                            application
                          );

                        const jobTitle =
                          getJobTitle(
                            application
                          );

                        const status =
                          application.status ||
                          "Applied";

                        return (

                          <div
                            className="companyDashboardApplicationItem"
                            key={
                              application._id
                            }
                          >

                            {/* CANDIDATE AVATAR */}

                            <div className="companyDashboardApplicationAvatar">

                              {candidateName
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            {/* CANDIDATE DETAILS */}

                            <div className="companyDashboardApplicationDetails">

                              <strong>
                                {
                                  candidateName
                                }
                              </strong>

                              <span>
                                {jobTitle}
                              </span>

                              {candidateEmail && (
                                <small>
                                  {
                                    candidateEmail
                                  }
                                </small>
                              )}

                              <div className="companyDashboardApplicationMeta">

                                <span>
                                  {formatApplicationDate(
                                    application.createdAt
                                  )}
                                </span>

                                <span
                                  className={`companyDashboardStatusBadge ${getStatusClass(
                                    status
                                  )}`}
                                >
                                  {
                                    status
                                  }
                                </span>

                              </div>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

            </article>

          </section>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;