import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar/Navbar";
import "../PublicPage.css";

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@jobhub.com";
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE || "Replace with your official support number";

function Contact() {
  return (
    <main className="publicPage">
      <Navbar />

      <section className="publicPageHero">
        <div className="publicPageContainer">
          <div className="publicPageHeroContent">
            <span className="publicPageEyebrow">
              <MessageCircle size={14} />
              Contact JobHub
            </span>
            <h1 className="publicPageTitle">Need help with JobHub?</h1>
            <p className="publicPageLead">
              Use the available support channels below. Replace the placeholder contact
              values with your official business details before production deployment.
            </p>
          </div>
        </div>
      </section>

      <section className="publicPageMain">
        <div className="publicPageContainer publicPageContent">
          <div className="publicContactGrid">
            <article className="publicContactCard">
              <div className="publicContactCardIcon"><Mail size={20} /></div>
              <div>
                <h3>Email Support</h3>
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </div>
            </article>

            <article className="publicContactCard">
              <div className="publicContactCardIcon"><Phone size={20} /></div>
              <div>
                <h3>Phone Support</h3>
                <p>{supportPhone}</p>
              </div>
            </article>

            <article className="publicContactCard">
              <div className="publicContactCardIcon"><MapPin size={20} /></div>
              <div>
                <h3>Location</h3>
                <p>JobHub operations and support details can be configured through the platform settings.</p>
              </div>
            </article>

            <article className="publicContactCard">
              <div className="publicContactCardIcon"><MessageCircle size={20} /></div>
              <div>
                <h3>Help Center</h3>
                <Link to="/help">Visit JobHub Help</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;
