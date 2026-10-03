import { ArrowRight, BriefcaseBusiness, Building2, LockKeyhole, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import jobHubLogo from "../../assets/images/jobhub-logo.png";
import "./ProtectedAccess.css";

function ProtectedAccess({
  audience = "candidate",
  target = "this page",
}) {
  const navigate = useNavigate();
  const isCompany = audience === "company";

  const handleLogin = () => {
    navigate(isCompany ? "/company-admin/login" : "/login", {
      state: {
        from: target.path || "/",
        fromLabel: target.label || "this page",
      },
    });
  };

  const handleRegister = () => {
    navigate(isCompany ? "/company-admin/signup" : "/register", {
      state: {
        from: target.path || "/",
        fromLabel: target.label || "this page",
      },
    });
  };

  const Icon = isCompany ? Building2 : UserRound;
  const title = isCompany
    ? "Login to continue as an employer"
    : "Please login to view this page";
  const description = isCompany
    ? `The ${target.label || "employer area"} is available to registered JobHub companies. Sign in to access your hiring workspace.`
    : `Your ${target.label || "account page"} is private. Login to JobHub to access your profile, applications, saved jobs, alerts, and dashboard.`;

  return (
    <main className="protectedAccessPage">
      <div className="protectedAccessGlow protectedAccessGlowOne" />
      <div className="protectedAccessGlow protectedAccessGlowTwo" />

      <section className="protectedAccessCard">
        <div className="protectedAccessBrandRow">
          <img
            src={jobHubLogo}
            alt="JobHub"
            className="protectedAccessLogo"
          />

          <span className="protectedAccessSecureBadge">
            <LockKeyhole size={13} />
            Secure Access
          </span>
        </div>

        <div className="protectedAccessIconWrap">
          <span className="protectedAccessIconRing" />
          <Icon size={30} strokeWidth={2.1} />
        </div>

        <span className="protectedAccessEyebrow">
          {isCompany ? "Employer area" : "Candidate area"}
        </span>

        <h1>{title}</h1>

        <p>{description}</p>

        <div className="protectedAccessTarget">
          <BriefcaseBusiness size={16} />
          <span>
            Continue to <strong>{target.label || "your JobHub account"}</strong>
          </span>
        </div>

        <div className="protectedAccessActions">
          <button
            type="button"
            className="protectedAccessPrimary"
            onClick={handleLogin}
          >
            {isCompany ? "Company Login" : "Login to JobHub"}
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="protectedAccessSecondary"
            onClick={handleRegister}
          >
            {isCompany ? "Register Company" : "Create Account"}
          </button>
        </div>

        <button
          type="button"
          className="protectedAccessHome"
          onClick={() => navigate("/")}
        >
          Back to JobHub Home
        </button>
      </section>
    </main>
  );
}

export default ProtectedAccess;
