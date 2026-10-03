import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import jobHubLogo from "../../../assets/images/jobhub-logo.png";

import API_BASE_URL from "../../../services/api";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previousData) => ({
      ...previousData,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  // =====================================
  // HANDLE LOGIN
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/candidates/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      // =====================================
      // HANDLE LOGIN ERROR
      // =====================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login failed. Please try again."
        );
      }

      // =====================================
      // VALIDATE TOKEN
      // =====================================

      if (!data.token) {
        throw new Error(
          "Login token was not received from the server."
        );
      }

      // =====================================
      // SAVE LOGIN DATA
      // =====================================

      localStorage.removeItem("jobhubCompanyAdminToken");
      localStorage.removeItem("jobhubCompanyAdmin");

      localStorage.setItem(
        "jobhubCandidateToken",
        data.token
      );

      localStorage.setItem(
        "jobhubCandidate",
        JSON.stringify(
          data.candidate || {}
        )
      );

      // =====================================
      // SUCCESS MESSAGE
      // =====================================

      setMessage({
        type: "success",
        text:
          data.message ||
          "Login successful!",
      });

      // =====================================
      // REDIRECT
      // =====================================

      setTimeout(() => {
        const destination = location.state?.from || "/";

        navigate(destination, { replace: true });
      }, 400);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to connect to the server. Please try again.",
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="loginPage">

      <section className="loginWrapper">

        {/* =====================================
            LEFT SIDE - BRANDING
        ===================================== */}

        <div className="loginBrandSection">

          <div className="loginBrandContent">

            {/* LOGO */}

            <Link
              to="/"
              className="loginLogo"
            >
              <img
                src={jobHubLogo}
                alt="JobHub"
                className="loginBrandLogo"
              />
            </Link>

            {/* WELCOME CONTENT */}

            <div className="loginWelcomeContent">

              <span className="loginBadge">
                WELCOME BACK
              </span>

              <h1>
                Your next opportunity
                <br />
                is waiting.
              </h1>

              <p>
                Login to JobHub and continue your
                career journey. Discover jobs,
                manage your profile and track your
                applications in one place.
              </p>

              {/* FEATURES */}

              <div className="loginFeatures">

                <div>
                  <span>✓</span>
                  Discover new opportunities
                </div>

                <div>
                  <span>✓</span>
                  Manage your applications
                </div>

                <div>
                  <span>✓</span>
                  Build your professional profile
                </div>

              </div>

            </div>

            {/* COPYRIGHT */}

            <p className="loginCopyright">
              © 2026 JobHub. All rights reserved.
            </p>

          </div>

        </div>

        {/* =====================================
            RIGHT SIDE - LOGIN FORM
        ===================================== */}

        <div className="loginFormSection">

          <div className="loginFormContainer">

            {/* FORM HEADER */}

            <div className="loginFormHeader">

              <h2>
                Welcome back
              </h2>

              <p>
                Enter your details to access your
                JobHub account.
              </p>

              {location.state?.fromLabel && (
                <div className="loginRedirectHint">
                  Please login to continue to <strong>{location.state.fromLabel}</strong>.
                </div>
              )}

            </div>

            {/* SUCCESS / ERROR MESSAGE */}

            {message.text && (
              <div
                className={`loginMessage ${message.type}`}
              >
                {message.text}
              </div>
            )}

            {/* LOGIN FORM */}

            <form
              className="loginForm"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

              <div className="loginFormGroup">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="loginInputWrapper">

                  <Mail size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="loginFormGroup">

                <label htmlFor="password">
                  Password
                </label>

                <div className="loginInputWrapper">

                  <Lock size={18} />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={
                      formData.password
                    }
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="loginPasswordToggle"
                    onClick={() =>
                      setShowPassword(
                        (previousValue) =>
                          !previousValue
                      )
                    }
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* REMEMBER ME */}

              <div className="loginOptions">

                <label className="rememberMe">

                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={
                      formData.rememberMe
                    }
                    onChange={handleChange}
                  />

                  <span>
                    Remember me
                  </span>

                </label>

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
                className="loginSubmitButton"
                disabled={isLoading}
              >
                {isLoading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            {/* =====================================
                BOTTOM LINKS
            ===================================== */}

            <div className="loginBottomLinks">

              {/* CANDIDATE REGISTER */}

              <p className="loginRegisterText">

                Don't have an account?{" "}

                <Link to="/register">
                  Create Account
                </Link>

              </p>

              {/* COMPANY ADMIN LOGIN */}

              <p className="companyAdminLoginText">

                Are you a company?{" "}

                <Link to="/company-admin/login">
                  Company Admin Login
                </Link>

              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;