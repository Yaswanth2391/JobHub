import { ArrowLeft, CircleAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import "../PublicPage.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div className="publicCard" style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
            <div className="publicCardIcon" style={{ margin: "0 auto 18px" }}>
              <CircleAlert size={24} />
            </div>
            <h1 className="publicSectionTitle">Page not found</h1>
            <p className="publicSectionLead" style={{ marginLeft: "auto", marginRight: "auto" }}>
              The page you opened does not exist or the link may be outdated.
            </p>
            <div className="publicActions" style={{ justifyContent: "center" }}>
              <Link className="publicPrimaryButton" to="/">Go Home</Link>
              <button className="publicSecondaryButton" type="button" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
