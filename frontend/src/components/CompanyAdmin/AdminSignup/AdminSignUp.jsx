import { useState } from "react";

import {
  Building2,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import companyLoginImage from "../../../assets/images/CompanyLoginImage.png";
import jobHubLogo from "../../../assets/images/jobhub-logo.png";

import API_BASE_URL from "../../../services/api";

import "./AdminSignUp.css";

function AdminSignUp() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      companyName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      toast.error(
        "Password and confirm password do not match"
      );

      return;
    }

    if (formData.password.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            companyName:
              formData.companyName,

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
            "Unable to create company account"
        );
      }

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

      toast.success(
        "Company account created successfully!"
      );

      setTimeout(() => {
        navigate(
          "/company-admin/dashboard"
        );
      }, 1200);

    } catch (error) {
      console.error(
        "Company signup error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to create company account"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="adminSignUpPage">

      {/* LEFT SIDE */}

      <section
        className="adminSignUpLeft"
        style={{
          backgroundImage:
            `url(${companyLoginImage})`,
        }}
      >

        {/* LOGO */}

        <Link to="/" className="adminSignUpLogo">
          <img
            src={jobHubLogo}
            alt="JobHub"
            className="adminSignUpBrandLogo"
          />
        </Link>

        {/* TEXT */}

        <div className="adminSignUpContent">

          <h1>
            Hire
            <span>
              {" "}Top Talent
            </span>

            <br />

            Build a Better

            <br />

            Tomorrow
          </h1>

          <p>
            Post jobs, review applications,
            and grow your team with ease.
          </p>

        </div>

      </section>

      {/* RIGHT SIDE */}

      <section className="adminSignUpRight">

        <div className="adminSignUpCard">

          <div className="adminSignUpHeader">

            <h2>
              Create Company Account
            </h2>

            <p>
              Start hiring the right talent today
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
          >

            {/* COMPANY NAME */}

            <div className="signupInputGroup">

              <label>
                Company Name
              </label>

              <div className="signupInput">

                <Building2 size={17} />

                <input
                  type="text"
                  name="companyName"
                  placeholder="Enter company name"
                  value={
                    formData.companyName
                  }
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="signupInputGroup">

              <label>
                Company Email
              </label>

              <div className="signupInput">

                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  placeholder="company@email.com"
                  value={
                    formData.email
                  }
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="signupInputGroup">

              <label>
                Phone Number
              </label>

              <div className="signupInput">

                <Phone size={17} />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={
                    formData.phone
                  }
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="signupInputGroup">

              <label>
                Password
              </label>

              <div className="signupInput">

                <Lock size={17} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create password"
                  value={
                    formData.password
                  }
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="signupInputGroup">

              <label>
                Confirm Password
              </label>

              <div className="signupInput">

                <Lock size={17} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>

            {/* TERMS */}

            <label className="signupTerms">

              <input
                type="checkbox"
                required
                disabled={loading}
              />

              <span>
                I agree to the Terms & Conditions
              </span>

            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              className="adminSignUpButton"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

            {/* LOGIN */}

            <p className="signupLoginText">

              Already have an account?

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/company-admin/login"
                  )
                }
                disabled={loading}
              >
                Login
              </button>

            </p>

          </form>

        </div>

      </section>

    </main>
  );
}

export default AdminSignUp;