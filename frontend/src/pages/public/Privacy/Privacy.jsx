import { FileText, ShieldCheck } from "lucide-react";

import Navbar from "../../../components/Navbar/Navbar";
import "../PublicPage.css";

function Privacy() {
  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageHero">
        <div className="publicPageContainer">
          <div className="publicPageHeroContent">
            <span className="publicPageEyebrow">
              <ShieldCheck size={14} />
              JobHub Privacy
            </span>
            <h1 className="publicPageTitle">Privacy Policy</h1>
            <p className="publicPageLead">
              This page provides the current application-level privacy information and should
              be reviewed with your final legal policy before production launch.
            </p>
          </div>
        </div>
      </section>

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div className="publicLegal">
            <section>
              <h2>Information we use</h2>
              <p>
                JobHub stores account and profile information needed to provide candidate,
                company, application, and administration features. This can include names,
                email addresses, phone numbers, profile information, job records, and application data.
              </p>
            </section>

            <section>
              <h2>Authentication and sessions</h2>
              <p>
                The current application stores authentication tokens and selected account/session
                information in browser localStorage. Production security hardening should be reviewed
                before launch, including XSS protection and whether HttpOnly cookies should be adopted.
              </p>
            </section>

            <section>
              <h2>Uploaded information</h2>
              <p>
                Candidates may upload resumes, and company administrators may upload company logos.
                These files are served by the backend upload routes configured in the application.
              </p>
            </section>

            <section>
              <h2>Data control</h2>
              <p>
                Final retention, deletion, legal basis, third-party processing, and contact details
                should be documented in the production legal policy applicable to your business.
              </p>
            </section>

            <section>
              <p>
                <FileText size={15} style={{ verticalAlign: "text-bottom", marginRight: "6px" }} />
                Replace this development policy text with your approved legal/privacy document before production deployment.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Privacy;
