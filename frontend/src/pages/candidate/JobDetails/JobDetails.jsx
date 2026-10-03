import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  BriefcaseBusiness,
  IndianRupee,
  Clock3,
  Building2,
  CalendarDays,
  Send,
  FileText,
  LoaderCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import API_BASE_URL from "../../../services/api";

import "./JobDetails.css";

function JobDetails() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  /* =====================================
     JOB STATE
  ===================================== */

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState("");

  /* =====================================
     CANDIDATE PROFILE STATE
  ===================================== */

  const [candidateProfile, setCandidateProfile] =
    useState(null);

  const [candidateLoading, setCandidateLoading] =
    useState(true);

  /* =====================================
     APPLICATION FORM STATE
  ===================================== */

  const [applicationData, setApplicationData] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      experience: "",
      coverLetter: "",
    });

  /* =====================================
     MESSAGE STATE
  ===================================== */

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  /* =====================================
     SUBMIT LOADING STATE
  ===================================== */

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =====================================
     LOAD JOB DETAILS
  ===================================== */

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setJobLoading(true);
        setJobError("");

        const response = await fetch(
          `${API_BASE_URL}/api/jobs/${jobId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load job details."
          );
        }

        setJob(data.job);
      } catch (error) {
        console.error(
          "Fetch job details error:",
          error
        );

        setJobError(
          error.message ||
            "Unable to load job details."
        );
      } finally {
        setJobLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  /* =====================================
     LOAD LOGGED-IN CANDIDATE PROFILE
  ===================================== */

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        setCandidateLoading(true);

        const token =
          localStorage.getItem(
            "jobhubCandidateToken"
          );

        /*
          If the candidate is not logged in,
          we don't need to call the profile API.
        */

        if (!token) {
          setCandidateLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/candidate/profile`,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load candidate profile."
          );
        }

        const candidate =
          data.candidate;

        setCandidateProfile(candidate);

        /*
          Fill application form with
          candidate's registered details.
        */

        setApplicationData(
          (previousData) => ({
            ...previousData,

            fullName:
              candidate.fullName || "",

            email:
              candidate.email || "",

            phone:
              candidate.phone || "",
          })
        );
      } catch (error) {
        console.error(
          "Fetch candidate profile error:",
          error
        );

        /*
          Fallback to localStorage so the
          existing application experience
          still works if profile request fails.
        */

        const storedCandidate =
          localStorage.getItem(
            "jobhubCandidate"
          );

        if (storedCandidate) {
          try {
            const candidate =
              JSON.parse(
                storedCandidate
              );

            setCandidateProfile(
              candidate
            );

            setApplicationData(
              (previousData) => ({
                ...previousData,

                fullName:
                  candidate.fullName ||
                  "",

                email:
                  candidate.email ||
                  "",

                phone:
                  candidate.phone ||
                  "",
              })
            );
          } catch (storageError) {
            console.error(
              "Unable to load stored candidate:",
              storageError
            );
          }
        }
      } finally {
        setCandidateLoading(false);
      }
    };

    fetchCandidateProfile();
  }, []);

  /* =====================================
     HANDLE INPUT CHANGE
  ===================================== */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setApplicationData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );

    setMessage({
      type: "",
      text: "",
    });
  };

  /* =====================================
     OPEN EXISTING RESUME
  ===================================== */

  const handleViewResume = () => {
    if (
      candidateProfile?.resume?.url
    ) {
      window.open(
        candidateProfile.resume.url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  /* =====================================
     SUBMIT APPLICATION
  ===================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!job) {
      return;
    }

    setMessage({
      type: "",
      text: "",
    });

    try {
      const token =
        localStorage.getItem(
          "jobhubCandidateToken"
        );

      /* ==================================
         USER NOT LOGGED IN
      ================================== */

      if (!token) {
        setMessage({
          type: "error",

          text:
            "Please login first to apply for this job.",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1200);

        return;
      }

      /* ==================================
         RESUME CHECK
      ================================== */

      if (
        !candidateProfile?.resume?.url
      ) {
        setMessage({
          type: "error",

          text:
            "Please upload your resume from your Profile before applying.",
        });

        return;
      }

      setIsSubmitting(true);

      /* ==================================
         APPLY API
      ================================== */

      const response = await fetch(
        `${API_BASE_URL}/api/candidates/applications/apply`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            jobId: job._id,

            jobTitle:
              job.jobTitle,

            companyName:
              job.companyName,

            companyLogo:
              job.companyLogo,

            location:
              job.location,

            fullName:
              applicationData.fullName,

            email:
              applicationData.email,

            phone:
              applicationData.phone,

            experience:
              applicationData.experience,

            coverLetter:
              applicationData.coverLetter,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit application."
        );
      }

      /* ==================================
         SUCCESS
      ================================== */

      setMessage({
        type: "success",

        text:
          data.message ||
          "Application submitted successfully!",
      });

      /*
        Keep candidate personal details
        and resume information.

        Only clear fields that should be
        entered separately for each job.
      */

      setApplicationData(
        (previousData) => ({
          ...previousData,

          experience: "",

          coverLetter: "",
        })
      );
    } catch (error) {
      console.error(
        "Application error:",
        error
      );

      setMessage({
        type: "error",

        text:
          error.message ||
          "Unable to connect to the server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =====================================
     FORMAT DATE
  ===================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const formattedDate =
      new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "Not specified";
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

  /* =====================================
     FORMAT JOB DESCRIPTION
  ===================================== */

  const formatDescription = (text) => {
    if (!text) {
      return [];
    }

    let normalizedText = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");

    normalizedText =
      normalizedText.replace(
        /\s+(About the Role|Roles & Responsibilities|Required Skills|Qualifications|Responsibilities|Benefits)\s*:/gi,
        "\n$1:"
      );

    normalizedText =
      normalizedText.replace(
        /\s*\*\s+/g,
        "\n"
      );

    normalizedText =
      normalizedText.replace(
        /[ \t]+/g,
        " "
      );

    normalizedText =
      normalizedText.replace(
        /\n{2,}/g,
        "\n"
      );

    return normalizedText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  /* =====================================
     LOADING STATE
  ===================================== */

  if (jobLoading) {
    return (
      <main className="jobDetailsPage">
        <div className="jobDetailsLoading">
          <LoaderCircle
            size={35}
            className="loadingIcon"
          />

          <p>
            Loading job details...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================
     ERROR STATE
  ===================================== */

  if (jobError || !job) {
    return (
      <main className="jobDetailsPage">
        <div className="jobDetailsError">
          <h2>
            Unable to load job details
          </h2>

          <p>
            {jobError ||
              "Job not found."}
          </p>

          <button
            type="button"
            className="backToJobsButton"
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeft size={18} />

            Go Back
          </button>
        </div>
      </main>
    );
  }

  /* =====================================
     JOB DATA
  ===================================== */

  const companyName =
    job.companyName ||
    "Company";

  const companyLogo =
    job.companyLogo || "";

  const jobTitle =
    job.jobTitle ||
    "Job Title";

  const jobType =
    job.jobType ||
    "Not specified";

  const location =
    job.location ||
    "Not specified";

  const experience =
    job.experience ||
    "Not specified";

  const description =
    job.description ||
    "Job description not specified.";

  const skills =
    Array.isArray(job.skills)
      ? job.skills
      : [];

  const department =
    job.department ||
    "Not specified";

  const openings =
    job.openings ||
    "Not specified";

  const applicationDeadline =
    job.applicationDeadline;

  const descriptionBlocks =
    formatDescription(description);

  const hasResume =
    Boolean(
      candidateProfile?.resume?.url
    );

  /* =====================================
     RETURN
  ===================================== */

  return (
    <main className="jobDetailsPage">

      {/* =====================================
          TOP SECTION
      ===================================== */}

      <section className="jobDetailsHero">
        <div className="container jobDetailsContainer">

          {/* BACK BUTTON */}

          <button
            type="button"
            className="backToJobsButton"
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeft size={18} />

            Back to Jobs
          </button>

          {/* JOB HERO CARD */}

          <div className="jobDetailsHeroCard">

            {/* COMPANY LOGO */}

            <div className="jobDetailsCompanyLogo">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                />
              ) : (
                <Building2
                  size={35}
                />
              )}
            </div>

            {/* JOB INFORMATION */}

            <div className="jobDetailsHeroInfo">

              <span className="jobDetailsCompany">
                {companyName}
              </span>

              <h1>
                {jobTitle}
              </h1>

              <div className="jobDetailsMeta">

                <span>
                  <MapPin size={16} />

                  {location}
                </span>

                <span>
                  <BriefcaseBusiness
                    size={16}
                  />

                  {jobType}
                </span>

                <span>
                  <Clock3 size={16} />

                  {experience}
                </span>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <section className="jobDetailsContent">
        <div className="container jobDetailsContainer">

          <div className="jobDetailsLayout">

            {/* =================================
                LEFT CONTENT
            ================================= */}

            <div className="jobDetailsMain">

              {/* ABOUT JOB */}

              <div className="jobDetailsSection">

                <h2>
                  About the Job
                </h2>

                <div className="jobDescriptionContent">

                  {descriptionBlocks.map(
                    (block, index) => {

                      const headingMatch =
                        block.match(
                          /^(About the Role|Roles & Responsibilities|Required Skills|Qualifications|Responsibilities|Benefits)\s*:\s*(.*)$/i
                        );

                      /* SECTION HEADING */

                      if (headingMatch) {
                        return (
                          <div
                            className="jobDescriptionSection"
                            key={`description-section-${index}`}
                          >

                            <h3>
                              {
                                headingMatch[1]
                              }
                            </h3>

                            {headingMatch[2] && (
                              <p>
                                {
                                  headingMatch[2]
                                }
                              </p>
                            )}

                          </div>
                        );
                      }

                      /* FIRST INTRODUCTION */

                      if (index === 0) {
                        return (
                          <p
                            className="jobDescriptionIntro"
                            key={`description-intro-${index}`}
                          >
                            {block}
                          </p>
                        );
                      }

                      /* BULLET */

                      return (
                        <div
                          className="jobDescriptionBullet"
                          key={`description-bullet-${index}`}
                        >

                          <span className="jobDescriptionBulletMark">
                            •
                          </span>

                          <p>
                            {block}
                          </p>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* REQUIRED SKILLS */}

              <div className="jobDetailsSection">

                <h2>
                  Required Skills
                </h2>

                <div className="jobDetailsSkills">

                  {skills.length > 0 ? (
                    skills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                        >
                          {skill}
                        </span>
                      )
                    )
                  ) : (
                    <p>
                      Skills not specified.
                    </p>
                  )}

                </div>

              </div>

            </div>

            {/* =================================
                RIGHT SIDEBAR
            ================================= */}

            <aside className="jobDetailsSidebar">

              <div className="jobOverviewCard">

                <h3>
                  Job Overview
                </h3>

                {/* LOCATION */}

                <div className="jobOverviewItem">

                  <MapPin size={18} />

                  <div>

                    <span>
                      Location
                    </span>

                    <strong>
                      {location}
                    </strong>

                  </div>

                </div>

                {/* JOB TYPE */}

                <div className="jobOverviewItem">

                  <BriefcaseBusiness
                    size={18}
                  />

                  <div>

                    <span>
                      Job Type
                    </span>

                    <strong>
                      {jobType}
                    </strong>

                  </div>

                </div>

                {/* EXPERIENCE */}

                <div className="jobOverviewItem">

                  <Clock3 size={18} />

                  <div>

                    <span>
                      Experience
                    </span>

                    <strong>
                      {experience}
                    </strong>

                  </div>

                </div>

                {/* DEPARTMENT */}

                <div className="jobOverviewItem">

                  <BriefcaseBusiness
                    size={18}
                  />

                  <div>

                    <span>
                      Department
                    </span>

                    <strong>
                      {department}
                    </strong>

                  </div>

                </div>

                {/* OPENINGS */}

                <div className="jobOverviewItem">

                  <IndianRupee
                    size={18}
                  />

                  <div>

                    <span>
                      Openings
                    </span>

                    <strong>
                      {openings}
                    </strong>

                  </div>

                </div>

                {/* COMPANY */}

                <div className="jobOverviewItem">

                  <Building2 size={18} />

                  <div>

                    <span>
                      Company
                    </span>

                    <strong>
                      {companyName}
                    </strong>

                  </div>

                </div>

                {/* POSTED */}

                <div className="jobOverviewItem">

                  <CalendarDays
                    size={18}
                  />

                  <div>

                    <span>
                      Posted
                    </span>

                    <strong>
                      {formatDate(
                        job.createdAt
                      )}
                    </strong>

                  </div>

                </div>

                {/* DEADLINE */}

                <div className="jobOverviewItem">

                  <CalendarDays
                    size={18}
                  />

                  <div>

                    <span>
                      Apply Before
                    </span>

                    <strong>
                      {formatDate(
                        applicationDeadline
                      )}
                    </strong>

                  </div>

                </div>

              </div>

            </aside>

          </div>

          {/* =====================================
              APPLICATION FORM
          ===================================== */}

          <section className="jobApplicationSection">

            {/* APPLICATION HEADER */}

            <div className="jobApplicationHeader">

              <div className="jobApplicationIcon">
                <FileText size={22} />
              </div>

              <div>

                <h2>
                  Apply for this Job
                </h2>

                <p>
                  Complete the form below to submit
                  your application for this position.
                </p>

              </div>

            </div>

            {/* SUCCESS / ERROR MESSAGE */}

            {message.text && (
              <div
                className={`jobApplicationMessage ${message.type}`}
              >
                {message.text}
              </div>
            )}

            {/* APPLICATION FORM */}

            <form
              className="jobApplicationForm"
              onSubmit={handleSubmit}
            >

              <div className="jobApplicationGrid">

                {/* FULL NAME */}

                <div className="jobApplicationGroup">

                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={
                      applicationData.fullName
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="jobApplicationGroup">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={
                      applicationData.email
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* PHONE */}

                <div className="jobApplicationGroup">

                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={
                      applicationData.phone
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* EXPERIENCE */}

                <div className="jobApplicationGroup">

                  <label htmlFor="experience">
                    Total Experience
                  </label>

                  <input
                    id="experience"
                    name="experience"
                    type="text"
                    placeholder="Example: 1 Year"
                    value={
                      applicationData.experience
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* =================================
                  RESUME
              ================================= */}

              <div className="jobApplicationResume">

                <div className="jobApplicationResumeHeader">

                  <div className="jobApplicationResumeIcon">
                    <FileText size={20} />
                  </div>

                  <div>

                    <h3>
                      Resume
                    </h3>

                    <p>
                      Your resume will be used for
                      ATS evaluation.
                    </p>

                  </div>

                </div>

                {candidateLoading ? (
                  <div className="jobApplicationResumeLoading">

                    <LoaderCircle
                      size={20}
                      className="loadingIcon"
                    />

                    <span>
                      Checking your resume...
                    </span>

                  </div>
                ) : hasResume ? (
                  <div className="jobApplicationResumeCard">

                    <div className="jobApplicationResumeInfo">

                      <FileText
                        size={22}
                      />

                      <div>

                        <strong>
                          {
                            candidateProfile
                              ?.resume
                              ?.name ||
                            "Resume.pdf"
                          }
                        </strong>

                        <span>
                          Resume uploaded to your
                          profile
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="jobApplicationViewResume"
                      onClick={
                        handleViewResume
                      }
                    >
                      <ExternalLink
                        size={16}
                      />

                      View Resume
                    </button>

                  </div>
                ) : (
                  <div className="jobApplicationNoResume">

                    <div className="jobApplicationNoResumeIcon">
                      <AlertCircle
                        size={20}
                      />
                    </div>

                    <div>

                      <strong>
                        Resume required
                      </strong>

                      <p>
                        Please upload your PDF resume
                        from your Profile before
                        applying.
                      </p>

                      <button
                        type="button"
                        className="jobApplicationUploadResume"
                        onClick={() =>
                          navigate(
                            "/profile"
                          )
                        }
                      >
                        Upload Resume
                      </button>

                    </div>

                  </div>
                )}

              </div>

              {/* =================================
                  ATS INFORMATION
              ================================= */}

              <div className="jobApplicationATSInfo">

                <div className="jobApplicationATSIcon">
                  <CheckCircle2
                    size={20}
                  />
                </div>

                <div>

                  <strong>
                    ATS Evaluation
                  </strong>

                  <p>
                    Your uploaded resume will be
                    automatically evaluated against
                    the requirements of this job.
                    The ATS checks skills, experience,
                    resume structure, role relevance,
                    and education.
                  </p>

                </div>

              </div>

              {/* COVER LETTER */}

              <div className="jobApplicationGroup">

                <label htmlFor="coverLetter">
                  Cover Letter
                </label>

                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  placeholder="Tell the company why you are a good fit for this role..."
                  value={
                    applicationData.coverLetter
                  }
                  onChange={handleChange}
                  rows="7"
                  required
                />

              </div>

              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                className="submitApplicationButton"
                disabled={
                  isSubmitting ||
                  candidateLoading ||
                  !hasResume
                }
              >

                {isSubmitting ? (
                  <LoaderCircle
                    size={18}
                  />
                ) : (
                  <Send size={18} />
                )}

                {isSubmitting
                  ? "Submitting..."
                  : "Submit Application"}

              </button>

            </form>

          </section>

        </div>
      </section>

    </main>
  );
}

export default JobDetails;