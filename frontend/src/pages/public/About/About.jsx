import { BriefcaseBusiness, Building2, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import "../PublicPage.css";

function About() {
  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageHero">
        <div className="publicPageContainer">
          <div className="publicPageHeroContent">
            <span className="publicPageEyebrow">
              <BriefcaseBusiness size={14} />
              About JobHub
            </span>
            <h1 className="publicPageTitle">A simpler place to connect talent and opportunity.</h1>
            <p className="publicPageLead">
              JobHub is designed to bring candidates and employers together through a
              focused, practical recruitment experience.
            </p>
          </div>
        </div>
      </section>

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div className="publicCardGrid">
            <article className="publicCard">
              <div className="publicCardIcon"><Users size={21} /></div>
              <h2>For Candidates</h2>
              <p>
                Discover published roles, maintain your profile, apply for positions,
                save jobs, and keep track of application progress.
              </p>
            </article>

            <article className="publicCard">
              <div className="publicCardIcon"><Building2 size={21} /></div>
              <h2>For Companies</h2>
              <p>
                Company teams can publish jobs, review applications, shortlist candidates,
                schedule interviews, and manage hiring activity.
              </p>
            </article>

            <article className="publicCard">
              <div className="publicCardIcon"><Target size={21} /></div>
              <h2>Built Around Clarity</h2>
              <p>
                The platform keeps job discovery, applications, recruitment workflows,
                and account management in one connected experience.
              </p>
            </article>
          </div>

          <div className="publicActions">
            <Link className="publicPrimaryButton" to="/jobs">
              Explore Jobs
            </Link>
            <Link className="publicSecondaryButton" to="/company-admin/signup">
              For Employers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
