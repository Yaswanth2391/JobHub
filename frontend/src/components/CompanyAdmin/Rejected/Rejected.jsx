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
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserRoundX,
  MessageSquareText,
  BellRing,
  Building2,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminSidebar from "../AdminSidebar/AdminSidebar";
import API_BASE_URL from "../../../services/api";

import "./Rejected.css";

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
  if (application?.fullName?.trim()) {
    return application.fullName.trim();
  }

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
  if (application?.email?.trim()) {
    return application.email.trim();
  }

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
  if (application?.phone?.trim()) {
    return application.phone.trim();
  }

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

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRejectedAt = (application) => {
  return (
    application?.rejectionDetails?.rejectedAt ||
    application?.updatedAt ||
    application?.createdAt ||
    null
  );
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

const getAtsScore = (application) => {
  const score = Number(application?.atsScore);

  if (Number.isNaN(score)) return null;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const Rejected = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const adminData = useMemo(() => getAdminData(), []);
  const companyName = getCompanyName(adminData);
  const companyInitial = companyName.charAt(0).toUpperCase() || "J";

  const fetchRejectedApplications = async (showRefresh = false) => {
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
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch rejected candidates."
        );
      }

      const allApplications = Array.isArray(data?.applications)
        ? data.applications
        : [];

      const rejectedApplications = allApplications
        .filter((application) => application.status === "Rejected")
        .sort((a, b) => {
          const aDate = new Date(getRejectedAt(a) || 0).getTime();
          const bDate = new Date(getRejectedAt(b) || 0).getTime();

          return bDate - aDate;
        });

      setApplications(rejectedApplications);
      setPage(1);
    } catch (error) {
      console.error("Fetch rejected applications error:", error);
      toast.error(
        error.message || "Unable to load rejected candidates."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRejectedApplications();
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
        application?.rejectionDetails?.reason,
        application?.rejectionDetails?.feedback,
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
    setPage((current) => Math.min(totalPages, current + 1));
  };

  const getInterviewType = (application) => {
    return application?.interview?.interviewType || "Interview";
  };

  const getInterviewDate = (application) => {
    return formatDate(application?.interview?.date);
  };

  if (loading) {
    return (
      <div className="rejectedPage">
        <AdminSidebar />

        <main className="rejectedMain">
          <header className="rejectedTopbar">
            <div>
              <span className="rejectedTopbarLabel">COMPANY ADMIN</span>
              <h1>Rejected</h1>
            </div>

            <div className="rejectedAdminRight">
              <button
                type="button"
                className="rejectedNotification"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>

              <div className="rejectedAdmin">
                <div className="rejectedAdminAvatar">
                  {companyInitial}
                </div>

                <div className="rejectedAdminInfo">
                  <strong>{companyName}</strong>
                  <span>Company Admin</span>
                </div>
              </div>
            </div>
          </header>

          <div className="rejectedLoading">
            <div className="rejectedLoadingIcon">
              <Loader2 size={25} />
            </div>
            <h2>Loading rejected candidates</h2>
            <p>Please wait while we fetch the latest rejection records.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="rejectedPage">
      <AdminSidebar />

      <main className="rejectedMain">
        {/* TOP BAR */}
        <header className="rejectedTopbar">
          <div>
            <span className="rejectedTopbarLabel">COMPANY ADMIN</span>
            <h1>Rejected</h1>
          </div>

          <div className="rejectedAdminRight">
            <button
              type="button"
              className="rejectedNotification"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="rejectedAdmin">
              <div className="rejectedAdminAvatar">
                {companyInitial}
              </div>

              <div className="rejectedAdminInfo">
                <strong>{companyName}</strong>
                <span>Company Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="rejectedContent">
          {/* PAGE HEADER */}
          <section className="rejectedHeader">
            <div>
              <span className="rejectedEyebrow">APPLICATION MANAGEMENT</span>

              <h2>Rejected Candidates</h2>

              <p>
                View candidates whose applications were rejected and review
                the recorded rejection details.
              </p>
            </div>

            <button
              type="button"
              className={`rejectedRefreshButton ${
                refreshing ? "refreshing" : ""
              }`}
              onClick={() => fetchRejectedApplications(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </section>

          {/* STATS */}
          <section className="rejectedStats">
            <div className="rejectedStatCard">
              <div className="rejectedStatIcon total">
                <Users size={20} />
              </div>

              <div>
                <span>Total Rejected</span>
                <strong>{applications.length}</strong>
              </div>
            </div>

            <div className="rejectedStatCard">
              <div className="rejectedStatIcon role">
                <BriefcaseBusiness size={20} />
              </div>

              <div>
                <span>Roles Affected</span>
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

            <div className="rejectedStatCard">
              <div className="rejectedStatIcon recent">
                <CalendarDays size={20} />
              </div>

              <div>
                <span>Latest Rejection</span>
                <strong className="rejectedStatDate">
                  {applications.length
                    ? formatDate(getRejectedAt(applications[0]))
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* TOOLBAR */}
          <section className="rejectedToolbar">
            <div className="rejectedToolbarTitle">
              <strong>Rejected Candidates</strong>
              <span>{filteredApplications.length}</span>
            </div>

            <div className="rejectedSearch">
              <Search size={17} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidate, role, email or reason..."
              />
            </div>
          </section>

          {/* TABLE */}
          <section className="rejectedTableCard">
            {paginatedApplications.length ? (
              <>
                <div className="rejectedTableWrapper">
                  <table className="rejectedTable">
                    <thead>
                      <tr>
                        <th>CANDIDATE</th>
                        <th>POSITION</th>
                        <th>ATS SCORE</th>
                        <th>INTERVIEW</th>
                        <th>REJECTED ON</th>
                        <th>REASON</th>
                        <th>CONTACT</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedApplications.map((application) => {
                        const candidateName = getCandidateName(application);
                        const candidateEmail = getCandidateEmail(application);
                        const candidatePhone = getCandidatePhone(application);
                        const atsScore = getAtsScore(application);
                        const reason =
                          application?.rejectionDetails?.reason ||
                          "Reason not recorded";

                        return (
                          <tr key={application._id}>
                            <td>
                              <div className="rejectedCandidate">
                                <div className="rejectedCandidateAvatar">
                                  {getInitials(candidateName)}
                                </div>

                                <div className="rejectedCandidateInfo">
                                  <strong>{candidateName}</strong>
                                  <span>{candidateEmail || "No email"}</span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="rejectedPosition">
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
                              <span className="rejectedScore">
                                {atsScore !== null ? `${atsScore}%` : "—"}
                              </span>
                            </td>

                            <td>
                              <div className="rejectedInterview">
                                <strong>{getInterviewType(application)}</strong>
                                <span>{getInterviewDate(application)}</span>
                              </div>
                            </td>

                            <td>
                              <span className="rejectedDate">
                                {formatDate(getRejectedAt(application))}
                              </span>
                            </td>

                            <td>
                              <div className="rejectedReasonCell" title={reason}>
                                <span>{reason}</span>
                              </div>
                            </td>

                            <td>
                              <div className="rejectedContact">
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

                                {!candidateEmail && !candidatePhone && (
                                  <span>No contact</span>
                                )}
                              </div>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="rejectedViewButton"
                                onClick={() =>
                                  setSelectedApplication(application)
                                }
                                title="View rejection details"
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
                <div className="rejectedPagination">
                  <span>
                    Showing {filteredApplications.length
                      ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                      : 0} - {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredApplications.length
                    )} of {filteredApplications.length}
                  </span>

                  <div className="rejectedPaginationButtons">
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
              <div className="rejectedEmpty">
                <div className="rejectedEmptyIcon">
                  <UserRoundX size={26} />
                </div>

                <h3>
                  {search
                    ? "No matching rejected candidates"
                    : "No rejected candidates yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different candidate name, role, email or rejection reason."
                    : "Candidates who are rejected from the recruitment workflow will appear here."}
                </p>

                {search && (
                  <button
                    type="button"
                    className="rejectedClearSearch"
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
          className="rejectedDetailsOverlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedApplication(null);
            }
          }}
        >
          <div className="rejectedDetailsModal">
            <div className="rejectedDetailsHeader">
              <div>
                <span>REJECTION DETAILS</span>
                <h2>{getCandidateName(selectedApplication)}</h2>
              </div>

              <button
                type="button"
                className="rejectedDetailsClose"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close rejection details"
              >
                ×
              </button>
            </div>

            <div className="rejectedDetailsBody">
              <div className="rejectedProfileCard">
                <div className="rejectedDetailsAvatar">
                  {getInitials(getCandidateName(selectedApplication))}
                </div>

                <div>
                  <strong>{getCandidateName(selectedApplication)}</strong>
                  <span>
                    {getCandidateEmail(selectedApplication) ||
                      "Email not available"}
                  </span>

                  {getCandidatePhone(selectedApplication) && (
                    <span>{getCandidatePhone(selectedApplication)}</span>
                  )}
                </div>
              </div>

              <div className="rejectedStatusBox">
                <div className="rejectedStatusIcon">
                  <UserRoundX size={17} />
                </div>

                <div>
                  <strong>Application Rejected</strong>
                  <span>
                    This application is currently recorded with the Rejected
                    status.
                  </span>
                </div>
              </div>

              <div className="rejectedDetailsGrid">
                <div className="rejectedDetailItem">
                  <span>
                    <BriefcaseBusiness size={14} />
                    Position
                  </span>

                  <strong>
                    {selectedApplication.jobTitle || "Not available"}
                  </strong>
                </div>

                <div className="rejectedDetailItem">
                  <span>
                    <Building2 size={14} />
                    Company
                  </span>

                  <strong>
                    {selectedApplication.companyName || companyName}
                  </strong>
                </div>

                <div className="rejectedDetailItem">
                  <span>
                    <Users size={14} />
                    ATS Score
                  </span>

                  <strong>
                    {getAtsScore(selectedApplication) !== null
                      ? `${getAtsScore(selectedApplication)}%`
                      : "Not available"}
                  </strong>
                </div>

                <div className="rejectedDetailItem">
                  <span>
                    <CalendarDays size={14} />
                    Rejected On
                  </span>

                  <strong>
                    {formatDateTime(getRejectedAt(selectedApplication))}
                  </strong>
                </div>

                <div className="rejectedDetailItem">
                  <span>
                    <CalendarDays size={14} />
                    Interview
                  </span>

                  <strong>{getInterviewType(selectedApplication)}</strong>
                </div>

                <div className="rejectedDetailItem">
                  <span>
                    <CalendarDays size={14} />
                    Interview Date
                  </span>

                  <strong>
                    {formatDate(selectedApplication.interview?.date)}
                  </strong>
                </div>
              </div>

              <div className="rejectedDetailsSection">
                <h3>
                  <UserRoundX size={14} />
                  Rejection Reason
                </h3>

                <div className="rejectedInfoBox rejectedReasonBox">
                  <strong>
                    {selectedApplication.rejectionDetails?.reason ||
                      "Reason not recorded"}
                  </strong>
                </div>
              </div>

              <div className="rejectedDetailsSection">
                <h3>
                  <MessageSquareText size={14} />
                  Additional Feedback
                </h3>

                <div className="rejectedInfoBox">
                  <p>
                    {selectedApplication.rejectionDetails?.feedback ||
                      "No additional feedback was recorded."}
                  </p>
                </div>
              </div>

              <div className="rejectedDetailsSection">
                <h3>
                  <BellRing size={14} />
                  Candidate Notification
                </h3>

                <div className="rejectedNotificationBox">
                  <span
                    className={
                      selectedApplication.rejectionDetails?.notifyCandidate
                        ? "enabled"
                        : "disabled"
                    }
                  >
                    {selectedApplication.rejectionDetails?.notifyCandidate
                      ? "Notification requested"
                      : "Notification not requested"}
                  </span>

                  <small>
                    The saved preference reflects whether the admin selected
                    the notification checkbox during rejection.
                  </small>
                </div>
              </div>

              <div className="rejectedDetailsSection">
                <h3>Interview Information</h3>

                <div className="rejectedInfoBox">
                  <p>
                    Interviewers: {selectedApplication.interview?.interviewers
                      ?.length
                      ? selectedApplication.interview.interviewers.join(", ")
                      : "Not available"}
                  </p>

                  <p>
                    Mode: {selectedApplication.interview?.mode ||
                      "Not available"}
                  </p>

                  {selectedApplication.interview?.notes && (
                    <p>Notes: {selectedApplication.interview.notes}</p>
                  )}
                </div>
              </div>

              {selectedApplication.coverLetter && (
                <div className="rejectedDetailsSection">
                  <h3>Application Notes</h3>

                  <div className="rejectedInfoBox">
                    <p>{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rejectedDetailsFooter">
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

export default Rejected;
