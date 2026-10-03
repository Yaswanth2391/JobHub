import { FileText, ShieldCheck } from "lucide-react";

import Navbar from "../../../components/Navbar/Navbar";
import "../PublicPage.css";

function Terms() {
  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageHero">
        <div className="publicPageContainer">
          <div className="publicPageHeroContent">
            <span className="publicPageEyebrow">
              <ShieldCheck size={14} />
              JobHub Terms
            </span>
            <h1 className="publicPageTitle">Terms &amp; Conditions</h1>
            <p className="publicPageLead">
              This page provides an application-level terms outline and should be replaced with
              your approved legal terms before production launch.
            </p>
          </div>
        </div>
      </section>

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div className="publicLegal">
            <section>
              <h2>Account responsibility</h2>
              <p>
                Users are responsible for keeping their login credentials secure and for providing
                accurate information when creating and maintaining an account.
              </p>
            </section>

            <section>
              <h2>Candidate use</h2>
              <p>
                Candidates may browse published jobs and submit applications through their JobHub account.
                Application information should be accurate and relevant to the role.
              </p>
            </section>

            <section>
              <h2>Company use</h2>
              <p>
                Company administrators are responsible for the accuracy of job information and for
                using recruitment features in accordance with applicable laws and their internal policies.
              </p>
            </section>

            <section>
              <h2>Platform administration</h2>
              <p>
                Super Admin controls may manage platform accounts, job visibility, and other configured
                platform settings. Administrative actions should follow your final operational policies.
              </p>
            </section>

            <section>
              <p>
                <FileText size={15} style={{ verticalAlign: "text-bottom", marginRight: "6px" }} />
                Replace this development outline with your approved legal terms before production deployment.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Terms;
