import { useEffect, useRef, useState } from "react";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  CheckCircle2,
  Clock3,
  Building2,
  UsersRound,
  UserRound,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  clearSuperAdminSession,
  getStoredSuperAdmin,
  superAdminFetch,
} from "../../../services/superAdminApi";

import "./SuperAdminNavbar.css";

const activityIconMap = {
  company: Building2,
  admin: UsersRound,
  user: UserRound,
  job: BriefcaseBusiness,
};

const formatRelativeTime = (value) => {
  if (!value) return "";

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "";

  const difference = Math.max(Date.now() - time, 0);
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

function SuperAdminNavbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const storedAdmin = getStoredSuperAdmin();
  const pathname = location.pathname;

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [hasUnread, setHasUnread] = useState(true);

  let placeholder = "Search anything...";

  if (pathname.includes("/companies")) {
    placeholder = "Search companies...";
  } else if (pathname.includes("/company-admins")) {
    placeholder = "Search admins...";
  } else if (pathname.includes("/users")) {
    placeholder = "Search users...";
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationError("");

      const data = await superAdminFetch(
        "/api/super-admin/dashboard",
      );

      setNotifications(
        Array.isArray(data.recentActivity)
          ? data.recentActivity.slice(0, 6)
          : [],
      );
      setHasUnread(false);
    } catch (error) {
      console.error("Super Admin Notifications Error:", error);
      setNotificationError(
        error.message || "Unable to load recent activity",
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationClick = () => {
    setProfileOpen(false);
    setNotificationOpen((previous) => !previous);

    if (!notificationOpen) {
      loadNotifications();
    }
  };

  const handleProfileClick = () => {
    setNotificationOpen(false);
    setProfileOpen((previous) => !previous);
  };

  const handleLogout = () => {
    clearSuperAdminSession();
    setProfileOpen(false);
    navigate("/super-admin/login", { replace: true });
  };

  const handleSearch = (event) => {
    const value = event.target.value;

    window.dispatchEvent(
      new CustomEvent("jobhub:superAdminSearch", {
        detail: {
          value,
          pathname,
        },
      }),
    );
  };

  return (
    <header className="superAdminNavbar">
      <div className="superAdminNavbarLeft">
        <button
          type="button"
          className="superAdminMenuButton"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        <div className="superAdminGlobalSearch">
          <Search size={16} />
          <input
            type="search"
            placeholder={placeholder}
            onChange={handleSearch}
            aria-label={placeholder}
          />
        </div>
      </div>

      <div className="superAdminNavbarRight">
        <div
          ref={notificationRef}
          className="superAdminNavbarMenuWrap"
        >
          <button
            type="button"
            className={`superAdminNotificationButton ${
              notificationOpen ? "isOpen" : ""
            }`}
            onClick={handleNotificationClick}
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <Bell size={18} />
            {hasUnread && <span className="superAdminNotificationDot" />}
          </button>

          {notificationOpen && (
            <div className="superAdminNotificationPanel">
              <div className="superAdminNotificationHeader">
                <div>
                  <strong>Recent activity</strong>
                  <span>Latest platform events</span>
                </div>

                <button
                  type="button"
                  className="superAdminNotificationRefresh"
                  onClick={loadNotifications}
                  disabled={notificationsLoading}
                  aria-label="Refresh notifications"
                >
                  <RefreshCw
                    size={15}
                    className={notificationsLoading ? "isSpinning" : ""}
                  />
                </button>
              </div>

              <div className="superAdminNotificationList">
                {notificationsLoading && (
                  <div className="superAdminNotificationState">
                    <span className="superAdminMiniSpinner" />
                    Loading recent activity...
                  </div>
                )}

                {!notificationsLoading && notificationError && (
                  <div className="superAdminNotificationState error">
                    {notificationError}
                  </div>
                )}

                {!notificationsLoading &&
                  !notificationError &&
                  notifications.length === 0 && (
                    <div className="superAdminNotificationEmpty">
                      <CheckCircle2 size={24} />
                      <strong>You are all caught up.</strong>
                      <span>No recent activity to show.</span>
                    </div>
                  )}

                {!notificationsLoading &&
                  !notificationError &&
                  notifications.map((item) => {
                    const Icon = activityIconMap[item.type] || Clock3;

                    return (
                      <div
                        key={item.id}
                        className="superAdminNotificationItem"
                      >
                        <span className={`superAdminNotificationItemIcon ${item.type || ""}`}>
                          <Icon size={15} />
                        </span>

                        <div className="superAdminNotificationItemContent">
                          <strong>{item.title}</strong>
                          <span>{item.description}</span>
                          <small>{formatRelativeTime(item.createdAt)}</small>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <Link
                to="/super-admin/dashboard"
                className="superAdminNotificationFooter"
                onClick={() => setNotificationOpen(false)}
              >
                View dashboard activity
              </Link>
            </div>
          )}
        </div>

        <div
          ref={profileRef}
          className="superAdminNavbarMenuWrap"
        >
          <button
            type="button"
            className={`superAdminProfileCompact ${
              profileOpen ? "isOpen" : ""
            }`}
            onClick={handleProfileClick}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <span className="superAdminAvatar">
              {(storedAdmin?.fullName || "SA")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>

            <span className="superAdminProfileName">
              {storedAdmin?.fullName || "Super Admin"}
            </span>

            <ChevronDown
              size={15}
              className={`superAdminProfileChevron ${profileOpen ? "open" : ""}`}
            />
          </button>

          {profileOpen && (
            <div className="superAdminProfileDropdown">
              <div className="superAdminProfileDropdownUser">
                <span className="superAdminDropdownAvatar">
                  {(storedAdmin?.fullName || "SA")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div>
                  <strong>{storedAdmin?.fullName || "Super Admin"}</strong>
                  <span>{storedAdmin?.email || "Platform administrator"}</span>
                </div>
              </div>

              <div className="superAdminProfileDropdownDivider" />

              <Link
                to="/super-admin/settings"
                className="superAdminProfileDropdownItem"
                onClick={() => setProfileOpen(false)}
              >
                <Settings size={16} />
                Settings
              </Link>

              <button
                type="button"
                className="superAdminProfileDropdownItem danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default SuperAdminNavbar;
