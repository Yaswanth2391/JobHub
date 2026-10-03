import ProtectedAccess from "./ProtectedAccess";

export function CandidateProtectedRoute({ children, label }) {
  const candidateToken = localStorage.getItem("jobhubCandidateToken");
  const companyAdminToken = localStorage.getItem("jobhubCompanyAdminToken");

  // Keep candidate and employer sessions isolated. If an employer session
  // is active, do not allow candidate-only pages to fall through into it.
  const canAccess = Boolean(candidateToken && !companyAdminToken);

  if (!canAccess) {
    return (
      <ProtectedAccess
        audience="candidate"
        target={{
          path: window.location.pathname,
          label,
        }}
      />
    );
  }

  return children;
}

export function CompanyAdminProtectedRoute({ children, label }) {
  const companyAdminToken = localStorage.getItem("jobhubCompanyAdminToken");
  const candidateToken = localStorage.getItem("jobhubCandidateToken");

  // Keep employer and candidate sessions isolated. A candidate session can
  // never fall through into an employer dashboard/application route.
  const canAccess = Boolean(companyAdminToken && !candidateToken);

  if (!canAccess) {
    return (
      <ProtectedAccess
        audience="company"
        target={{
          path: window.location.pathname,
          label,
        }}
      />
    );
  }

  return children;
}
