import { BriefcaseBusiness, GraduationCap, LaptopMinimal } from "lucide-react";

import "./LoadingAnimation.css";

function LoadingAnimation({ label = "Preparing JobHub..." }) {
  return (
    <div className="jobhubLoadingScreen" role="status" aria-live="polite">
      <div className="jobhubLoaderScene">
        <div className="jobhubLoaderCircle" />
        <span className="jobhubLoaderBriefcase"><BriefcaseBusiness size={20} /></span>
        <span className="jobhubLoaderGraduation"><GraduationCap size={19} /></span>
        <span className="jobhubLoaderLaptop"><LaptopMinimal size={22} /></span>
      </div>

      <strong>{label}</strong>
      <span className="jobhubLoaderDots"><i /><i /><i /></span>
    </div>
  );
}

export default LoadingAnimation;
