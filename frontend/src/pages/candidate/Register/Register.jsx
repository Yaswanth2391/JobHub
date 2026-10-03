import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import API_BASE_URL from "../../../services/api";
import jobHubLogo from "../../../assets/images/jobhub-logo.png";

import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [message, setMessage] =
    useState({
      type: "",
      text: "",
    });

  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    });

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });

      return;
    }

    if (!formData.agreeTerms) {
      setMessage({
        type: "error",
        text:
          "Please accept the Terms and Conditions.",
      });

      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/candidates/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullName:
              formData.fullName,

            email:
              formData.email,

            phone:
              formData.phone,

            password:
              formData.password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed. Please try again."
        );
      }

      localStorage.removeItem("jobhubCompanyAdminToken");
      localStorage.removeItem("jobhubCompanyAdmin");

      localStorage.setItem(
        "jobhubCandidateToken",
        data.token
      );

      localStorage.setItem(
        "jobhubCandidate",
        JSON.stringify(
          data.candidate
        )
      );

      setMessage({
        type: "success",
        text:
          data.message ||
          "Registration successful!",
      });

      setTimeout(() => {
        const destination = location.state?.from || "/";
        navigate(destination, { replace: true });
      }, 700);

    } catch (error) {
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
    <main className="registerPage">

      <section className="registerWrapper">

        {/* =====================================
            LEFT SIDE - BRANDING
        ===================================== */}

        <div className="registerBrandSection">

          <div className="registerBrandContent">

            <Link
              to="/"
              className="registerLogo"
            >
              <img
                src={jobHubLogo}
                alt="JobHub"
                className="registerBrandLogo"
              />
            </Link>

            <div className="registerWelcomeContent">

              <span className="registerBadge">
                START YOUR JOURNEY
              </span>

              <h1>
                Find the career
                <br />
                you deserve.
              </h1>

              <p>
                Join JobHub and discover
                opportunities from top companies.
                Build your profile and take the
                next step in your career.
              </p>

              <div className="registerFeatures">

                <div>
                  <span>✓</span>
                  Access thousands of jobs
                </div>

                <div>
                  <span>✓</span>
                  Apply to top companies
                </div>

                <div>
                  <span>✓</span>
                  Track your applications
                </div>

              </div>

            </div>

            <p className="registerCopyright">
              © 2026 JobHub. All rights reserved.
            </p>

          </div>

        </div>

        {/* =====================================
            RIGHT SIDE - FORM
        ===================================== */}

        <div className="registerFormSection">

          <div className="registerFormContainer">

            <div className="registerFormHeader">

              <h2>
                Create your account
              </h2>

              <p>
                Enter your details to get started
                with JobHub.
              </p>

              {location.state?.fromLabel && (
                <div className="registerRedirectHint">
                  Create your account to continue to <strong>{location.state.fromLabel}</strong>.
                </div>
              )}

            </div>

            {message.text && (
              <div
                className={`registerMessage ${message.type}`}
              >
                {message.text}
              </div>
            )}

            <form
              className="registerForm"
              onSubmit={handleSubmit}
            >

              {/* FULL NAME */}

              <div className="registerFormGroup">

                <label htmlFor="fullName">
                  Full Name
                </label>

                <div className="registerInputWrapper">

                  <User size={18} />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={
                      formData.fullName
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="registerFormGroup">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="registerInputWrapper">

                  <Mail size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={
                      formData.email
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* PHONE */}

              <div className="registerFormGroup">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="registerInputWrapper">

                  <Phone size={18} />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={
                      formData.phone
                    }
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="registerFormGroup">

                <label htmlFor="password">
                  Password
                </label>

                <div className="registerInputWrapper">

                  <Lock size={18} />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={
                      formData.password
                    }
                    onChange={handleChange}
                    minLength="6"
                    required
                  />

                  <button
                    type="button"
                    className="passwordToggleButton"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
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

              {/* CONFIRM PASSWORD */}

              <div className="registerFormGroup">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="registerInputWrapper">

                  <Lock size={18} />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    minLength="6"
                    required
                  />

                  <button
                    type="button"
                    className="passwordToggleButton"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* TERMS */}

              <label className="termsCheckbox">

                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={
                    formData.agreeTerms
                  }
                  onChange={handleChange}
                />

                <span>
                  I agree to the{" "}
                  <button type="button">
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <button type="button">
                    Privacy Policy
                  </button>
                </span>

              </label>

              {/* SUBMIT */}

              <button
                type="submit"
                className="createAccountButton"
                disabled={isLoading}
              >
                {isLoading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

            </form>

            {/* LOGIN LINK */}

            <p className="alreadyAccountText">

              Already have an account?{" "}

              <Link to="/login">
                Login
              </Link>

            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Register;