import { useEffect, useState } from "react";

import {
  Building2,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  MapPin,
  UsersRound,
  BriefcaseBusiness,
  Filter,
  CircleCheck,
  Ban,
  ShieldAlert,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  superAdminFetch,
} from "../../../services/superAdminApi";

import "./Companies.css";

const emptyForm = {
  companyName: "",
  email: "",
  phone: "",
  password: "",
  industry: "",
  location: "",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [modal, setModal] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (industry) params.set("industry", industry);
      if (status) params.set("status", status);

      const data = await superAdminFetch(
        `/api/super-admin/companies?${params.toString()}`,
      );

      setCompanies(data.companies || []);
      setPagination(
        data.pagination || {
          total: 0,
          totalPages: 1,
        },
      );
      setIndustries(data.industries || []);
    } catch (error) {
      console.error("Companies Load Error:", error);
      toast.error(
        error.message || "Unable to load companies",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    // Filters/page intentionally control the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, industry, status]);

  useEffect(() => {
    const handleGlobalSearch = (event) => {
      if (!event.detail?.pathname?.includes("/companies")) return;
      setSearch(event.detail.value || "");
      setPage(1);
    };

    window.addEventListener(
      "jobhub:superAdminSearch",
      handleGlobalSearch,
    );

    return () =>
      window.removeEventListener(
        "jobhub:superAdminSearch",
        handleGlobalSearch,
      );
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    loadCompanies();
  };

  const openAdd = () => {
    setForm(emptyForm);
    setSelectedCompany(null);
    setModal("add");
  };

  const openEdit = (company) => {
    setSelectedCompany(company);
    setForm({
      ...emptyForm,
      companyName: company.companyName || "",
      industry: company.industry || "",
      location: company.location || "",
    });
    setModal("edit");
  };

  const openView = (company) => {
    setSelectedCompany(company);
    setModal("view");
  };

  const closeModal = () => {
    if (!saving) setModal(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      await superAdminFetch(
        "/api/super-admin/companies",
        {
          method: "POST",
          body: JSON.stringify(form),
        },
      );

      toast.success("Company created successfully");
      setModal(null);
      setPage(1);
      await loadCompanies();
    } catch (error) {
      toast.error(error.message || "Unable to create company");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      await superAdminFetch(
        `/api/super-admin/companies/${selectedCompany.adminId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            companyName: form.companyName,
            industry: form.industry,
            location: form.location,
            status: selectedCompany.status,
          }),
        },
      );

      toast.success("Company updated successfully");
      setModal(null);
      await loadCompanies();
    } catch (error) {
      toast.error(error.message || "Unable to update company");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (company, nextStatus) => {
    try {
      await superAdminFetch(
        `/api/super-admin/companies/${company.adminId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: nextStatus,
          }),
        },
      );

      toast.success(
        nextStatus === "Active"
          ? "Company activated"
          : "Company suspended",
      );
      await loadCompanies();
    } catch (error) {
      toast.error(error.message || "Unable to update company status");
    }
  };

  const handleDelete = async (company) => {
    const confirmed = window.confirm(
      `Remove ${company.companyName || "this company"}? Linked jobs will be closed.`,
    );

    if (!confirmed) return;

    try {
      await superAdminFetch(
        `/api/super-admin/companies/${company.adminId}`,
        {
          method: "DELETE",
        },
      );

      toast.success("Company removed successfully");
      await loadCompanies();
    } catch (error) {
      toast.error(error.message || "Unable to remove company");
    }
  };

  return (
    <section className="superManagementPage">
      <div className="superManagementHeader">
        <div>
          <h1>Companies Management</h1>
          <p>Manage all registered companies on the platform.</p>
        </div>

        <button
          type="button"
          className="superPrimaryButton"
          onClick={openAdd}
        >
          <Plus size={16} />
          Add Company
        </button>
      </div>

      <div className="superToolbar">
        <form
          className="superToolbarSearch"
          onSubmit={handleSearchSubmit}
        >
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search companies..."
          />
        </form>

        <select
          value={industry}
          onChange={(event) => {
            setIndustry(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Industries</option>
          {industries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>

        <button
          type="button"
          className="superFilterButton"
          onClick={loadCompanies}
        >
          <Filter size={15} />
          Filter
        </button>
      </div>

      <div className="superTableCard">
        <div className="superTableScroll">
          <table className="superManagementTable">
            <thead>
              <tr>
                <th>#</th>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Jobs</th>
                <th>Admins</th>
                <th>Status</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="superTableState">
                    Loading companies...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan="9" className="superTableState">
                    No companies found.
                  </td>
                </tr>
              ) : (
                companies.map((company, index) => (
                  <tr key={company.adminId || company._id}>
                    <td>
                      {(page - 1) * 10 + index + 1}
                    </td>

                    <td>
                      <div className="companyNameCell">
                        <span className="companyTableLogo">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt=""
                            />
                          ) : (
                            <Building2 size={17} />
                          )}
                        </span>
                        <strong>{company.companyName || "—"}</strong>
                      </div>
                    </td>

                    <td>{company.industry || "—"}</td>
                    <td>
                      <span className="inlineMeta">
                        <MapPin size={13} />
                        {company.location || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="inlineMeta">
                        <BriefcaseBusiness size={13} />
                        {company.jobs || 0}
                      </span>
                    </td>
                    <td>{company.adminCount || 0}</td>

                    <td>
                      <span
                        className={`statusBadge ${String(
                          company.status || "Active",
                        ).toLowerCase()}`}
                      >
                        {company.status || "Active"}
                      </span>
                    </td>

                    <td>{formatDate(company.registeredOn)}</td>

                    <td>
                      <div className="tableActions">
                        <button
                          type="button"
                          title="View"
                          onClick={() => openView(company)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(company)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title={
                            company.status === "Suspended"
                              ? "Activate"
                              : "Suspend"
                          }
                          onClick={() =>
                            handleStatus(
                              company,
                              company.status === "Suspended"
                                ? "Active"
                                : "Suspended",
                            )
                          }
                        >
                          {company.status === "Suspended" ? (
                            <CircleCheck size={15} />
                          ) : (
                            <Ban size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          title="Remove"
                          onClick={() => handleDelete(company)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="superTableFooter">
          <span>
            Showing {companies.length ? (page - 1) * 10 + 1 : 0} to{" "}
            {(page - 1) * 10 + companies.length} of {pagination.total} companies
          </span>

          <div className="superPagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
            >
              ‹
            </button>

            <span className="active">{page}</span>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((previous) => previous + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <div
          className="superModalBackdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="superModalCard">
            <div className="superModalHeader">
              <div>
                <h2>
                  {modal === "add"
                    ? "Add Company"
                    : modal === "edit"
                      ? "Edit Company"
                      : "Company Details"}
                </h2>
                <p>
                  {modal === "view"
                    ? "Current information from JobHub."
                    : "Keep company information accurate for the platform."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {modal === "view" ? (
              <div className="companyDetailGrid">
                <div className="companyDetailLogo">
                  {selectedCompany?.logo ? (
                    <img src={selectedCompany.logo} alt="" />
                  ) : (
                    <Building2 size={30} />
                  )}
                </div>
                <div>
                  <h3>{selectedCompany?.companyName || "—"}</h3>
                  <p>{selectedCompany?.industry || "Industry not added"}</p>
                </div>
                <div className="companyDetailItem">
                  <span>Location</span>
                  <strong>{selectedCompany?.location || "—"}</strong>
                </div>
                <div className="companyDetailItem">
                  <span>Jobs</span>
                  <strong>{selectedCompany?.jobs || 0}</strong>
                </div>
                <div className="companyDetailItem">
                  <span>Admins</span>
                  <strong>{selectedCompany?.adminCount || 0}</strong>
                </div>
                <div className="companyDetailItem">
                  <span>Status</span>
                  <strong>{selectedCompany?.status || "Active"}</strong>
                </div>
                <div className="companyDetailItem">
                  <span>Registered</span>
                  <strong>{formatDate(selectedCompany?.registeredOn)}</strong>
                </div>
                <div className="companyDetailWarning">
                  <ShieldAlert size={17} />
                  Company accounts are managed through the current JobHub company-admin architecture.
                </div>
              </div>
            ) : (
              <form
                className="superModalForm"
                onSubmit={modal === "add" ? handleAdd : handleEdit}
              >
                <div className="superFormGrid">
                  <label>
                    Company Name
                    <input
                      name="companyName"
                      value={form.companyName}
                      onChange={handleFormChange}
                      required
                    />
                  </label>

                  {modal === "add" && (
                    <>
                      <label>
                        Admin Email
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleFormChange}
                          required
                        />
                      </label>

                      <label>
                        Phone
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleFormChange}
                          required
                        />
                      </label>

                      <label>
                        Temporary Password
                        <input
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={handleFormChange}
                          minLength={6}
                          required
                        />
                      </label>
                    </>
                  )}

                  <label>
                    Industry
                    <input
                      name="industry"
                      value={form.industry}
                      onChange={handleFormChange}
                      placeholder="e.g. IT Services"
                    />
                  </label>

                  <label>
                    Location
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleFormChange}
                      placeholder="e.g. Hyderabad, Telangana"
                    />
                  </label>
                </div>

                <div className="superModalActions">
                  <button
                    type="button"
                    className="superSecondaryButton"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="superPrimaryButton"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : modal === "add"
                        ? "Create Company"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Companies;
