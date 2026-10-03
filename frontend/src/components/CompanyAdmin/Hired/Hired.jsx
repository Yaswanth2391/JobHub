import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  BriefcaseBusiness,
  CalendarDays,
  IndianRupee,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminSidebar from "../AdminSidebar/AdminSidebar";
import API_BASE_URL from "../../../services/api";

import "./Hired.css";

const ITEMS_PER_PAGE = 7;

const getAdminToken = () => {
  return (
    localStorage.getItem("jobhubCompanyAdminToken") ||
    localStorage.getItem("companyAdminToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    ""
  );
};

const getAdminData = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("jobhubCompanyAdmin")) ||
      JSON.parse(localStorage.getItem("companyAdmin")) ||
      JSON.parse(localStorage.getItem("admin")) ||
      {}
    );
  } catch {
    return {};
  }
};

const getCandidateName = (application) => {
  if (application?.fullName?.trim()) return application.fullName.trim();

  if (
    application?.candidate &&
    typeof application.candidate === "object" &&
    application.candidate.fullName
  ) {
    return application.candidate.fullName;
  }

  return "Candidate";
};

const getCandidateEmail = (application) => {
  if (application?.email?.trim()) return application.email.trim();

  if (
    application?.candidate &&
    typeof application.candidate === "object" &&
    application.candidate.email
  ) {
    return application.candidate.email;
  }

  return "";
};

const getCandidatePhone = (application) => {
  if (application?.phone?.trim()) return application.phone.trim();

  if (
    application?.candidate &&
    typeof application.candidate === "object" &&
    application.candidate.phone
  ) {
    return application.candidate.phone;
  }

  return "";
};

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "C";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatInterviewDate = (application) => {
  const date = application?.interview?.date;

  if (!date) return "Not available";

  return formatDate(date);
};

const getCompanyName = (adminData) => {
  if (
    typeof adminData?.companyName === "string" &&
    adminData.companyName.trim()
  ) {
    return adminData.companyName.trim();
  }

  if (
    typeof adminData?.company === "string" &&
    adminData.company.trim()
  ) {
    return adminData.company.trim();
  }

  return "JOBHUB";
};

const Hired = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const adminData = useMemo(() => getAdminData(), []);
  const companyName = getCompanyName(adminData);
  const companyInitial =
    companyName.charAt(0).toUpperCase() || "J";

  const fetchHiredApplications = async (showRefresh = false) => {
    const token = getAdminToken();

    if (!token) {
      toast.error("Company admin session not found.");
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch hired candidates."
        );
      }

      const allApplications = Array.isArray(data?.applications)
        ? data.applications
        : [];

      const hiredApplications = allApplications
        .filter((application) => application.status === "Hired")
        .sort((a, b) => {
          const aDate = new Date(
            a.updatedAt || a.createdAt || 0
          ).getTime();

          const bDate = new Date(
            b.updatedAt || b.createdAt || 0
          ).getTime();

          return bDate - aDate;
        });

      setApplications(hiredApplications);
      setPage(1);
    } catch (error) {
      console.error("Fetch hired applications error:", error);
      toast.error(
        error.message || "Unable to load hired candidates."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHiredApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter((application) => {
      const candidateName = getCandidateName(application);
      const candidateEmail = getCandidateEmail(application);

      return [
        candidateName,
        candidateEmail,
        application?.jobTitle,
        application?.companyName,
        application?.location,
        application?.interview?.interviewType,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [applications, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / ITEMS_PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handlePreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    setPage((current) =>
      Math.min(totalPages, current + 1)
    );
  };

  if (loading) {
    return (
      <div className="hiredPage">
        <AdminSidebar />

        <main className="hiredMain">
          <header className="hiredTopbar">
            <div>
              <span className="hiredTopbarLabel">
                COMPANY ADMIN
              </span>
              <h1>Hired</h1>
            </div>

            <div className="hiredAdminRight">
              <button
                type="button"
                className="hiredNotification"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>

              <div className="hiredAdmin">
                <div className="hiredAdminAvatar">
                  {companyInitial}
                </div>

                <div className="hiredAdminInfo">
                  <strong>{companyName}</strong>
                  <span>Company Admin</span>
                </div>
              </div>
            </div>
          </header>

          <div className="hiredLoading">
            <div className="hiredLoadingIcon">
              <Loader2 size={25} />
            </div>
            <h2>Loading hired candidates</h2>
            <p>Please wait while we fetch the latest hiring records.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="hiredPage">
      <AdminSidebar />

      <main className="hiredMain">
        {/* TOP BAR */}
        <header className="hiredTopbar">
          <div>
            <span className="hiredTopbarLabel">
              COMPANY ADMIN
            </span>
            <h1>Hired</h1>
          </div>

          <div className="hiredAdminRight">
            <button
              type="button"
              className="hiredNotification"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="hiredAdmin">
              <div className="hiredAdminAvatar">
                {companyInitial}
              </div>

              <div className="hiredAdminInfo">
                <strong>{companyName}</strong>
                <span>Company Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="hiredContent">
          <section className="hiredHeader">
            <div>
              <span className="hiredEyebrow">
                HIRING MANAGEMENT
              </span>

              <h2>Hired Candidates</h2>

              <p>
                View candidates who have successfully completed the
                hiring process.
              </p>
            </div>

            <button
              type="button"
              className={`hiredRefreshButton ${
                refreshing ? "refreshing" : ""
              }`}
              onClick={() => fetchHiredApplications(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </section>

          {/* STATS */}
          <section className="hiredStats">
            <div className="hiredStatCard">
              <div className="hiredStatIcon total">
                <Users size={20} />
              </div>

              <div>
                <span>Total Hired</span>
                <strong>{applications.length}</strong>
              </div>
            </div>

            <div className="hiredStatCard">
              <div className="hiredStatIcon role">
                <BriefcaseBusiness size={20} />
              </div>

              <div>
                <span>Active Roles</span>
                <strong>
                  {
                    new Set(
                      applications
                        .map((application) => application.jobTitle)
                        .filter(Boolean)
                    ).size
                  }
                </strong>
              </div>
            </div>

            <div className="hiredStatCard">
              <div className="hiredStatIcon recent">
                <CalendarDays size={20} />
              </div>

              <div>
                <span>Latest Hire</span>
                <strong className="hiredStatDate">
                  {applications.length
                    ? formatDate(
                        applications[0]?.updatedAt ||
                          applications[0]?.createdAt
                      )
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* TOOLBAR */}
          <section className="hiredToolbar">
            <div className="hiredToolbarTitle">
              <strong>Hired Candidates</strong>
              <span>{filteredApplications.length}</span>
            </div>

            <div className="hiredSearch">
              <Search size={17} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidate, role or email..."
              />
            </div>
          </section>

          {/* TABLE */}
          <section className="hiredTableCard">
            {paginatedApplications.length ? (
              <>
                <div className="hiredTableWrapper">
                  <table className="hiredTable">
                    <thead>
                      <tr>
                        <th>CANDIDATE</th>
                        <th>POSITION</th>
                        <th>ATS SCORE</th>
                        <th>INTERVIEW</th>
                        <th>HIRED ON</th>
                        <th>CONTACT</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedApplications.map((application) => {
                        const candidateName =
                          getCandidateName(application);

                        const candidateEmail =
                          getCandidateEmail(application);

                        const candidatePhone =
                          getCandidatePhone(application);

                        return (
                          <tr key={application._id}>
                            <td>
                              <div className="hiredCandidate">
                                <div className="hiredCandidateAvatar">
                                  {getInitials(candidateName)}
                                </div>

                                <div className="hiredCandidateInfo">
                                  <strong>{candidateName}</strong>
                                  <span>{candidateEmail || "No email"}</span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="hiredPosition">
                                <strong>
                                  {application.jobTitle ||
                                    "Position not available"}
                                </strong>

                                <span>
                                  {application.location ||
                                    "Location not available"}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className="hiredScore">
                                {typeof application.atsScore === "number"
                                  ? `${application.atsScore}%`
                                  : "—"}
                              </span>
                            </td>

                            <td>
                              <div className="hiredInterview">
                                <strong>
                                  {application.interview
                                    ?.interviewType || "Interview"}
                                </strong>

                                <span>
                                  {formatInterviewDate(application)}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className="hiredDate">
                                {formatDate(
                                  application.updatedAt ||
                                    application.createdAt
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="hiredContact">
                                {candidateEmail && (
                                  <span>
                                    <Mail size={13} />
                                    Email
                                  </span>
                                )}

                                {candidatePhone && (
                                  <span>
                                    <Phone size={13} />
                                    {candidatePhone}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="hiredViewButton"
                                onClick={() =>
                                  setSelectedApplication(application)
                                }
                                title="View hiring details"
                              >
                                <Eye size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="hiredPagination">
                  <span>
                    Showing{" "}
                    {filteredApplications.length
                      ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                      : 0}{" "}
                    -{" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredApplications.length
                    )}{" "}
                    of {filteredApplications.length}
                  </span>

                  <div className="hiredPaginationButtons">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span>
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hiredEmpty">
                <div className="hiredEmptyIcon">
                  <Users size={26} />
                </div>

                <h3>
                  {search
                    ? "No matching hired candidates"
                    : "No hired candidates yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different candidate name, role or email."
                    : "Candidates who are marked as hired after their interviews will appear here."}
                </p>

                {search && (
                  <button
                    type="button"
                    className="hiredClearSearch"
                    onClick={() => setSearch("")}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* DETAILS MODAL */}
      {selectedApplication && (
        <div
          className="hiredDetailsOverlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedApplication(null);
            }
          }}
        >
          <div className="hiredDetailsModal">
            <div className="hiredDetailsHeader">
              <div>
                <span>HIRING DETAILS</span>
                <h2>
                  {getCandidateName(selectedApplication)}
                </h2>
              </div>

              <button
                type="button"
                className="hiredDetailsClose"
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </button>
            </div>

            <div className="hiredDetailsBody">
              <div className="hiredProfileCard">
                <div className="hiredDetailsAvatar">
                  {getInitials(
                    getCandidateName(selectedApplication)
                  )}
                </div>

                <div>
                  <strong>
                    {getCandidateName(selectedApplication)}
                  </strong>

                  <span>
                    {getCandidateEmail(selectedApplication) ||
                      "Email not available"}
                  </span>

                  {getCandidatePhone(selectedApplication) && (
                    <span>
                      {getCandidatePhone(selectedApplication)}
                    </span>
                  )}
                </div>
              </div>

              <div className="hiredDetailsGrid">
                <div className="hiredDetailItem">
                  <span>
                    <BriefcaseBusiness size={14} />
                    Position
                  </span>

                  <strong>
                    {selectedApplication.jobTitle ||
                      "Not available"}
                  </strong>
                </div>

                <div className="hiredDetailItem">
                  <span>
                    <Users size={14} />
                    ATS Score
                  </span>

                  <strong>
                    {typeof selectedApplication.atsScore === "number"
                      ? `${selectedApplication.atsScore}%`
                      : "Not available"}
                  </strong>
                </div>

                <div className="hiredDetailItem">
                  <span>
                    <CalendarDays size={14} />
                    Interview
                  </span>

                  <strong>
                    {selectedApplication.interview
                      ?.interviewType || "Interview"}
                  </strong>
                </div>

                <div className="hiredDetailItem">
                  <span>
                    <CalendarDays size={14} />
                    Hired On
                  </span>

                  <strong>
                    {formatDate(
                      selectedApplication.updatedAt ||
                        selectedApplication.createdAt
                    )}
                  </strong>
                </div>

                <div className="hiredDetailItem">
                  <span>
                    <IndianRupee size={14} />
                    Salary / CTC
                  </span>

                  <strong>
                    {selectedApplication.hiringDetails?.ctc ||
                      selectedApplication.ctc ||
                      "Not specified"}
                  </strong>
                </div>

                <div className="hiredDetailItem">
                  <span>
                    <CalendarDays size={14} />
                    Joining Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedApplication.hiringDetails?.joiningDate
                    )}
                  </strong>
                </div>
              </div>

              <div className="hiredDetailsSection">
                <h3>Interview Information</h3>

                <div className="hiredInfoBox">
                  <p>
                    Interviewers:{" "}
                    {selectedApplication.interview?.interviewers
                      ?.length
                      ? selectedApplication.interview.interviewers.join(
                          ", "
                        )
                      : "Not available"}
                  </p>

                  <p>
                    Mode:{" "}
                    {selectedApplication.interview?.mode ||
                      "Not available"}
                  </p>

                  {selectedApplication.interview?.notes && (
                    <p>
                      Notes:{" "}
                      {selectedApplication.interview.notes}
                    </p>
                  )}
                </div>
              </div>

              {selectedApplication.coverLetter && (
                <div className="hiredDetailsSection">
                  <h3>Application Notes</h3>

                  <div className="hiredInfoBox">
                    <p>{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="hiredDetailsFooter">
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hired;
