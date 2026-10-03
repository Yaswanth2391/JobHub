import { useEffect, useMemo, useState } from "react";
import { Building2, BriefcaseBusiness, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import LoadingAnimation from "../../../components/LoadingAnimation/LoadingAnimation";
import API_BASE_URL from "../../../services/api";
import jobhubAppIcon from "../../../assets/images/jobhub-app-icon.png";

import "../PublicPage.css";

function Companies() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
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
          throw new Error(data.message || "Unable to fetch companies");
        }

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (fetchError) {
        console.error("Public companies error:", fetchError);
        setError(fetchError.message || "Unable to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const companies = useMemo(() => {
    const map = new Map();

    jobs.forEach((job) => {
      const name = String(job.companyName || "Company").trim();
      const key = name.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          name,
          logo: job.companyLogo || "",
          location: job.location || "",
          jobs: 0,
        });
      }

      const company = map.get(key);
      company.jobs += 1;

      if (!company.logo && job.companyLogo) {
        company.logo = job.companyLogo;
      }

      if (!company.location && job.location) {
        company.location = job.location;
      }
    });

    const normalizedQuery = query.trim().toLowerCase();

    return Array.from(map.values())
      .filter((company) =>
        !normalizedQuery || company.name.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [jobs, query]);

  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageHero">
        <div className="publicPageContainer">
          <div className="publicPageHeroContent">
            <span className="publicPageEyebrow">
              <Building2 size={14} />
              Companies on JobHub
            </span>

            <h1 className="publicPageTitle">Explore companies hiring through JobHub.</h1>

            <p className="publicPageLead">
              Discover companies represented by jobs currently published on the platform.
              Open a company to see its available opportunities.
            </p>
          </div>
        </div>
      </section>

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div style={{ position: "relative", marginBottom: "26px" }}>
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
              placeholder="Search companies..."
            />
          </div>

          {loading && <LoadingAnimation label="Loading companies on JobHub..." />}

          {!loading && error && <div className="publicError">{error}</div>}

          {!loading && !error && companies.length === 0 && (
            <div className="publicEmpty">
              No companies with published jobs are available yet.
            </div>
          )}

          {!loading && !error && companies.length > 0 && (
            <div className="publicCompaniesGrid">
              {companies.map((company) => (
                <article className="publicCompanyCard" key={company.name}>
                  <div className="publicCompanyLogo">
                    <img
                      src={company.logo || jobhubAppIcon}
                      alt={`${company.name} logo`}
                      onError={(event) => {
                        event.currentTarget.src = jobhubAppIcon;
                      }}
                    />
                  </div>

                  <h3>{company.name}</h3>

                  <div className="publicCompanyMeta">
                    <span>
                      <BriefcaseBusiness size={14} />
                      {company.jobs} {company.jobs === 1 ? "job" : "jobs"}
                    </span>

                    {company.location && (
                      <span>
                        <MapPin size={14} />
                        {company.location}
                      </span>
                    )}
                  </div>

                  <Link
                    className="publicSecondaryButton"
                    to={`/jobs?company=${encodeURIComponent(company.name)}`}
                  >
                    View Jobs
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Companies;
