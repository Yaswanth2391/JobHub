import { useState } from "react";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import API_BASE_URL from "../../../services/api";
import jobHubLogo from "../../../assets/images/jobhub-logo.png";

import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  /* =====================================
     HANDLE INPUT CHANGE
  ===================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================
     COMPANY ADMIN LOGIN
  ===================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data =
        await response.json();

      /* API ERROR */

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to login"
        );
      }

      /* =================================
         SAVE LOGIN DETAILS
      ================================= */

      localStorage.removeItem("jobhubCandidateToken");
      localStorage.removeItem("jobhubCandidate");

      localStorage.setItem(
        "jobhubCompanyAdminToken",
        data.token
      );

      localStorage.setItem(
        "jobhubCompanyAdmin",
        JSON.stringify(
          data.companyAdmin
        )
      );

      /* SUCCESS TOAST */

      toast.success(
        "Login successful!"
      );

      /* RESET FORM */

      setFormData({
        email: "",
        password: "",
      });

      /* REDIRECT */

      setTimeout(() => {
        navigate(
          "/company-admin/dashboard"
        );
      }, 1200);

    } catch (error) {
      console.error(
        "Company login error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to login"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="adminLoginPage">

      {/* =====================================
          LEFT BACKGROUND SECTION
      ===================================== */}

      <section className="adminLoginLeft">

        <div className="adminLoginOverlay">

          {/* LOGO */}

          <Link to="/" className="adminLoginLogo">
            <img
              src={jobHubLogo}
              alt="JobHub"
              className="adminLoginBrandLogo"
            />
          </Link>

          {/* CONTENT */}

          <div className="adminLoginContent">

            <h1>
              Welcome Back,
              <span>
                {" "}Hire Smarter
              </span>
            </h1>

            <p>
              Manage your jobs, candidates,
              applications, and hiring process
              from one powerful dashboard.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================
          RIGHT LOGIN SECTION
      ===================================== */}

      <section className="adminLoginRight">

        <div className="adminLoginCard">

          {/* HEADER */}

          <div className="adminLoginHeader">

            <h2>
              Welcome Back
            </h2>

            <p>
              Login to manage your company
              and hiring process.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="loginInputGroup">

              <label>
                Company Email
              </label>

              <div className="loginInput">

                <Mail size={16} />

                <input
                  type="email"
                  name="email"
                  placeholder="company@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="loginInputGroup">

              <label>
                Password
              </label>

              <div className="loginInput">

                <Lock size={16} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="loginPasswordToggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>

            </div>

            {/* FORGOT PASSWORD */}

            <div className="forgotPasswordRow">

              <button
                type="button"
                className="forgotPasswordButton"
              >
                Forgot Password?
              </button>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="adminLoginButton"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

            {/* SIGNUP */}

            <p className="loginSignupText">

              Don't have a company account?

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/company-admin/signup"
                  )
                }
                disabled={loading}
              >
                Sign Up
              </button>

            </p>

          </form>

        </div>

      </section>

    </main>
  );
}

export default AdminLogin;