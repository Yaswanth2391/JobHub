import "./TrustedCompanies.css";

import tcsLogo from "../../assets/Companies/tcs_logo.png";
import infosysLogo from "../../assets/Companies/infosys_logo.png";
import wiproLogo from "../../assets/Companies/wipro_logo.png";
import accentureLogo from "../../assets/Companies/Accenture_logo.png";
import hclLogo from "../../assets/Companies/hcl_logo.png";
import techMahindraLogo from "../../assets/Companies/tech_mahindra_logo.png";
import deloitteLogo from "../../assets/Companies/deloitte_logo.png";

function TrustedCompanies() {
  const companies = [
    {
      name: "TCS",
      logo: tcsLogo,
    },
    {
      name: "Infosys",
      logo: infosysLogo,
    },
    {
      name: "Wipro",
      logo: wiproLogo,
    },
    {
      name: "Accenture",
      logo: accentureLogo,
    },
    {
      name: "HCL",
      logo: hclLogo,
    },
    {
      name: "Tech Mahindra",
      logo: techMahindraLogo,
    },
    {
      name: "Deloitte",
      logo: deloitteLogo,
    }
  ];

  return (
    <section className="trustedCompanies">
      <div className="container trustedCompaniesContainer">
        <h2 className="trustedCompaniesTitle">
          Trusted by top companies
        </h2>

        <div className="companyLogos">
          {companies.map((company) => (
            <div
              className="companyLogoItem"
              key={company.name}
            >
              <img
                src={company.logo}
                alt={`${company.name} logo`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedCompanies;