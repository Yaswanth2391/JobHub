import {
  BriefcaseBusiness,
  Building2,
  Users,
  ShieldCheck,
  Mail,
  ArrowUpRight,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

import { Link } from "react-router-dom";
import jobHubLogo from "../../assets/images/jobhub-logo.png";

import "./Footer.css";

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@jobhub.com";

function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleInternalClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="jobhubFooter">
      <div className="footerContainer">
        <div className="footerTop">
          <div className="footerBrand">
            <Link
              to="/"
              className="footerLogo"
              onClick={handleScrollTop}
            >
              <img
                src={jobHubLogo}
                alt="JobHub"
                className="footerBrandLogo"
              />
            </Link>

            <p className="footerDescription">
              A connected recruitment platform for discovering jobs,
              managing applications, and helping companies build teams.
            </p>

            <div className="footerSocials">
              <a
                href={`mailto:${supportEmail}`}
                className="footerSocialLink"
                aria-label="Email JobHub"
                title="Email JobHub"
              >
                <Mail size={18} />
              </a>

              <Link
                to="/contact"
                className="footerSocialLink"
                aria-label="Contact JobHub"
                title="Contact JobHub"
                onClick={handleInternalClick}
              >
                <MessageCircle size={18} />
              </Link>

              <Link
                to="/help"
                className="footerSocialLink"
                aria-label="JobHub Help"
                title="JobHub Help"
                onClick={handleInternalClick}
              >
                <HelpCircle size={18} />
              </Link>

              <Link
                to="/companies"
                className="footerSocialLink"
                aria-label="Explore Companies"
                title="Explore Companies"
                onClick={handleInternalClick}
              >
                <Building2 size={18} />
              </Link>
            </div>
          </div>

          <div className="footerColumn">
            <h3>
              <Users size={18} />
              For Candidates
            </h3>

            <Link to="/jobs" onClick={handleInternalClick}>Find Jobs</Link>
            <Link to="/register" onClick={handleInternalClick}>Create Account</Link>
            <Link to="/saved-jobs" onClick={handleInternalClick}>Saved Jobs</Link>
            <Link to="/my-applications" onClick={handleInternalClick}>My Applications</Link>
            <Link to="/job-alerts" onClick={handleInternalClick}>Job Alerts</Link>
            <Link to="/profile" onClick={handleInternalClick}>My Profile</Link>
          </div>

          <div className="footerColumn">
            <h3>
              <Building2 size={18} />
              For Companies
            </h3>

            <Link to="/company-admin/signup" onClick={handleInternalClick}>Post a Job</Link>
            <Link to="/company-admin/signup" onClick={handleInternalClick}>Register Company</Link>
            <Link to="/company-admin/login" onClick={handleInternalClick}>Company Login</Link>
            <Link to="/company-admin/dashboard" onClick={handleInternalClick}>Employer Dashboard</Link>
            <Link to="/company-admin/applications" onClick={handleInternalClick}>Applications</Link>
          </div>

          <div className="footerColumn">
            <h3>
              <ShieldCheck size={18} />
              JobHub
            </h3>

            <Link to="/about" onClick={handleInternalClick}>About JobHub</Link>
            <Link to="/how-it-works" onClick={handleInternalClick}>How It Works</Link>
            <Link to="/companies" onClick={handleInternalClick}>Companies</Link>
            <Link to="/contact" onClick={handleInternalClick}>Contact Us</Link>
            <Link to="/help" onClick={handleInternalClick}>Help Center</Link>

            <a
              href={`mailto:${supportEmail}`}
              className="footerMailLink"
            >
              <Mail size={16} />
              Email Support
            </a>
          </div>
        </div>

        <div className="footerCta">
          <div className="footerCtaContent">
            <span className="footerCtaBadge">
              <BriefcaseBusiness size={15} />
              Career starts here
            </span>

            <h2>Find your next opportunity with JobHub.</h2>

            <p>
              Explore jobs, connect with companies, and take the next step in your career.
            </p>
          </div>

          <Link
            to="/jobs"
            className="footerCtaButton"
            onClick={handleInternalClick}
          >
            Explore Jobs
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="footerBottom">
          <p>
            © {new Date().getFullYear()} JobHub. All rights reserved.
          </p>

          <div className="footerBottomLinks">
            <Link to="/privacy" onClick={handleInternalClick}>Privacy</Link>
            <span className="footerDot">•</span>
            <Link to="/terms" onClick={handleInternalClick}>Terms</Link>
            <span className="footerDot">•</span>
            <Link to="/help" onClick={handleInternalClick}>Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
