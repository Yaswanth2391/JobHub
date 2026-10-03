import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import {
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

/* ==========================================
   FOOTER
========================================== */

import Footer from "./components/Footer/Footer";
import {
  CandidateProtectedRoute,
  CompanyAdminProtectedRoute,
} from "./components/Auth/RouteGuards";

/* ==========================================
   CANDIDATE
========================================== */

import Home from "./pages/candidate/Home/Home";
import CandidateDashboard from "./pages/candidate/Dashboard/Dashboard";
import Register from "./pages/candidate/Register/Register";
import Login from "./pages/candidate/Login/Login";
import JobDetails from "./pages/candidate/JobDetails/JobDetails";
import Profile from "./pages/candidate/Profile/Profile";
import MyApplications from "./pages/candidate/Applications/MyApplications";
import SavedJobs from "./pages/candidate/SavedJobs/SavedJobs";
import JobAlerts from "./pages/candidate/JobAlerts/JobAlerts";
import CandidateSettings from "./pages/candidate/Settings/Settings";

/* ==========================================
   PUBLIC PAGES
========================================== */

import PublicJobs from "./pages/public/Jobs/Jobs";
import PublicCompanies from "./pages/public/Companies/Companies";
import About from "./pages/public/About/About";
import HowItWorks from "./pages/public/HowItWorks/HowItWorks";
import Contact from "./pages/public/Contact/Contact";
import Help from "./pages/public/Help/Help";
import Privacy from "./pages/public/Privacy/Privacy";
import Terms from "./pages/public/Terms/Terms";
import NotFound from "./pages/public/NotFound/NotFound";

/* ==========================================
   COMPANY ADMIN
========================================== */

import AdminSignUp from "./components/CompanyAdmin/AdminSignup/AdminSignUp";
import AdminLogin from "./components/CompanyAdmin/AdminLogin/AdminLogin";
import Dashboard from "./components/CompanyAdmin/Dashboard/Dashboard";
import Jobs from "./components/CompanyAdmin/Jobs/Jobs";
import CompanyApplication from "./components/CompanyAdmin/Applications/companyApplication";
import ATSShortlisting from "./components/CompanyAdmin/ATSShortlisting/ATSShortlisting";
import ScheduleInterview from "./components/CompanyAdmin/Interviews/ScheduleInterview";
import Interviews from "./components/CompanyAdmin/Interviews/Interviews";
import Hired from "./components/CompanyAdmin/Hired/Hired";
import Rejected from "./components/CompanyAdmin/Rejected/Rejected";
import CompanyProfile from "./components/CompanyAdmin/CompanyProfile/CompanyProfile";
import Settings from "./components/CompanyAdmin/Settings/Settings";

/* ==========================================
   SUPER ADMIN
========================================== */

import SuperAdminLogin from "./pages/super-admin/Login/SuperAdminLogin";
import SuperAdminLayout from "./components/SuperAdmin/SuperAdminLayout/SuperAdminLayout";
import SuperAdminDashboard from "./pages/super-admin/Dashboard/Dashboard";
import SuperAdminCompanies from "./pages/super-admin/Companies/Companies";
import SuperAdminCompanyAdmins from "./pages/super-admin/CompanyAdmins/CompanyAdmins";
import SuperAdminUsers from "./pages/super-admin/Users/Users";
import SuperAdminPlatformManagement from "./pages/super-admin/PlatformManagement/PlatformManagement";
import SuperAdminSettings from "./pages/super-admin/Settings/Settings";

/* ==========================================
   PUBLIC FOOTER CONTROLLER
========================================== */

function PublicFooter() {
  const location = useLocation();
  const currentPath = location.pathname;

  const publicFooterPaths = [
    "/",
    "/jobs",
    "/companies",
    "/about",
    "/how-it-works",
    "/contact",
    "/help",
    "/privacy",
    "/terms",
  ];

  const showFooter =
    publicFooterPaths.includes(currentPath) ||
    currentPath.startsWith("/jobs/");

  if (!showFooter) {
    return null;
  }

  return <Footer />;
}

/* ==========================================
   APP
========================================== */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ====================================
            HOME
        ==================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/jobs"
          element={<PublicJobs />}
        />

        <Route
          path="/companies"
          element={<PublicCompanies />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/how-it-works"
          element={<HowItWorks />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/help"
          element={<Help />}
        />

        <Route
          path="/privacy"
          element={<Privacy />}
        />

        <Route
          path="/terms"
          element={<Terms />}
        />

        {/* ====================================
            CANDIDATE
        ==================================== */}

        <Route
          path="/dashboard"
          element={
            <CandidateProtectedRoute label="Dashboard">
              <CandidateDashboard />
            </CandidateProtectedRoute>
          }
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/jobs/:jobId"
          element={<JobDetails />}
        />

        <Route
          path="/profile"
          element={
            <CandidateProtectedRoute label="My Profile">
              <Profile />
            </CandidateProtectedRoute>
          }
        />

        <Route
          path="/my-applications"
          element={
            <CandidateProtectedRoute label="My Applications">
              <MyApplications />
            </CandidateProtectedRoute>
          }
        />

        <Route
          path="/saved-jobs"
          element={
            <CandidateProtectedRoute label="Saved Jobs">
              <SavedJobs />
            </CandidateProtectedRoute>
          }
        />

        <Route
          path="/job-alerts"
          element={
            <CandidateProtectedRoute label="Job Alerts">
              <JobAlerts />
            </CandidateProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <CandidateProtectedRoute label="Settings">
              <CandidateSettings />
            </CandidateProtectedRoute>
          }
        />

        {/* ====================================
            COMPANY ADMIN
        ==================================== */}

        <Route
          path="/company-admin/signup"
          element={<AdminSignUp />}
        />

        <Route
          path="/company-admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/company-admin/dashboard"
          element={
            <CompanyAdminProtectedRoute label="Employer Dashboard">
              <Dashboard />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/jobs"
          element={
            <CompanyAdminProtectedRoute label="Manage Jobs">
              <Jobs />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/applications"
          element={
            <CompanyAdminProtectedRoute label="Company Applications">
              <CompanyApplication />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/ats-shortlisting/:jobId"
          element={
            <CompanyAdminProtectedRoute label="ATS Shortlisting">
              <ATSShortlisting />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/schedule-interview/:applicationId"
          element={
            <CompanyAdminProtectedRoute label="Schedule Interview">
              <ScheduleInterview />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/interviews"
          element={
            <CompanyAdminProtectedRoute label="Interviews">
              <Interviews />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/hired"
          element={
            <CompanyAdminProtectedRoute label="Hired Candidates">
              <Hired />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/rejected"
          element={
            <CompanyAdminProtectedRoute label="Rejected Candidates">
              <Rejected />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/profile"
          element={
            <CompanyAdminProtectedRoute label="Company Profile">
              <CompanyProfile />
            </CompanyAdminProtectedRoute>
          }
        />

        <Route
          path="/company-admin/settings"
          element={
            <CompanyAdminProtectedRoute label="Company Settings">
              <Settings />
            </CompanyAdminProtectedRoute>
          }
        />

        {/* ====================================
            SUPER ADMIN LOGIN
        ==================================== */}

        <Route
          path="/super-admin/login"
          element={<SuperAdminLogin />}
        />

        {/* ====================================
            SUPER ADMIN APPLICATION
        ==================================== */}

        <Route
          path="/super-admin"
          element={<SuperAdminLayout />}
        >
          <Route
            index
            element={<SuperAdminDashboard />}
          />

          <Route
            path="dashboard"
            element={<SuperAdminDashboard />}
          />

          <Route
            path="companies"
            element={<SuperAdminCompanies />}
          />

          <Route
            path="company-admins"
            element={<SuperAdminCompanyAdmins />}
          />

          <Route
            path="users"
            element={<SuperAdminUsers />}
          />

          <Route
            path="platform-management"
            element={<SuperAdminPlatformManagement />}
          />

          <Route
            path="settings"
            element={<SuperAdminSettings />}
          />
        </Route>

        {/* ====================================
            FALLBACK
        ==================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>

      {/* ======================================
          PUBLIC FOOTER
      ====================================== */}

      <PublicFooter />

      {/* ======================================
          TOAST
      ====================================== */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
