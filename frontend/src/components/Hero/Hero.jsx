import { useEffect, useState } from "react";

import {
  Search,
  MapPin,
  BriefcaseBusiness,
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
} from "lucide-react";

import API_BASE_URL from "../../services/api";

import { useNavigate } from "react-router-dom";

import heroImage from "../../assets/images/hero.png";

import "./Hero.css";

function Hero() {
  const navigate = useNavigate();

  /* =========================================
     PLATFORM STATS
  ========================================= */

  const [stats, setStats] = useState({
    jobsPosted: 0,
    companies: 0,
    registeredUsers: 0,
    hires: 0,
  });

  const [statsLoading, setStatsLoading] =
    useState(true);

  /* =========================================
     MAIN SEARCH
  ========================================= */

  const [keyword, setKeyword] = useState("");

  const [location, setLocation] =
    useState("");

  /* =========================================
     ADVANCED FILTERS
  ========================================= */

  const [showFilters, setShowFilters] =
    useState(false);

  const [filters, setFilters] = useState({
    salaryMin: "",
    salaryMax: "",
    experience: "",
    fresher: false,
    city: "",
    workMode: "",
    jobType: "",
  });

  /* =========================================
     FETCH REAL PLATFORM STATS
  ========================================= */

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        setStatsLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/jobs/stats`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to fetch platform statistics",
          );
        }

        setStats({
          jobsPosted: Number(
            data.stats?.jobsPosted || 0,
          ),

          companies: Number(
            data.stats?.companies || 0,
          ),

          registeredUsers: Number(
            data.stats?.registeredUsers || 0,
          ),

          hires: Number(
            data.stats?.hires || 0,
          ),
        });
      } catch (error) {
        console.error(
          "Hero Stats Error:",
          error,
        );

        setStats({
          jobsPosted: 0,
          companies: 0,
          registeredUsers: 0,
          hires: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPlatformStats();
  }, []);

  /* =========================================
     UPDATE FILTER
  ========================================= */

  const updateFilter = (
    field,
    value,
  ) => {
    setFilters((previousFilters) => ({
      ...previousFilters,

      [field]: value,
    }));
  };

  /* =========================================
     ACTIVE FILTER COUNT
  ========================================= */

  const activeFilterCount =
    [
      filters.salaryMin,
      filters.salaryMax,
      filters.experience,
      filters.fresher,
      filters.city,
      filters.workMode,
      filters.jobType,
    ].filter(Boolean).length;

  /* =========================================
     SEARCH DATA
  ========================================= */

  const getSearchData = () => {
    return {
      keyword:
        keyword.trim(),

      location:
        location.trim(),

      salaryMin:
        filters.salaryMin,

      salaryMax:
        filters.salaryMax,

      experience:
        filters.experience,

      fresher:
        filters.fresher,

      city:
        filters.city.trim(),

      workMode:
        filters.workMode,

      jobType:
        filters.jobType,
    };
  };

  /* =========================================
     SEARCH
  ========================================= */

  const handleSearch = () => {
    const searchData =
      getSearchData();

    try {
      localStorage.setItem(
        "jobhubJobSearchFilters",
        JSON.stringify(searchData),
      );

      window.dispatchEvent(
        new CustomEvent(
          "jobhub:jobSearchChanged",
          {
            detail: searchData,
          },
        ),
      );
    } catch (error) {
      console.error(
        "Unable to save job search filters:",
        error,
      );
    }

    const params = new URLSearchParams();

    if (searchData.keyword) {
      params.set("q", searchData.keyword);
    }

    if (searchData.location) {
      params.set("location", searchData.location);
    }

    if (searchData.experience) {
      params.set("experience", searchData.experience);
    }

    if (searchData.city) {
      params.set("city", searchData.city);
    }

    if (searchData.workMode) {
      params.set("workMode", searchData.workMode);
    }

    if (searchData.jobType) {
      params.set("jobType", searchData.jobType);
    }

    const searchQuery = params.toString();

    navigate(searchQuery ? `/jobs?${searchQuery}` : "/jobs");
  };

  /* =========================================
     RESET FILTERS
  ========================================= */

  const handleResetFilters =
    () => {
      const resetFilters = {
        salaryMin: "",
        salaryMax: "",
        experience: "",
        fresher: false,
        city: "",
        workMode: "",
        jobType: "",
      };

      setFilters(
        resetFilters,
      );

      const searchData = {
        keyword:
          keyword.trim(),

        location:
          location.trim(),

        ...resetFilters,
      };

      try {
        localStorage.setItem(
          "jobhubJobSearchFilters",
          JSON.stringify(searchData),
        );

        window.dispatchEvent(
          new CustomEvent(
            "jobhub:jobSearchChanged",
            {
              detail: searchData,
            },
          ),
        );
      } catch (error) {
        console.error(
          "Unable to reset job search filters:",
          error,
        );
      }
    };

  /* =========================================
     CLEAR EVERYTHING
  ========================================= */

  const handleClearAll = () => {
    setKeyword("");

    setLocation("");

    const resetFilters = {
      salaryMin: "",
      salaryMax: "",
      experience: "",
      fresher: false,
      city: "",
      workMode: "",
      jobType: "",
    };

    setFilters(
      resetFilters,
    );

    try {
      localStorage.removeItem(
        "jobhubJobSearchFilters",
      );

      window.dispatchEvent(
        new CustomEvent(
          "jobhub:jobSearchChanged",
          {
            detail: {
              keyword: "",
              location: "",
              ...resetFilters,
            },
          },
        ),
      );
    } catch (error) {
      console.error(
        "Unable to clear job search:",
        error,
      );
    }
  };

  /* =========================================
     ENTER KEY SEARCH
  ========================================= */

  const handleKeywordKeyDown =
    (event) => {
      if (
        event.key ===
        "Enter"
      ) {
        handleSearch();
      }
    };

  const handleLocationKeyDown =
    (event) => {
      if (
        event.key ===
        "Enter"
      ) {
        handleSearch();
      }
    };

  /* =========================================
     NUMBER FORMAT
  ========================================= */

  const formatNumber =
    (value) => {
      return new Intl.NumberFormat(
        "en-IN",
      ).format(value);
    };

  /* =========================================
     HERO
  ========================================= */

  return (
    <section className="heroSection">

      <div className="heroContainer">

        {/* =====================================
            LEFT SIDE
        ===================================== */}

        <div className="heroContent">

          {/* HERO TITLE */}

          <h1 className="heroTitle">

            <span>
              Find the right job.
            </span>

            <span>
              <strong>
                Build your future.
              </strong>
            </span>

          </h1>

          {/* DESCRIPTION */}

          <p className="heroDescription">
            Discover jobs from growing
            companies and leading
            organizations. Search by role,
            skills, company, location and more.
          </p>

          {/* =================================
              SEARCH WRAPPER
          ================================= */}

          <div className="heroSearchWrapper">

            {/* SEARCH BAR */}

            <div className="heroSearch">

              {/* KEYWORD */}

              <div className="searchField searchKeyword">

                <Search
                  size={18}
                  strokeWidth={2}
                />

                <input
                  type="text"
                  placeholder="Job title, skills, or company"
                  value={keyword}
                  onChange={(event) =>
                    setKeyword(
                      event.target.value,
                    )
                  }
                  onKeyDown={
                    handleKeywordKeyDown
                  }
                />

              </div>

              {/* DIVIDER */}

              <div className="searchDivider" />

              {/* LOCATION */}

              <div className="searchField searchLocation">

                <MapPin
                  size={18}
                  strokeWidth={2}
                />

                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value,
                    )
                  }
                  onKeyDown={
                    handleLocationKeyDown
                  }
                />

              </div>

              {/* FILTER */}

              <button
                type="button"
                className={`heroFilterButton ${
                  showFilters
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setShowFilters(
                    (previousValue) =>
                      !previousValue,
                  )
                }
              >

                <SlidersHorizontal
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  Filters
                </span>

                {activeFilterCount >
                  0 && (
                  <span className="heroFilterCount">
                    {activeFilterCount}
                  </span>
                )}

                <ChevronDown
                  size={15}
                  className={
                    showFilters
                      ? "rotate"
                      : ""
                  }
                />

              </button>

              {/* SEARCH BUTTON */}

              <button
                type="button"
                className="heroSearchButton"
                onClick={
                  handleSearch
                }
              >

                <BriefcaseBusiness
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  Search Jobs
                </span>

              </button>

            </div>

            {/* =================================
                FILTER PANEL
            ================================= */}

            {showFilters && (
              <div className="heroFiltersPanel">

                {/* HEADER */}

                <div className="heroFiltersHeader">

                  <div>
                    <h3>
                      Filter Jobs
                    </h3>

                    <p>
                      Combine multiple filters
                      to find matching jobs.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="heroFilterClose"
                    onClick={() =>
                      setShowFilters(
                        false,
                      )
                    }
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>

                </div>

                {/* FILTER GRID */}

                <div className="heroFiltersGrid">

                  {/* SALARY MIN */}

                  <div className="heroFilterGroup">

                    <label htmlFor="salaryMin">
                      Minimum Salary
                    </label>

                    <div className="heroInputWithPrefix">

                      <span>
                        ₹
                      </span>

                      <input
                        id="salaryMin"
                        type="number"
                        min="0"
                        placeholder="e.g. 300000"
                        value={
                          filters.salaryMin
                        }
                        onChange={(event) =>
                          updateFilter(
                            "salaryMin",
                            event.target.value,
                          )
                        }
                      />

                    </div>

                  </div>

                  {/* SALARY MAX */}

                  <div className="heroFilterGroup">

                    <label htmlFor="salaryMax">
                      Maximum Salary
                    </label>

                    <div className="heroInputWithPrefix">

                      <span>
                        ₹
                      </span>

                      <input
                        id="salaryMax"
                        type="number"
                        min="0"
                        placeholder="e.g. 500000"
                        value={
                          filters.salaryMax
                        }
                        onChange={(event) =>
                          updateFilter(
                            "salaryMax",
                            event.target.value,
                          )
                        }
                      />

                    </div>

                  </div>

                  {/* EXPERIENCE */}

                  <div className="heroFilterGroup">

                    <label htmlFor="experience">
                      Experience
                    </label>

                    <div className="heroSelectWrapper">

                      <select
                        id="experience"
                        value={
                          filters.experience
                        }
                        onChange={(event) =>
                          updateFilter(
                            "experience",
                            event.target.value,
                          )
                        }
                      >

                        <option value="">
                          Any Experience
                        </option>

                        <option value="Fresher">
                          Fresher
                        </option>

                        <option value="0 - 1 years">
                          0 - 1 years
                        </option>

                        <option value="0 - 2 years">
                          0 - 2 years
                        </option>

                        <option value="1 - 2 years">
                          1 - 2 years
                        </option>

                        <option value="2 - 3 years">
                          2 - 3 years
                        </option>

                        <option value="3 - 5 years">
                          3 - 5 years
                        </option>

                        <option value="5+ years">
                          5+ years
                        </option>

                      </select>

                      <ChevronDown
                        size={15}
                      />

                    </div>

                  </div>

                  {/* CITY */}

                  <div className="heroFilterGroup">

                    <label htmlFor="city">
                      City
                    </label>

                    <input
                      id="city"
                      type="text"
                      placeholder="e.g. Hyderabad"
                      value={
                        filters.city
                      }
                      onChange={(event) =>
                        updateFilter(
                          "city",
                          event.target.value,
                        )
                      }
                    />

                  </div>

                  {/* WORK MODE */}

                  <div className="heroFilterGroup">

                    <label htmlFor="workMode">
                      Work Mode
                    </label>

                    <div className="heroSelectWrapper">

                      <select
                        id="workMode"
                        value={
                          filters.workMode
                        }
                        onChange={(event) =>
                          updateFilter(
                            "workMode",
                            event.target.value,
                          )
                        }
                      >

                        <option value="">
                          Any Work Mode
                        </option>

                        <option value="remote">
                          Remote
                        </option>

                        <option value="hybrid">
                          Hybrid
                        </option>

                        <option value="on-site">
                          On-site
                        </option>

                      </select>

                      <ChevronDown
                        size={15}
                      />

                    </div>

                  </div>

                  {/* JOB TYPE */}

                  <div className="heroFilterGroup">

                    <label htmlFor="jobType">
                      Job Type
                    </label>

                    <div className="heroSelectWrapper">

                      <select
                        id="jobType"
                        value={
                          filters.jobType
                        }
                        onChange={(event) =>
                          updateFilter(
                            "jobType",
                            event.target.value,
                          )
                        }
                      >

                        <option value="">
                          Any Job Type
                        </option>

                        <option value="Full Time">
                          Full Time
                        </option>

                        <option value="Part Time">
                          Part Time
                        </option>

                        <option value="Internship">
                          Internship
                        </option>

                        <option value="Contract">
                          Contract
                        </option>

                      </select>

                      <ChevronDown
                        size={15}
                      />

                    </div>

                  </div>

                </div>

                {/* FRESHER */}

                <div className="heroFresherRow">

                  <label className="heroCheckbox">

                    <input
                      type="checkbox"
                      checked={
                        filters.fresher
                      }
                      onChange={(event) =>
                        updateFilter(
                          "fresher",
                          event.target.checked,
                        )
                      }
                    />

                    <span className="heroCheckboxCustom" />

                    <span>
                      Fresher jobs only
                    </span>

                  </label>

                </div>

                {/* FOOTER */}

                <div className="heroFiltersFooter">

                  <button
                    type="button"
                    className="heroResetButton"
                    onClick={
                      handleResetFilters
                    }
                  >

                    <RotateCcw
                      size={15}
                    />

                    Reset Filters

                  </button>

                  <div className="heroFilterFooterActions">

                    <button
                      type="button"
                      className="heroClearButton"
                      onClick={
                        handleClearAll
                      }
                    >
                      Clear All
                    </button>

                    <button
                      type="button"
                      className="heroApplyFiltersButton"
                      onClick={() => {
                        handleSearch();

                        setShowFilters(
                          false,
                        );
                      }}
                    >
                      Apply Filters
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =====================================
              REAL PLATFORM STATS
          ===================================== */}

          <div className="heroStats">

            <div className="heroStat">

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats.jobsPosted,
                    )}
              </strong>

              <span>
                Jobs Posted
              </span>

            </div>

            <div className="statDivider" />

            <div className="heroStat">

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats.companies,
                    )}
              </strong>

              <span>
                Companies
              </span>

            </div>

            <div className="statDivider" />

            <div className="heroStat">

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats.registeredUsers,
                    )}
              </strong>

              <span>
                Registered Users
              </span>

            </div>

            <div className="statDivider" />

            <div className="heroStat">

              <strong>
                {statsLoading
                  ? "..."
                  : formatNumber(
                      stats.hires,
                    )}
              </strong>

              <span>
                Hires
              </span>

            </div>

          </div>

        </div>

        {/* =====================================
            RIGHT VISUAL
        ===================================== */}

        <div className="heroVisual">

          <div className="heroVisualBackground" />

          <img
            className="heroPersonImage"
            src={heroImage}
            alt="Job seeker"
          />

          <div className="heroHandwrittenText">

            <span>
              Better
            </span>

            <span>
              Career
            </span>

            <span>
              Brighter
            </span>

            <span>
              You
            </span>

          </div>

          <div className="heroYellowAccent" />

          <div className="heroImageFade" />

        </div>

      </div>
    </section>
  );
}

export default Hero;