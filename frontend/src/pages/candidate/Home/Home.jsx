import Navbar from "../../../components/Navbar/Navbar";
import Hero from "../../../components/Hero/Hero";
import TrustedCompanies from "../../../components/TrustedCompanies/TrustedCompanies";
import FeaturedJobs from "../../../components/FeaturedJobs/FeaturedJobs";

import "./Home.css";

function Home() {
  return (
    <main className="candidateHomePage">
      <Navbar />

      <Hero />

      <TrustedCompanies />

      <FeaturedJobs />
    </main>
  );
}

export default Home;