import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  UserCheck,
  UserRoundX,
  Building2,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import logo from "../../../assets/images/jobhub-logo.png";

import "./AdminSidebar.css";

function AdminSidebar({
  isOpen = false,
  onClose = () => {},
}) {
  const navigate = useNavigate();

  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/company-admin/dashboard",
    },
    {
      name: "Jobs",
      icon: BriefcaseBusiness,
      path: "/company-admin/jobs",
    },
    {
      name: "Applications",
      icon: FileText,
      path: "/company-admin/applications",
    },
    {
      name: "Interviews",
      icon: CalendarDays,
      path: "/company-admin/interviews",
    },
    {
      name: "Hired",
      icon: UserCheck,
      path: "/company-admin/hired",
    },
    {
      name: "Rejected",
      icon: UserRoundX,
      path: "/company-admin/rejected",
    },
    {
      name: "Company Profile",
      icon: Building2,
      path: "/company-admin/profile",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/company-admin/settings",
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);

    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "jobhubCompanyAdminToken",
    );

    localStorage.removeItem(
      "jobhubCompanyAdmin",
    );

    onClose();

    navigate(
      "/company-admin/login",
    );
  };

  const isMenuItemActive = (path) => {
    if (
      path === "/company-admin/applications" &&
      location.pathname.startsWith(
        "/company-admin/ats-shortlisting",
      )
    ) {
      return true;
    }

    return location.pathname === path;
  };

  return (
    <aside
      className={`adminSidebar ${
        isOpen
          ? "adminSidebarOpen"
          : ""
      }`}
    >
      {/* =====================================
          LOGO
      ===================================== */}

      <div className="adminSidebarHeader">
        <Link
          to="/company-admin/dashboard"
          className="adminSidebarLogo"
          onClick={() => onClose()}
        >
          <img
            src={logo}
            alt="JobHub"
            className="adminSidebarBrandLogo"
          />
        </Link>

        {/* MOBILE CLOSE BUTTON */}

        <button
          type="button"
          className="adminSidebarCloseButton"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={21} />
        </button>
      </div>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="adminSidebarNavigation">
        {menuItems.map(
          ({
            name,
            icon: Icon,
            path,
          }) => (
            <button
              key={name}
              type="button"
              className={`adminSidebarItem ${
                isMenuItemActive(path)
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigate(path)
              }
            >
              <Icon size={17} />

              <span>{name}</span>
            </button>
          ),
        )}
      </nav>

      {/* =====================================
          LOGOUT
      ===================================== */}

      <div className="adminSidebarLogout">
        <button
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={17} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;