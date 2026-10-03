import { useEffect, useState } from "react";

import { Navigate, Outlet } from "react-router-dom";

import SuperAdminSidebar from "../SuperAdminSidebar/SuperAdminSidebar";
import SuperAdminNavbar from "../SuperAdminNavbar/SuperAdminNavbar";

import {
  clearSuperAdminSession,
  getSuperAdminToken,
  superAdminFetch,
  saveSuperAdminSession,
} from "../../../services/superAdminApi";

import LoadingAnimation from "../../LoadingAnimation/LoadingAnimation";

import "./SuperAdminLayout.css";

function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      const token = getSuperAdminToken();

      if (!token) {
        if (mounted) {
          setAuthenticated(false);
          setCheckingAuth(false);
        }
        return;
      }

      try {
        const data = await superAdminFetch(
          "/api/super-admin/auth/me",
        );

        saveSuperAdminSession(
          token,
          data.superAdmin,
        );

        if (mounted) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error(
          "Super Admin Session Error:",
          error,
        );
        clearSuperAdminSession();

        if (mounted) {
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  if (checkingAuth) {
    return (
      <div className="superAdminAuthLoader">
        <LoadingAnimation label="Preparing your Super Admin workspace..." />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/super-admin/login"
        replace
      />
    );
  }

  return (
    <div className="superAdminShell">
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="superAdminMainArea">
        <SuperAdminNavbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="superAdminPageContent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
