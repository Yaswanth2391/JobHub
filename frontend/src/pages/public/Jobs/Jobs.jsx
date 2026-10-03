import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import LoadingAnimation from "../../../components/LoadingAnimation/LoadingAnimation";
import JobCard from "../../../components/JobCard/JobCard";
import API_BASE_URL from "../../../services/api";

import "../PublicPage.css";

function Jobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState(searchParams.get("q") || searchParams.get("company") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [experience, setExperience] = useState(searchParams.get("experience") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [workMode, setWorkMode] = useState(searchParams.get("workMode") || "");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/jobs`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to fetch jobs");
        }

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (fetchError) {
        console.error("Public jobs error:", fetchError);
        setError(fetchError.message || "Unable to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const normalizedLocation = location.trim().toLowerCase();
    const normalizedExperience = experience.trim().toLowerCase();
    const normalizedCity = city.trim().toLowerCase();
    const normalizedWorkMode = workMode.trim().toLowerCase();

    return jobs.filter((job) => {
      const searchableText = [
        job.jobTitle,
        job.companyName,
        job.department,
        job.location,
        job.experience,
        ...(Array.isArray(job.skills) ? job.skills : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const jobLocation = String(job.location || "").toLowerCase();
      const jobExperience = String(job.experience || "").toLowerCase();
      const jobTypeValue = String(job.jobType || "").toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      const matchesLocation =
        !normalizedLocation || jobLocation.includes(normalizedLocation);

      const matchesExperience =
        !normalizedExperience || jobExperience.includes(normalizedExperience);

      const matchesCity =
        !normalizedCity || jobLocation.includes(normalizedCity);

      const matchesWorkMode =
        !normalizedWorkMode ||
        jobTypeValue === normalizedWorkMode ||
        (normalizedWorkMode === "remote" && jobTypeValue === "remote");

      const matchesType =
        jobType === "All" || job.jobType === jobType;

      return (
        matchesQuery &&
        matchesLocation &&
        matchesExperience &&
        matchesCity &&
        matchesWorkMode &&
        matchesType
      );
    });
  }, [jobs, query, location, experience, city, workMode, jobType]);

  const handleApply = (jobId) => {
    const candidateToken = localStorage.getItem("jobhubCandidateToken");

    if (!candidateToken) {
      navigate("/login", { state: { from: `/jobs/${jobId}` } });
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageHero">
        <div className="publicPageContainer">
          <div className="publicPageHeroContent">
            <span className="publicPageEyebrow">
              <BriefcaseBusiness size={14} />
              Explore opportunities
            </span>

            <h1 className="publicPageTitle">Find jobs that move your career forward.</h1>

            <p className="publicPageLead">
              Browse the jobs currently published on JobHub. Search by title, company,
              location, department, experience, or skills.
            </p>
          </div>
        </div>
      </section>

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div className="publicJobsToolbar">
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "15px",
                  color: "#94a3b8",
                }}
              />
              <input
                className="publicJobsSearch"
                style={{ paddingLeft: "42px" }}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search jobs, companies, skills..."
              />
            </div>

            <input
              className="publicJobsSearch"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location"
              aria-label="Search by location"
            />

            <input
              className="publicJobsSearch"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              placeholder="Experience"
              aria-label="Search by experience"
            />

            <input
              className="publicJobsSearch"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="City"
              aria-label="Search by city"
            />

            <select
              className="publicJobsSelect"
              value={workMode}
              onChange={(event) => setWorkMode(event.target.value)}
              aria-label="Filter by work mode"
            >
              <option value="">All Work Modes</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              className="publicJobsSelect"
              value={jobType}
              onChange={(event) => setJobType(event.target.value)}
              aria-label="Filter by job type"
            >
              <option value="All">All Job Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {loading && <LoadingAnimation label="Finding fresh JobHub opportunities..." />}

          {!loading && error && <div className="publicError">{error}</div>}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="publicEmpty">
              No jobs match your current search or filter.
            </div>
          )}

          {!loading && !error && filteredJobs.length > 0 && (
            <div className="publicJobsGrid">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  _id={job._id}
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
        </div>
      </section>
    </main>
  );
}

export default Jobs;
