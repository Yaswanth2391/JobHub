import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Search, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import "../PublicPage.css";

function HowItWorks() {
  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageHero">
        <div className="publicPageContainer">
          <div className="publicPageHeroContent">
            <span className="publicPageEyebrow">
              <BriefcaseBusiness size={14} />
              How JobHub works
            </span>
            <h1 className="publicPageTitle">From job discovery to hiring, in one workflow.</h1>
            <p className="publicPageLead">
              JobHub separates the candidate journey from the employer workflow while
              keeping both sides connected through the same job and application records.
            </p>
          </div>
        </div>
      </section>

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div className="publicCardGrid">
            <article className="publicCard">
              <div className="publicCardIcon"><UserPlus size={21} /></div>
              <h2>1. Create your account</h2>
              <p>Register as a candidate or as a company administrator using the relevant JobHub portal.</p>
            </article>

            <article className="publicCard">
              <div className="publicCardIcon"><Search size={21} /></div>
              <h2>2. Discover opportunities</h2>
              <p>Search published jobs by keyword, location, type, experience, or skills.</p>
            </article>

            <article className="publicCard">
              <div className="publicCardIcon"><CheckCircle2 size={21} /></div>
              <h2>3. Manage the process</h2>
              <p>Candidates can track applications while company teams manage screening, interviews, hiring, or rejection.</p>
            </article>
          </div>

          <div className="publicActions">
            <Link className="publicPrimaryButton" to="/register">
              Create Candidate Account
              <ArrowUpRight size={17} />
            </Link>
            <Link className="publicSecondaryButton" to="/company-admin/signup">
              Register as Employer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HowItWorks;
