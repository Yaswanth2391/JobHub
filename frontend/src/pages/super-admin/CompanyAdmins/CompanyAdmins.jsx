import { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  UsersRound,
  Mail,
  Phone,
  Building2,
  Filter,
  CircleCheck,
  Ban,
  ShieldAlert,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  superAdminFetch,
} from "../../../services/superAdminApi";

import "../Companies/Companies.css";

import "./CompanyAdmins.css";

const emptyForm = {
  companyName: "",
  email: "",
  phone: "",
  password: "",
  role: "Company Admin",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function CompanyAdmins() {
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [modal, setModal] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (company) params.set("company", company);
      if (status) params.set("status", status);

      const data = await superAdminFetch(
        `/api/super-admin/company-admins?${params.toString()}`,
      );

      setAdmins(data.admins || []);
      setCompanies(data.companies || []);
      setPagination(
        data.pagination || {
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error("Company Admins Load Error:", error);
      toast.error(
        error.message || "Unable to load company admins",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, company, status]);

  useEffect(() => {
    const handleGlobalSearch = (event) => {
      if (!event.detail?.pathname?.includes("/company-admins")) return;
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
    loadAdmins();
  };

  const openAdd = () => {
    setForm(emptyForm);
    setSelectedAdmin(null);
    setModal("add");
  };

  const openEdit = (admin) => {
    setSelectedAdmin(admin);
    setForm({
      companyName: admin.companyName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      password: "",
      role: admin.role || "Company Admin",
    });
    setModal("edit");
  };

  const openView = (admin) => {
    setSelectedAdmin(admin);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      if (modal === "add") {
        await superAdminFetch(
          "/api/super-admin/company-admins",
          {
            method: "POST",
            body: JSON.stringify(form),
          },
        );

        toast.success("Company admin created successfully");
      } else {
        const payload = {
          companyName: form.companyName,
          email: form.email,
          phone: form.phone,
          role: form.role,
        };

        if (form.password) {
          payload.password = form.password;
        }

        await superAdminFetch(
          `/api/super-admin/company-admins/${selectedAdmin._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );

        toast.success("Company admin updated successfully");
      }

      setModal(null);
      await loadAdmins();
    } catch (error) {
      toast.error(
        error.message || "Unable to save company admin",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (admin) => {
    const nextStatus =
      admin.status === "Suspended"
        ? "Active"
        : "Suspended";

    try {
      await superAdminFetch(
        `/api/super-admin/company-admins/${admin._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: nextStatus,
          }),
        },
      );

      toast.success(
        nextStatus === "Active"
          ? "Company admin activated"
          : "Company admin suspended",
      );

      await loadAdmins();
    } catch (error) {
      toast.error(
        error.message || "Unable to update admin status",
      );
    }
  };

  const handleDelete = async (admin) => {
    const confirmed = window.confirm(
      `Remove ${admin.email}? Jobs linked to this administrator will be closed.`,
    );

    if (!confirmed) return;

    try {
      await superAdminFetch(
        `/api/super-admin/company-admins/${admin._id}`,
        {
          method: "DELETE",
        },
      );

      toast.success("Company admin removed successfully");
      await loadAdmins();
    } catch (error) {
      toast.error(
        error.message || "Unable to remove company admin",
      );
    }
  };

  return (
    <section className="superManagementPage">
      <div className="superManagementHeader">
        <div>
          <h1>Company Admins Management</h1>
          <p>Manage company administrators and their access.</p>
        </div>

        <button
          type="button"
          className="superPrimaryButton"
          onClick={openAdd}
        >
          <Plus size={16} />
          Add Admin
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
            placeholder="Search admins..."
          />
        </form>

        <select
          value={company}
          onChange={(event) => {
            setCompany(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Companies</option>
          {companies.map((item) => (
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
          onClick={loadAdmins}
        >
          <Filter size={15} />
          Filter
        </button>
      </div>

      <div className="superTableCard">
        <div className="superTableScroll">
          <table className="superManagementTable adminTable">
            <thead>
              <tr>
                <th>#</th>
                <th>Name / Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined On</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="superTableState">
                    Loading company admins...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="8" className="superTableState">
                    No company admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin._id}>
                    <td>{(page - 1) * 10 + index + 1}</td>

                    <td>
                      <div className="adminNameCell">
                        <span className="adminAvatar">
                          {(admin.email || "A")[0].toUpperCase()}
                        </span>
                        <div>
                          <strong>{admin.role || "Company Admin"}</strong>
                          <span>{admin.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="inlineMeta">
                        <Phone size={12} />
                        {admin.phone || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="inlineMeta">
                        <Building2 size={13} />
                        {admin.companyName || "—"}
                      </span>
                    </td>

                    <td>{admin.role || "Company Admin"}</td>

                    <td>
                      <span
                        className={`statusBadge ${String(
                          admin.status || "Active",
                        ).toLowerCase()}`}
                      >
                        {admin.status || "Active"}
                      </span>
                    </td>

                    <td>{formatDate(admin.createdAt)}</td>

                    <td>
                      <div className="tableActions">
                        <button
                          type="button"
                          title="View"
                          onClick={() => openView(admin)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(admin)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title={
                            admin.status === "Suspended"
                              ? "Activate"
                              : "Suspend"
                          }
                          onClick={() => handleStatus(admin)}
                        >
                          {admin.status === "Suspended" ? (
                            <CircleCheck size={15} />
                          ) : (
                            <Ban size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          title="Remove"
                          onClick={() => handleDelete(admin)}
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
            Showing {admins.length ? (page - 1) * 10 + 1 : 0} to{" "}
            {(page - 1) * 10 + admins.length} of {pagination.total} admins
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
                    ? "Add Company Admin"
                    : modal === "edit"
                      ? "Edit Company Admin"
                      : "Administrator Details"}
                </h2>
                <p>
                  Control administrator access to the JobHub platform.
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
              <div className="adminDetailBody">
                <div className="adminDetailHero">
                  <span className="adminDetailAvatar">
                    {(selectedAdmin?.email || "A")[0].toUpperCase()}
                  </span>
                  <div>
                    <h3>{selectedAdmin?.role || "Company Admin"}</h3>
                    <p>{selectedAdmin?.email || "—"}</p>
                  </div>
                </div>

                <div className="adminDetailGrid">
                  <div><span>Company</span><strong>{selectedAdmin?.companyName || "—"}</strong></div>
                  <div><span>Phone</span><strong>{selectedAdmin?.phone || "—"}</strong></div>
                  <div><span>Status</span><strong>{selectedAdmin?.status || "Active"}</strong></div>
                  <div><span>Joined On</span><strong>{formatDate(selectedAdmin?.createdAt)}</strong></div>
                  <div><span>Location</span><strong>{selectedAdmin?.location || "—"}</strong></div>
                  <div><span>Industry</span><strong>{selectedAdmin?.industry || "—"}</strong></div>
                </div>

                <div className="adminDetailNotice">
                  <ShieldAlert size={17} />
                  Suspending this account prevents company-admin login while preserving existing job/application records.
                </div>
              </div>
            ) : (
              <form
                className="superModalForm"
                onSubmit={handleSubmit}
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

                  <label>
                    Email
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
                    Role
                    <input
                      name="role"
                      value={form.role}
                      onChange={handleFormChange}
                    />
                  </label>

                  <label className="fullWidthFormField">
                    {modal === "add"
                      ? "Temporary Password"
                      : "New Password (optional)"}
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleFormChange}
                      minLength={6}
                      required={modal === "add"}
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
                    {saving ? "Saving..." : "Save Admin"}
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

export default CompanyAdmins;
