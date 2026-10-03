import { useEffect, useState } from "react";
import { X, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";

import JobCard from "../JobCard/JobCard";
import API_BASE_URL from "../../services/api";

import "./FeaturedJobs.css";

function FeaturedJobs() {
  const navigate = useNavigate();

  /* =====================================
     JOBS STATE
  ===================================== */

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  /* =====================================
     LOGIN MODAL STATE
  ===================================== */

  const [showLoginModal, setShowLoginModal] = useState(false);

  /* =====================================
     FETCH PUBLISHED JOBS
  ===================================== */

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/jobs`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch jobs");
      }

      /*
        Only show maximum
        6 jobs as featured jobs
      */

      setJobs((data.jobs || []).slice(0, 6));
    } catch (error) {
      console.error("Fetch featured jobs error:", error);
    } finally {
      setJobsLoading(false);
    }
  };

  /* =====================================
     LOAD JOBS
  ===================================== */

  useEffect(() => {
    fetchJobs();
  }, []);

  /* =====================================
     APPLY JOB
  ===================================== */

  const handleApply = (jobId) => {
    const candidateToken = localStorage.getItem("jobhubCandidateToken");

    if (!candidateToken) {
      setShowLoginModal(true);
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  /* =====================================
     CLOSE MODAL
  ===================================== */

  const closeModal = () => {
    setShowLoginModal(false);
  };

  /* =====================================
     GO TO LOGIN
  ===================================== */

  const goToLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  /* =====================================
     GO TO REGISTER
  ===================================== */

  const goToRegister = () => {
    setShowLoginModal(false);
    navigate("/register");
  };

  return (
    <>
      <section className="featuredJobs">
        <div className="container featuredJobsContainer">
          {/* =====================================
              HEADER
          ===================================== */}

          <div className="featuredJobsHeader">
            <h2>Featured Jobs</h2>

            <button
              type="button"
              className="viewAllJobsButton"
              onClick={() => navigate("/jobs")}
            >
              View All
            </button>
          </div>

          {/* =====================================
              LOADING
          ===================================== */}

          {jobsLoading && (
            <div className="featuredJobsLoading">Loading jobs...</div>
          )}

          {/* =====================================
              JOBS
          ===================================== */}

          {!jobsLoading && jobs.length > 0 && (
            <div className="featuredJobsGrid">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  id={job._id}
                  company={job.companyName}
                  logo={job.companyLogo}
                  title={job.jobTitle}
                  location={job.location}
                  type={job.jobType}
                  experience={job.experience}
                  skills={job.skills}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}

          {/* =====================================
              EMPTY STATE
          ===================================== */}

          {!jobsLoading && jobs.length === 0 && (
            <div className="featuredJobsEmpty">
              No jobs available right now.
            </div>
          )}
        </div>
      </section>

      {/* =====================================
          LOGIN REQUIRED MODAL
      ===================================== */}

      {showLoginModal && (
        <div className="loginRequiredOverlay" onClick={closeModal}>
          <div
            className="loginRequiredModal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="closeLoginModal"
              onClick={closeModal}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="loginRequiredIcon">
              <LockKeyhole size={25} />
            </div>

            <h2>Login Required</h2>

            <p>Please login or create an account to apply for this job.</p>

            <div className="loginRequiredActions">
              <button
                type="button"
                className="loginModalButton"
                onClick={goToLogin}
              >
                Login
              </button>

              <button
                type="button"
                className="registerModalButton"
                onClick={goToRegister}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FeaturedJobs;
