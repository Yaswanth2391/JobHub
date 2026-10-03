import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import "../PublicPage.css";

const faqs = [
  ["How do I apply for a job?", "Open a published job and select Apply. You may be asked to log in or create a candidate account before continuing."],
  ["Can I save jobs?", "Yes. Logged-in candidates can save available jobs and manage them from Saved Jobs."],
  ["Where can I track my applications?", "Use My Applications from your candidate account to view the current application status."],
  ["How do companies publish jobs?", "Company administrators can register, log in, complete their company profile, and use the Jobs section to create and publish jobs."],
  ["How do I manage job alerts?", "Logged-in candidates can create and manage Job Alerts from the candidate area."],
  ["Who manages the platform?", "Super Admin tools are used for platform-level administration, company administration, users, and platform settings."],
];

function Help() {
  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageHero">
        <div className="publicPageContainer">
          <div className="publicPageHeroContent">
            <span className="publicPageEyebrow">
              <HelpCircle size={14} />
              JobHub Help
            </span>
            <h1 className="publicPageTitle">Answers to common JobHub questions.</h1>
            <p className="publicPageLead">
              These answers describe the current workflows implemented in the JobHub application.
            </p>
          </div>
        </div>
      </section>

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div className="publicFaqGrid">
            {faqs.map(([question, answer]) => (
              <article className="publicFaqItem" key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>

          <div className="publicActions">
            <Link className="publicPrimaryButton" to="/contact">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Help;
