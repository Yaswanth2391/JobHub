import { Building2, GraduationCap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AccountTypeModal.css";

function AccountTypeModal({ mode, onClose }) {
  const navigate = useNavigate();
  const isRegister = mode === "register";

  const handlePersonal = () => {
    onClose();
    navigate(isRegister ? "/register" : "/login");
  };

  const handleBusiness = () => {
    onClose();
    navigate(isRegister ? "/company-admin/signup" : "/company-admin/login");
  };

  return (
    <div
      className="accountTypeOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accountTypeTitle"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="accountTypeModal">
        <button type="button" className="accountTypeClose" onClick={onClose} aria-label="Close account type selection">
          <X size={20} />
        </button>

        <div className="accountTypeHeader">
          <span className="accountTypeEyebrow">JOBHUB</span>
          <h2 id="accountTypeTitle">
            {isRegister ? "Create your JobHub account" : "Welcome back to JobHub"}
          </h2>
          <p>
            {isRegister
              ? "Choose how you want to use JobHub to continue."
              : "Choose your account type to continue to login."}
          </p>
        </div>

        <div className="accountTypeOptions">
          <button type="button" className="accountTypeCard accountTypePersonal" onClick={handlePersonal}>
            <span className="accountTypeIcon"><GraduationCap size={26} /></span>
            <span className="accountTypeContent">
              <strong>Personal</strong>
              <span>
                For students and job seekers. {isRegister ? "Create your profile and start applying for jobs." : "Login to apply for jobs and manage your applications."}
              </span>
            </span>
            <span className="accountTypeArrow" aria-hidden="true">→</span>
          </button>

          <button type="button" className="accountTypeCard accountTypeBusiness" onClick={handleBusiness}>
            <span className="accountTypeIcon"><Building2 size={26} /></span>
            <span className="accountTypeContent">
              <strong>Business</strong>
              <span>
                For companies and recruiters. {isRegister ? "Create a company account and start hiring." : "Login to manage jobs, candidates, and hiring."}
              </span>
            </span>
            <span className="accountTypeArrow" aria-hidden="true">→</span>
          </button>
        </div>

        <p className="accountTypeFooter">
          Choose Personal for job seeking or Business for company hiring access.
        </p>
      </div>
    </div>
  );
}

export default AccountTypeModal;
