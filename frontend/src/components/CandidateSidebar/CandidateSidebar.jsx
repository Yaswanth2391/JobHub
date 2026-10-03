import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import jobHubAppIcon from "../../assets/images/jobhub-app-icon.png";

import "./CandidateSidebar.css";

function CandidateSidebar() {
  const location = useLocation();

  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jobhubCandidate") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const updateCandidate = () => {
      try {
        setCandidate(
          JSON.parse(localStorage.getItem("jobhubCandidate") || "null"),
        );
      } catch {
        setCandidate(null);
      }
    };

    window.addEventListener("storage", updateCandidate);
    window.addEventListener("jobhub:candidateUpdated", updateCandidate);

    return () => {
      window.removeEventListener("storage", updateCandidate);
      window.removeEventListener("jobhub:candidateUpdated", updateCandidate);
    };
  }, []);

  const candidateInitials = (candidate?.fullName || "U")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

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

    localStorage.removeItem(
      "candidate"
    );

    navigate("/");
  };

  /* =====================================
     MENU ITEMS
  ===================================== */

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "My Profile",
      icon: User,
      path: "/profile",
    },
    {
      name: "My Applications",
      icon: FileText,
      path: "/my-applications",
    },
    {
      name: "Saved Jobs",
      icon: Bookmark,
      path: "/saved-jobs",
    },
    {
      name: "Job Alerts",
      icon: Bell,
      path: "/job-alerts",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside className="candidateSidebar">

      {/* =================================
          LOGO
      ================================= */}

      <div className="candidateSidebarLogo">
        <Link
          to="/"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <img
            src={jobHubAppIcon}
            alt="JobHub"
            style={{
              width: "32px",
              height: "32px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />

          <span>JobHub</span>
        </Link>
      </div>

      {/* =================================
          NAVIGATION
      ================================= */}

      <nav className="candidateSidebarNavigation">

        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            location.pathname ===
            item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={
                isActive
                  ? "candidateSidebarLink candidateSidebarActive"
                  : "candidateSidebarLink"
              }
            >
              <Icon size={17} />

              <span>
                {item.name}
              </span>
            </Link>
          );
        })}

      </nav>

      {/* =================================
          PROFILE PREVIEW
      ================================= */}

      <div className="candidateSidebarProfile">
        <div className="candidateSidebarAvatar">
          {candidate?.profileImage ? (
            <img
              src={candidate.profileImage}
              alt="Candidate profile"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            candidateInitials || "U"
          )}
        </div>

        <div className="candidateSidebarProfileInfo">
          <strong>{candidate?.fullName || "Candidate"}</strong>
          <span>{candidate?.profileImage ? "Profile photo added" : "Add profile photo"}</span>
        </div>
      </div>

      {/* =================================
          LOGOUT
      ================================= */}

      <div className="candidateSidebarBottom">

        <button
          type="button"
          className="candidateSidebarLogout"
          onClick={
            handleLogout
          }
        >
          <LogOut size={17} />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default CandidateSidebar;