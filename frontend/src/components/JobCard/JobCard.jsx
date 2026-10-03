import {
  MapPin,
  BriefcaseBusiness,
  Bookmark,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import API_BASE_URL from "../../services/api";

import jobhubAppIcon from "../../assets/images/jobhub-app-icon.png";

import "./JobCard.css";

function JobCard({
  id,
  _id,
  company,
  logo,
  title,
  location,
  type,
  experience,
  skills,
  onApply,
}) {
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);

  const [saving, setSaving] = useState(false);

  const [logoSrc, setLogoSrc] = useState(
    logo || jobhubAppIcon
  );

  // =====================================
  // JOB ID
  // =====================================

  const jobId = _id || id;

  // True only for MongoDB jobs
  const isDatabaseJob = Boolean(_id);

  // =====================================
  // UPDATE LOGO WHEN PROP CHANGES
  // =====================================

  useEffect(() => {
    setLogoSrc(
      logo || jobhubAppIcon
    );
  }, [logo]);

  // =====================================
  // CHECK SAVED JOB STATUS
  // =====================================

  useEffect(() => {
    const checkSavedJob = async () => {
      try {
        const token = localStorage.getItem(
          "jobhubCandidateToken"
        );

        // Static jobs should not call backend
        if (!token || !isDatabaseJob) {
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/candidates/saved-jobs/check/${jobId}`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setIsSaved(Boolean(data.isSaved));
        }
      } catch (error) {
        console.error(
          "Check saved job error:",
          error
        );
      }
    };

    checkSavedJob();
  }, [jobId, isDatabaseJob]);

  // =====================================
  // SAVE / REMOVE JOB
  // =====================================

  const handleSaveJob = async () => {
    try {
      const token = localStorage.getItem(
        "jobhubCandidateToken"
      );

      if (!token) {
        alert("Please login to save jobs");

        navigate("/login");

        return;
      }

      // Static jobs cannot be saved in MongoDB
      if (!isDatabaseJob) {
        alert(
          "This job is currently not available for saving."
        );

        return;
      }

      setSaving(true);

      let response;

      if (isSaved) {
        response = await fetch(
          `${API_BASE_URL}/api/candidates/saved-jobs/${jobId}`,
          {
            method: "DELETE",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await fetch(
          `${API_BASE_URL}/api/candidates/saved-jobs`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              jobId: jobId,
            }),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update saved job"
        );
      }

      setIsSaved((previous) => !previous);
    } catch (error) {
      console.error(
        "Save job error:",
        error
      );

      alert(
        error.message ||
          "Unable to save job"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // APPLY NOW
  // =====================================

  const handleApply = () => {
    /*
      FeaturedJobs already provides onApply
      so that login validation/modal works.
    */

    if (typeof onApply === "function") {
      onApply(jobId);
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  // =====================================
  // LOGO ERROR FALLBACK
  // =====================================

  const handleLogoError = () => {
    setLogoSrc(jobhubAppIcon);
  };

  // =====================================
  // SKILLS
  // =====================================

  const normalizedSkills = Array.isArray(skills)
    ? skills.filter(Boolean)
    : [];

  const visibleSkills =
    normalizedSkills.slice(0, 4);

  const remainingSkills =
    Math.max(
      normalizedSkills.length - 4,
      0
    );

  // =====================================
  // SAFE DISPLAY VALUES
  // =====================================

  const companyName =
    company || "Company";

  const jobTitle =
    title || "Job Title";

  const jobLocation =
    location || "Not specified";

  const jobType =
    type || "Not specified";

  const jobExperience =
    experience || "Experience not specified";

  return (
    <article className="jobCard">
      {/* =====================================
          TOP SECTION
      ===================================== */}

      <div className="jobCardTop">
        {/* COMPANY LOGO */}

        <div className="jobCompanyLogo">
          <img
            src={logoSrc}
            alt={`${companyName} logo`}
            onError={handleLogoError}
          />
        </div>

        {/* JOB INFORMATION */}

        <div className="jobMainInfo">
          <h3 title={jobTitle}>
            {jobTitle}
          </h3>

          <p
            className="jobCompanyName"
            title={companyName}
          >
            {companyName}
          </p>
        </div>

        {/* SAVE JOB BUTTON */}

        <button
          type="button"
          className={`saveJobButton ${
            isSaved
              ? "saveJobButtonActive"
              : ""
          }`}
          onClick={handleSaveJob}
          disabled={saving}
          aria-label={
            isSaved
              ? "Remove saved job"
              : "Save job"
          }
          title={
            isSaved
              ? "Remove from saved jobs"
              : "Save job"
          }
        >
          <Bookmark
            size={18}
            fill={
              isSaved
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      {/* =====================================
          JOB DETAILS
      ===================================== */}

      <div className="jobDetails">
        <span title="Location">
          <MapPin size={13} />
          <span>{jobLocation}</span>
        </span>

        <span title="Job type">
          <BriefcaseBusiness size={13} />
          <span>{jobType}</span>
        </span>

        <span title="Experience">
          <Clock3 size={13} />
          <span>{jobExperience}</span>
        </span>
      </div>

      {/* =====================================
          SKILLS
      ===================================== */}

      {visibleSkills.length > 0 && (
        <div className="jobSkills">
          {visibleSkills.map(
            (skill, index) => (
              <span key={`${skill}-${index}`}>
                {skill}
              </span>
            )
          )}

          {remainingSkills > 0 && (
            <span className="jobMoreSkills">
              +{remainingSkills}
            </span>
          )}
        </div>
      )}

      {/* =====================================
          APPLY BUTTON
      ===================================== */}

      <button
        type="button"
        className="jobApplyButton"
        onClick={handleApply}
      >
        <span>Apply Now</span>

        <ArrowUpRight size={16} />
      </button>
    </article>
  );
}

export default JobCard;