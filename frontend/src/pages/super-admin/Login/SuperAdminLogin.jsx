import { useState } from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import API_BASE_URL from "../../../services/api";
import jobHubLogo from "../../../assets/images/jobhub-logo.png";

import {
  saveSuperAdminSession,
} from "../../../services/superAdminApi";

import "./SuperAdminLogin.css";

function SuperAdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to login",
        );
      }

      saveSuperAdminSession(
        data.token,
        data.superAdmin,
      );

      toast.success("Welcome back, Super Admin!");

      navigate("/super-admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Super Admin Login Error:", error);
      toast.error(
        error.message || "Unable to login",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="superAdminLoginPage">
      <section className="superAdminLoginVisual">
        <div className="superAdminVisualPattern" />

        <div className="superAdminLoginVisualContent">
          <div className="superAdminLoginBrand">
            <img
              src={jobHubLogo}
              alt="JobHub"
              className="superAdminLoginBrandLogo"
            />
          </div>

          <div className="superAdminVisualCopy">
            <span className="superAdminVisualEyebrow">
              Platform Control Center
            </span>

            <h1>
              Manage the platform.
              <br />
              Keep JobHub growing.
            </h1>

            <p>
              Monitor companies, administrators, candidates,
              jobs and platform settings from one secure place.
            </p>
          </div>

          <div className="superAdminVisualFooter">
            <ShieldCheck size={17} />
            <span>Secure Super Admin access</span>
          </div>
        </div>
      </section>

      <section className="superAdminLoginPanel">
        <div className="superAdminLoginCard">
          <span className="superAdminLoginBadge">
            <ShieldCheck size={15} />
            Super Admin
          </span>

          <div className="superAdminLoginHeading">
            <h2>Welcome back</h2>
            <p>Sign in to manage your JobHub platform.</p>
          </div>

          <form
            className="superAdminLoginForm"
            onSubmit={handleSubmit}
          >
            <div className="superAdminLoginField">
              <label htmlFor="superAdminEmail">
                Email address
              </label>
              <div className="superAdminInputWrap">
                <Mail size={17} />
                <input
                  id="superAdminEmail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@jobhub.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="superAdminLoginField">
              <label htmlFor="superAdminPassword">
                Password
              </label>
              <div className="superAdminInputWrap">
                <LockKeyhole size={17} />
                <input
                  id="superAdminPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="superAdminPasswordButton"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="superAdminLoginButton"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="superAdminLoginNote">
            Super Admin access is restricted to platform administrators.
          </p>
        </div>
      </section>
    </main>
  );
}

export default SuperAdminLogin;
