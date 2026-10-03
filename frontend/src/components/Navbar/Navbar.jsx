import { useEffect, useState } from "react";

import {
  Menu,
  X,
  User,
  FileText,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Bookmark,
  Bell,
  Settings,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import jobHubLogo from "../../assets/images/jobhub-logo.png";

import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const location = useLocation();

  /* =====================================
     STATE
  ===================================== */

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [candidate, setCandidate] =
    useState(null);

  /* =====================================
     CLOSE MOBILE MENU
  ===================================== */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /* =====================================
     GET LOGGED-IN CANDIDATE
  ===================================== */

  useEffect(() => {
    const updateCandidate = () => {
      const storedCandidate =
        localStorage.getItem(
          "jobhubCandidate"
        );

      if (storedCandidate) {
        try {
          const parsedCandidate =
            JSON.parse(
              storedCandidate
            );

          setCandidate(
            parsedCandidate
          );
        } catch (error) {
          console.error(
            "Unable to read candidate data:",
            error
          );

          setCandidate(null);
        }
      } else {
        setCandidate(null);
      }
    };

    updateCandidate();

    window.addEventListener(
      "storage",
      updateCandidate
    );

    window.addEventListener(
      "jobhub:candidateUpdated",
      updateCandidate
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateCandidate
      );

      window.removeEventListener(
        "jobhub:candidateUpdated",
        updateCandidate
      );
    };
  }, [location.pathname]);

  /* =====================================
     GET INITIALS
  ===================================== */

  const getInitials = (
    fullName
  ) => {
    if (!fullName) {
      return "U";
    }

    return fullName
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name
          .charAt(0)
          .toUpperCase()
      )
      .join("");
  };

  /* =====================================
     LOGIN
  ===================================== */

  const handleLogin = () => {
    closeMenu();

    setProfileOpen(false);

    navigate("/login");
  };

  /* =====================================
     REGISTER
  ===================================== */

  const handleRegister = () => {
    closeMenu();

    setProfileOpen(false);

    navigate("/register");
  };

  /* =====================================
     DASHBOARD
  ===================================== */

  const handleDashboard = () => {
    closeMenu();

    setProfileOpen(false);

    navigate("/dashboard");
  };

  /* =====================================
     MY PROFILE
  ===================================== */

  const handleProfile = () => {
    closeMenu();

    setProfileOpen(false);

    navigate("/profile");
  };

  /* =====================================
     MY APPLICATIONS
  ===================================== */

  const handleApplications = () => {
    closeMenu();

    setProfileOpen(false);

    navigate("/my-applications");
  };

  /* =====================================
     SAVED JOBS
  ===================================== */

  const handleSavedJobs = () => {
    closeMenu();

    setProfileOpen(false);

    navigate("/saved-jobs");
  };

  /* =====================================
     JOB ALERTS
  ===================================== */

  const handleJobAlerts = () => {
    closeMenu();

    setProfileOpen(false);

    navigate("/job-alerts");
  };

  /* =====================================
     SETTINGS
  ===================================== */

  const handleSettings = () => {
    closeMenu();

    setProfileOpen(false);

    navigate("/settings");
  };

  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "jobhubCandidateToken"
    );

    localStorage.removeItem(
      "jobhubCandidate"
    );

    setCandidate(null);

    setProfileOpen(false);

    closeMenu();

    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbarContainer">

        {/* =====================================
            LOGO
        ===================================== */}

        <Link
          to="/"
          className="navbarLogo"
          onClick={() => {
            closeMenu();

            setProfileOpen(false);
          }}
          aria-label="JobHub Home"
        >
          <img
            src={jobHubLogo}
            alt="JobHub"
            className="navbarBrandLogo"
          />
        </Link>

        {/* =====================================
            NAVIGATION LINKS
        ===================================== */}

        <nav
          className={`navLinks ${
            menuOpen
              ? "navLinksOpen"
              : ""
          }`}
        >
          <Link
            to="/jobs"
            onClick={closeMenu}
          >
            Jobs
          </Link>

          <Link
            to="/companies"
            onClick={closeMenu}
          >
            Companies
          </Link>

          <Link
            to="/about"
            onClick={closeMenu}
          >
            About
          </Link>

          <Link
            to="/how-it-works"
            onClick={closeMenu}
          >
            How It Works
          </Link>

          {/* =====================================
              MOBILE AUTH / PROFILE
          ===================================== */}

          {!candidate ? (
            <div className="mobileAuthButtons">

              <button
                type="button"
                className="mobileLoginButton"
                onClick={
                  handleLogin
                }
              >
                Login
              </button>

              <button
                type="button"
                className="mobileRegisterButton"
                onClick={
                  handleRegister
                }
              >
                Register
              </button>

            </div>
          ) : (
            <div className="mobileCandidateMenu">

              {/* USER INFO */}

              <div className="mobileCandidateInfo">

                <div className="mobileCandidateAvatar">
                  {candidate?.profileImage ? (
                    <img
                      src={candidate.profileImage}
                      alt="Candidate profile"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    getInitials(candidate.fullName)
                  )}
                </div>

                <div>
                  <strong>
                    {
                      candidate.fullName
                    }
                  </strong>

                  <span>
                    {
                      candidate.email
                    }
                  </span>
                </div>

              </div>

              {/* DASHBOARD */}

              <button
                type="button"
                className="mobileProfileOption"
                onClick={
                  handleDashboard
                }
              >
                <LayoutDashboard
                  size={17}
                />

                Dashboard
              </button>

              {/* PROFILE */}

              <button
                type="button"
                className="mobileProfileOption"
                onClick={
                  handleProfile
                }
              >
                <User size={17} />

                My Profile
              </button>

              {/* APPLICATIONS */}

              <button
                type="button"
                className="mobileProfileOption"
                onClick={
                  handleApplications
                }
              >
                <FileText
                  size={17}
                />

                My Applications
              </button>

              {/* SAVED JOBS */}

              <button
                type="button"
                className="mobileProfileOption"
                onClick={
                  handleSavedJobs
                }
              >
                <Bookmark
                  size={17}
                />

                Saved Jobs
              </button>

              {/* JOB ALERTS */}

              <button
                type="button"
                className="mobileProfileOption"
                onClick={
                  handleJobAlerts
                }
              >
                <Bell size={17} />

                Job Alerts
              </button>

              {/* SETTINGS */}

              <button
                type="button"
                className="mobileProfileOption"
                onClick={
                  handleSettings
                }
              >
                <Settings
                  size={17}
                />

                Settings
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                className="mobileLogoutOption"
                onClick={
                  handleLogout
                }
              >
                <LogOut
                  size={17}
                />

                Logout
              </button>

            </div>
          )}

        </nav>

        {/* =====================================
            DESKTOP AUTH / PROFILE
        ===================================== */}

        {!candidate ? (
          <div className="authButtons">

            <button
              type="button"
              className="loginButton"
              onClick={
                handleLogin
              }
            >
              Login
            </button>

            <button
              type="button"
              className="registerButton"
              onClick={
                handleRegister
              }
            >
              Register
            </button>

          </div>
        ) : (
          <div className="candidateProfileMenu">

            {/* PROFILE BUTTON */}

            <button
              type="button"
              className="candidateProfileButton"
              onClick={() =>
                setProfileOpen(
                  (previous) =>
                    !previous
                )
              }
              aria-expanded={
                profileOpen
              }
            >
              <span className="candidateAvatar">
                {candidate?.profileImage ? (
                  <img
                    src={candidate.profileImage}
                    alt="Candidate profile"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  getInitials(candidate.fullName)
                )}
              </span>

              <span className="candidateNavbarName">
                {
                  candidate.fullName
                }
              </span>

              <ChevronDown
                size={16}
                className={`profileChevron ${
                  profileOpen
                    ? "profileChevronOpen"
                    : ""
                }`}
              />
            </button>

            {/* =================================
                DROPDOWN
            ================================= */}

            {profileOpen && (
              <div className="candidateDropdown">

                {/* USER HEADER */}

                <div className="candidateDropdownHeader">

                  <div className="candidateDropdownAvatar">
                    {getInitials(
                      candidate.fullName
                    )}
                  </div>

                  <div>
                    <strong>
                      {
                        candidate.fullName
                      }
                    </strong>

                    <span>
                      {
                        candidate.email
                      }
                    </span>
                  </div>

                </div>

                <div className="candidateDropdownDivider" />

                {/* DASHBOARD */}

                <button
                  type="button"
                  className="candidateDropdownOption"
                  onClick={
                    handleDashboard
                  }
                >
                  <LayoutDashboard
                    size={17}
                  />

                  Dashboard
                </button>

                {/* MY PROFILE */}

                <button
                  type="button"
                  className="candidateDropdownOption"
                  onClick={
                    handleProfile
                  }
                >
                  <User size={17} />

                  My Profile
                </button>

                {/* MY APPLICATIONS */}

                <button
                  type="button"
                  className="candidateDropdownOption"
                  onClick={
                    handleApplications
                  }
                >
                  <FileText
                    size={17}
                  />

                  My Applications
                </button>

                {/* SAVED JOBS */}

                <button
                  type="button"
                  className="candidateDropdownOption"
                  onClick={
                    handleSavedJobs
                  }
                >
                  <Bookmark
                    size={17}
                  />

                  Saved Jobs
                </button>

                {/* JOB ALERTS */}

                <button
                  type="button"
                  className="candidateDropdownOption"
                  onClick={
                    handleJobAlerts
                  }
                >
                  <Bell size={17} />

                  Job Alerts
                </button>

                {/* SETTINGS */}

                <button
                  type="button"
                  className="candidateDropdownOption"
                  onClick={
                    handleSettings
                  }
                >
                  <Settings
                    size={17}
                  />

                  Settings
                </button>

                <div className="candidateDropdownDivider" />

                {/* LOGOUT */}

                <button
                  type="button"
                  className="candidateDropdownLogout"
                  onClick={
                    handleLogout
                  }
                >
                  <LogOut
                    size={17}
                  />

                  Logout
                </button>

              </div>
            )}

          </div>
        )}

        {/* =====================================
            MOBILE MENU BUTTON
        ===================================== */}

        <button
          type="button"
          className="menuButton"
          aria-label="Toggle navigation menu"
          onClick={() =>
            setMenuOpen(
              (previous) =>
                !previous
            )
          }
        >
          {menuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>
    </header>
  );
};

export default Navbar;