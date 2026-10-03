import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  UserRound,
  Users,
  FileText,
  BriefcaseBusiness,
  Mail,
  Phone,
  Link as LinkIcon,
  ChevronDown,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminSidebar from "../AdminSidebar/AdminSidebar";
import API_BASE_URL from "../../../services/api";

import "./ScheduleInterview.css";

const INTERVIEW_TYPES = [
  "Technical Round",
  "HR Round",
  "Managerial Round",
  "Final Round",
  "Custom",
];

const INTERVIEW_MODES = ["Online", "Offline"];

function ScheduleInterview() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  // ======================================
  // STATE
  // ======================================

  const [application, setApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [interviewType, setInterviewType] = useState("Technical Round");

  const [customInterviewType, setCustomInterviewType] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [interviewers, setInterviewers] = useState([]);
  const [interviewerInput, setInterviewerInput] = useState("");

  const [mode, setMode] = useState("Online");

  const [meetingLink, setMeetingLink] = useState("");

  const [location, setLocation] = useState("");

  const [notes, setNotes] = useState("");

  // ======================================
  // AUTH TOKEN
  // ======================================

  const getToken = () => {
    return (
      localStorage.getItem("jobhubCompanyAdminToken") ||
      localStorage.getItem("companyAdminToken") ||
      localStorage.getItem("adminToken") ||
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
        JSON.parse(localStorage.getItem("jobhubCompanyAdmin")) ||
        JSON.parse(localStorage.getItem("companyAdmin")) ||
        JSON.parse(localStorage.getItem("admin")) ||
        null
      );
    } catch {
      return null;
    }
  };

  const adminData = useMemo(() => getAdminData(), []);

  // ======================================
  // COMPANY IDENTITY
  // ======================================

  const companyName =
    typeof adminData?.companyName === "string" && adminData.companyName.trim()
      ? adminData.companyName.trim()
      : typeof adminData?.company === "string" && adminData.company.trim()
        ? adminData.company.trim()
        : typeof adminData?.name === "string" && adminData.name.trim()
          ? adminData.name.trim()
          : "JOBHUB";

  const companyInitial =
    companyName.trim().charAt(0).toUpperCase() || "J";

  // ======================================
  // CANDIDATE NAME
  // ======================================

  const candidateName =
    application?.candidate?.fullName || application?.fullName || "Candidate";

  // ======================================
  // CANDIDATE EMAIL
  // ======================================

  const candidateEmail =
    application?.candidate?.email || application?.email || "";

  // ======================================
  // CANDIDATE PHONE
  // ======================================

  const candidatePhone =
    application?.candidate?.phone || application?.phone || "";

  // ======================================
  // CANDIDATE LOCATION
  // ======================================

  const candidateLocation =
    application?.candidate?.location || application?.location || "";

  // ======================================
  // PROFILE INITIAL
  // ======================================

  const candidateInitial =
    candidateName?.trim()?.charAt(0)?.toUpperCase() || "C";

  // ======================================
  // MINIMUM DATE
  // ======================================

  const minimumDate = new Date().toISOString().split("T")[0];

  // ======================================
  // FETCH APPLICATION
  // ======================================

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);

        const token = getToken();

        if (!token) {
          toast.error("Company admin session not found.");

          navigate("/company-admin/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/company-admin/applications/${applicationId}`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to fetch application.");
        }

        setApplication(data.application);

        // ======================================
        // RESTORE EXISTING INTERVIEW DATA
        // ======================================

        if (data.application?.interview) {
          const interview = data.application.interview;

          if (interview.interviewType) {
            const knownType = INTERVIEW_TYPES.includes(interview.interviewType);

            if (knownType) {
              setInterviewType(interview.interviewType);
            } else {
              setInterviewType("Custom");
              setCustomInterviewType(interview.interviewType);
            }
          }

          if (interview.date) {
            const interviewDate = new Date(interview.date);

            if (!Number.isNaN(interviewDate.getTime())) {
              setDate(interviewDate.toISOString().split("T")[0]);
            }
          }

          if (interview.time) {
            setTime(interview.time);
          }

          if (Array.isArray(interview.interviewers)) {
            setInterviewers(interview.interviewers);
          }

          if (interview.mode) {
            setMode(interview.mode);
          }

          if (interview.meetingLink) {
            setMeetingLink(interview.meetingLink);
          }

          if (interview.location) {
            setLocation(interview.location);
          }

          if (interview.notes) {
            setNotes(interview.notes);
          }
        }
      } catch (error) {
        console.error("Fetch application error:", error);

        toast.error(error.message || "Unable to load application.");
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId, navigate]);

  // ======================================
  // ADD INTERVIEWER
  // ======================================

  const handleAddInterviewer = () => {
    const cleanedName = interviewerInput.trim();

    if (!cleanedName) {
      toast.error("Enter an interviewer name.");

      return;
    }

    const alreadyExists = interviewers.some(
      (interviewer) => interviewer.toLowerCase() === cleanedName.toLowerCase(),
    );

    if (alreadyExists) {
      toast.error("This interviewer has already been added.");

      return;
    }

    setInterviewers((current) => [...current, cleanedName]);

    setInterviewerInput("");
  };

  // ======================================
  // REMOVE INTERVIEWER
  // ======================================

  const handleRemoveInterviewer = (interviewerToRemove) => {
    setInterviewers((current) =>
      current.filter((interviewer) => interviewer !== interviewerToRemove),
    );
  };

  // ======================================
  // ENTER KEY FOR INTERVIEWER
  // ======================================

  const handleInterviewerKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      handleAddInterviewer();
    }
  };

  // ======================================
  // INTERVIEW TYPE
  // ======================================

  const selectedInterviewType =
    interviewType === "Custom" ? customInterviewType.trim() : interviewType;

  // ======================================
  // FORM VALIDATION
  // ======================================

  const validateForm = () => {
    if (!interviewType) {
      toast.error("Please select an interview type.");

      return false;
    }

    if (interviewType === "Custom" && !customInterviewType.trim()) {
      toast.error("Enter the custom interview type.");

      return false;
    }

    if (!date) {
      toast.error("Please select an interview date.");

      return false;
    }

    if (!time) {
      toast.error("Please select an interview time.");

      return false;
    }

    if (interviewers.length === 0) {
      toast.error("Add at least one interviewer.");

      return false;
    }

    if (!mode) {
      toast.error("Please select an interview mode.");

      return false;
    }

    if (mode === "Online" && !meetingLink.trim()) {
      toast.error("Meeting link is required for an online interview.");

      return false;
    }

    if (mode === "Offline" && !location.trim()) {
      toast.error("Interview location is required for an offline interview.");

      return false;
    }

    return true;
  };

  // ======================================
  // SUBMIT
  // ======================================

  const handleScheduleInterview = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const token = getToken();

      if (!token) {
        toast.error("Company admin session not found.");

        navigate("/company-admin/login");
        return;
      }

      const payload = {
        interviewType: selectedInterviewType,

        interviewers,

        date,

        time,

        mode,

        meetingLink: mode === "Online" ? meetingLink.trim() : "",

        location: mode === "Offline" ? location.trim() : "",

        notes: notes.trim(),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/applications/${applicationId}/schedule-interview`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to schedule interview.");
      }

      toast.success("Interview scheduled successfully.");

      // ======================================
      // GO TO INTERVIEWS PAGE
      // ======================================

      setTimeout(() => {
        navigate("/company-admin/interviews");
      }, 700);
    } catch (error) {
      console.error("Schedule interview error:", error);

      toast.error(error.message || "Unable to schedule interview.");
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="scheduleInterviewPage">
        <AdminSidebar />

        <main className="scheduleInterviewMain">
          <div className="scheduleInterviewLoading">
            <div className="scheduleInterviewLoader">
              <Loader2 size={30} />
            </div>

            <h3>Loading application...</h3>

            <p>Please wait while we fetch the candidate details.</p>
          </div>
        </main>
      </div>
    );
  }

  // ======================================
  // APPLICATION NOT FOUND
  // ======================================

  if (!application) {
    return (
      <div className="scheduleInterviewPage">
        <AdminSidebar />

        <main className="scheduleInterviewMain">
          <div className="scheduleInterviewEmpty">
            <div className="scheduleInterviewEmptyIcon">
              <FileText size={28} />
            </div>

            <h2>Application not found</h2>

            <p>We couldn't find the selected candidate application.</p>

            <button
              type="button"
              className="scheduleBackButton"
              onClick={() => navigate("/company-admin/applications")}
            >
              <ArrowLeft size={18} />
              Back to Applications
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ======================================
  // MAIN UI
  // ======================================

  return (
    <div className="scheduleInterviewPage">
      <AdminSidebar />

      <main className="scheduleInterviewMain">
        {/* ======================================
            TOP BAR
        ====================================== */}

        <header className="scheduleInterviewTopbar">
          <button
            type="button"
            className="scheduleTopbarBack"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={19} />

            <span>Back</span>
          </button>

          <div className="scheduleTopbarRight">
            <button
              type="button"
              className="scheduleNotification"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="scheduleAdmin">
              <div className="scheduleAdminAvatar">
                {companyInitial}
              </div>

              <div className="scheduleAdminInfo">
                <strong>{companyName}</strong>
                <span>Company Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="scheduleInterviewContent">
          {/* ======================================
              PAGE HEADER
          ====================================== */}

          <section className="scheduleInterviewHeader">
            <div>
              <span className="scheduleEyebrow">Interview Management</span>

              <h1>Schedule Interview</h1>

              <p>
                Set up the interview details for the selected candidate.
              </p>
            </div>
          </section>

          {/* ======================================
              CANDIDATE CARD
          ====================================== */}

          <section className="scheduleCandidateCard">
            <div className="scheduleCandidateAvatar">
              {candidateInitial}
            </div>

            <div className="scheduleCandidateDetails">
              <div className="scheduleCandidateHeading">
                <h2>{candidateName}</h2>

                <span className="scheduleCandidateStatus">
                  {application.status}
                </span>
              </div>

              <div className="scheduleCandidateMeta">
                <span>
                  <BriefcaseBusiness size={15} />
                  {application.jobTitle || "Applied Position"}
                </span>

                {candidateEmail && (
                  <span>
                    <Mail size={15} />
                    {candidateEmail}
                  </span>
                )}

                {candidatePhone && (
                  <span>
                    <Phone size={15} />
                    {candidatePhone}
                  </span>
                )}

                {candidateLocation && (
                  <span>
                    <MapPin size={15} />
                    {candidateLocation}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ======================================
              FORM
          ====================================== */}

          <form
            className="scheduleInterviewForm"
            onSubmit={handleScheduleInterview}
          >
          {/* ======================================
              INTERVIEW DETAILS
          ====================================== */}

          <section className="scheduleFormCard">
            <div className="scheduleFormCardHeader">
              <div className="scheduleFormSectionIcon">
                <CalendarDays size={20} />
              </div>

              <div>
                <h2>Interview Details</h2>

                <p>Choose the interview type, date and time.</p>
              </div>
            </div>

            <div className="scheduleFormGrid">
              {/* INTERVIEW TYPE */}

              <div className="scheduleField">
                <label>
                  Interview Type
                  <span>*</span>
                </label>

                <div className="scheduleSelectWrapper">
                  <select
                    value={interviewType}
                    onChange={(event) => setInterviewType(event.target.value)}
                    className="scheduleInput"
                  >
                    {INTERVIEW_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={18} className="scheduleSelectIcon" />
                </div>
              </div>

              {/* CUSTOM TYPE */}

              {interviewType === "Custom" && (
                <div className="scheduleField">
                  <label>
                    Custom Interview Type
                    <span>*</span>
                  </label>

                  <div className="scheduleInputIconWrapper">
                    <FileText size={18} />

                    <input
                      type="text"
                      value={customInterviewType}
                      onChange={(event) =>
                        setCustomInterviewType(event.target.value)
                      }
                      placeholder="Enter interview type"
                      className="scheduleInput scheduleInputWithIcon"
                    />
                  </div>
                </div>
              )}

              {/* DATE */}

              <div className="scheduleField">
                <label>
                  Interview Date
                  <span>*</span>
                </label>

                <div className="scheduleInputIconWrapper">
                  <CalendarDays size={18} />

                  <input
                    type="date"
                    value={date}
                    min={minimumDate}
                    onChange={(event) => setDate(event.target.value)}
                    className="scheduleInput scheduleInputWithIcon"
                  />
                </div>
              </div>

              {/* TIME */}

              <div className="scheduleField">
                <label>
                  Interview Time
                  <span>*</span>
                </label>

                <div className="scheduleInputIconWrapper">
                  <Clock3 size={18} />

                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="scheduleInput scheduleInputWithIcon"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ======================================
              INTERVIEWERS
          ====================================== */}

          <section className="scheduleFormCard">
            <div className="scheduleFormCardHeader">
              <div className="scheduleFormSectionIcon">
                <Users size={20} />
              </div>

              <div>
                <h2>Interviewers</h2>

                <p>Add the people who will conduct this interview.</p>
              </div>
            </div>

            <div className="scheduleField">
              <label>
                Interviewers
                <span>*</span>
              </label>

              <div className="scheduleInterviewerInput">
                <div className="scheduleInputIconWrapper">
                  <UserRound size={18} />

                  <input
                    type="text"
                    value={interviewerInput}
                    onChange={(event) =>
                      setInterviewerInput(event.target.value)
                    }
                    onKeyDown={handleInterviewerKeyDown}
                    placeholder="Enter interviewer name"
                    className="scheduleInput scheduleInputWithIcon"
                  />
                </div>

                <button
                  type="button"
                  className="scheduleAddInterviewerButton"
                  onClick={handleAddInterviewer}
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>

              {interviewers.length > 0 && (
                <div className="scheduleInterviewerTags">
                  {interviewers.map((interviewer) => (
                    <div className="scheduleInterviewerTag" key={interviewer}>
                      <span>{interviewer}</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveInterviewer(interviewer)}
                        aria-label={`Remove ${interviewer}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ======================================
              INTERVIEW MODE
          ====================================== */}

          <section className="scheduleFormCard">
            <div className="scheduleFormCardHeader">
              <div className="scheduleFormSectionIcon">
                {mode === "Online" ? <Video size={20} /> : <MapPin size={20} />}
              </div>

              <div>
                <h2>Interview Mode</h2>

                <p>Choose how the interview will be conducted.</p>
              </div>
            </div>

            <div className="scheduleModeOptions">
              {INTERVIEW_MODES.map((interviewMode) => (
                <button
                  type="button"
                  key={interviewMode}
                  className={`scheduleModeOption ${
                    mode === interviewMode ? "active" : ""
                  }`}
                  onClick={() => setMode(interviewMode)}
                >
                  <div className="scheduleModeIcon">
                    {interviewMode === "Online" ? (
                      <Video size={20} />
                    ) : (
                      <MapPin size={20} />
                    )}
                  </div>

                  <div>
                    <strong>{interviewMode}</strong>

                    <span>
                      {interviewMode === "Online"
                        ? "Virtual interview"
                        : "In-person interview"}
                    </span>
                  </div>

                  <div className="scheduleModeRadio">
                    <span />
                  </div>
                </button>
              ))}
            </div>

            {/* ONLINE */}

            {mode === "Online" && (
              <div className="scheduleField scheduleModeField">
                <label>
                  Meeting Link
                  <span>*</span>
                </label>

                <div className="scheduleInputIconWrapper">
                  <LinkIcon size={18} />

                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(event) => setMeetingLink(event.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="scheduleInput scheduleInputWithIcon"
                  />
                </div>

                <small>
                  Add the meeting link the candidate should use to join.
                </small>
              </div>
            )}

            {/* OFFLINE */}

            {mode === "Offline" && (
              <div className="scheduleField scheduleModeField">
                <label>
                  Interview Location
                  <span>*</span>
                </label>

                <div className="scheduleInputIconWrapper">
                  <MapPin size={18} />

                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Office address or interview venue"
                    className="scheduleInput scheduleInputWithIcon"
                  />
                </div>

                <small>Provide the complete location for the candidate.</small>
              </div>
            )}
          </section>

          {/* ======================================
              NOTES
          ====================================== */}

          <section className="scheduleFormCard">
            <div className="scheduleFormCardHeader">
              <div className="scheduleFormSectionIcon">
                <FileText size={20} />
              </div>

              <div>
                <h2>Additional Notes</h2>

                <p>Add instructions or information for the candidate.</p>
              </div>
            </div>

            <div className="scheduleField">
              <label>Notes</label>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add interview instructions, preparation details, or any other information..."
                className="scheduleTextarea"
                rows={5}
              />

              <div className="scheduleCharacterCount">
                {notes.length} characters
              </div>
            </div>
          </section>

          {/* ======================================
              ACTIONS
          ====================================== */}

          <div className="scheduleFormActions">
            <button
              type="button"
              className="scheduleCancelButton"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="scheduleSubmitButton"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="scheduleButtonSpinner" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarDays size={18} />
                  Schedule Interview
                </>
              )}
            </button>
          </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ScheduleInterview;
