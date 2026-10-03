import {
  LayoutDashboard,
  Building2,
  UsersRound,
  UserRound,
  Settings2,
  LogOut,
  Crown,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import {
  clearSuperAdminSession,
} from "../../../services/superAdminApi";

import logo from "../../../assets/images/jobhub-logo.png";

import "./SuperAdminSidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    to: "/super-admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Companies",
    to: "/super-admin/companies",
    icon: Building2,
  },
  {
    label: "Company Admins",
    to: "/super-admin/company-admins",
    icon: UsersRound,
  },
  {
    label: "Users",
    to: "/super-admin/users",
    icon: UserRound,
  },
  {
    label: "Platform Management",
    to: "/super-admin/platform-management",
    icon: Settings2,
  },
];

function SuperAdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSuperAdminSession();
    navigate("/super-admin/login", {
      replace: true,
    });
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="superAdminSidebarOverlay"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}

      <aside
        className={`superAdminSidebar ${
          isOpen ? "isOpen" : ""
        }`}
      >
        <div className="superAdminSidebarHeader">
          <NavLink
            to="/super-admin/dashboard"
            className="superAdminLogoLink"
            onClick={onClose}
          >
            <img
              src={logo}
              alt="JobHub"
              className="superAdminLogo"
            />
          </NavLink>

          <button
            type="button"
            className="superAdminSidebarClose"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="superAdminRoleLabel">
          <span className="superAdminRoleIcon">
            <Crown size={15} />
          </span>
          <span>Super Admin</span>
        </div>

        <nav className="superAdminNavigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `superAdminNavLink ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="superAdminSidebarBottom">
          <div className="superAdminSidebarDivider" />

          <NavLink
            to="/super-admin/settings"
            onClick={onClose}
            className="superAdminUtilityLink"
          >
            <Settings2 size={17} />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            className="superAdminUtilityLink logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>

          <div className="superAdminSidebarBadge">
            <Crown size={19} />
            <div>
              <strong>Keep the platform</strong>
              <span>Safe &amp; Growing</span>
              <small>JobHub v1.0.0</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SuperAdminSidebar;
