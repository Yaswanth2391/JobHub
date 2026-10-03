import { useEffect, useState } from "react";

import {
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  UserRound,
  MapPin,
  Phone,
  Mail,
  Filter,
  CircleCheck,
  Ban,
  FileText,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  superAdminFetch,
} from "../../../services/superAdminApi";

import "../Companies/Companies.css";

import "./Users.css";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
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

function Users() {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);
      if (location) params.set("location", location);

      const data = await superAdminFetch(
        `/api/super-admin/users?${params.toString()}`,
      );

      setUsers(data.users || []);
      setLocations(data.locations || []);
      setPagination(
        data.pagination || {
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error("Users Load Error:", error);
      toast.error(error.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, location]);

  useEffect(() => {
    const handleGlobalSearch = (event) => {
      if (!event.detail?.pathname?.includes("/users")) return;
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
    loadUsers();
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
    });
    setModal("edit");
  };

  const openView = (user) => {
    setSelectedUser(user);
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

  const handleEdit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      await superAdminFetch(
        `/api/super-admin/users/${selectedUser._id}`,
        {
          method: "PUT",
          body: JSON.stringify(form),
        },
      );

      toast.success("User updated successfully");
      setModal(null);
      await loadUsers();
    } catch (error) {
      toast.error(error.message || "Unable to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (user) => {
    const nextStatus =
      user.status === "Suspended"
        ? "Active"
        : "Suspended";

    try {
      await superAdminFetch(
        `/api/super-admin/users/${user._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: nextStatus,
          }),
        },
      );

      toast.success(
        nextStatus === "Active"
          ? "User activated"
          : "User suspended",
      );

      await loadUsers();
    } catch (error) {
      toast.error(
        error.message || "Unable to update user status",
      );
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Remove ${user.fullName || user.email}? This permanently deletes the candidate account.`,
    );

    if (!confirmed) return;

    try {
      await superAdminFetch(
        `/api/super-admin/users/${user._id}`,
        {
          method: "DELETE",
        },
      );

      toast.success("User removed successfully");
      await loadUsers();
    } catch (error) {
      toast.error(error.message || "Unable to remove user");
    }
  };

  return (
    <section className="superManagementPage">
      <div className="superManagementHeader">
        <div>
          <h1>Users Management</h1>
          <p>Manage all registered candidates on the platform.</p>
        </div>
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
            placeholder="Search users..."
          />
        </form>

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

        <select
          value={location}
          onChange={(event) => {
            setLocation(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Locations</option>
          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="superFilterButton"
          onClick={loadUsers}
        >
          <Filter size={15} />
          Filter
        </button>
      </div>

      <div className="superTableCard">
        <div className="superTableScroll">
          <table className="superManagementTable userTable">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Registered On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="superTableState">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="superTableState">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{(page - 1) * 10 + index + 1}</td>

                    <td>
                      <div className="userNameCell">
                        <span className="userAvatar">
                          {(user.fullName || "U")
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <strong>{user.fullName || "—"}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="inlineMeta">
                        <Mail size={12} />
                        {user.email || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="inlineMeta">
                        <Phone size={12} />
                        {user.phone || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="inlineMeta">
                        <MapPin size={12} />
                        {user.location || "—"}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span
                        className={`statusBadge ${String(
                          user.status || "Active",
                        ).toLowerCase()}`}
                      >
                        {user.status || "Active"}
                      </span>
                    </td>

                    <td>
                      <div className="tableActions">
                        <button
                          type="button"
                          title="View"
                          onClick={() => openView(user)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title={
                            user.status === "Suspended"
                              ? "Activate"
                              : "Suspend"
                          }
                          onClick={() => handleStatus(user)}
                        >
                          {user.status === "Suspended" ? (
                            <CircleCheck size={15} />
                          ) : (
                            <Ban size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          title="Remove"
                          onClick={() => handleDelete(user)}
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
            Showing {users.length ? (page - 1) * 10 + 1 : 0} to{" "}
            {(page - 1) * 10 + users.length} of {pagination.total} users
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
                  {modal === "edit"
                    ? "Edit User"
                    : "User Details"}
                </h2>
                <p>Manage candidate account information and access.</p>
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
              <div className="userDetailBody">
                <div className="userDetailHero">
                  <span className="userDetailAvatar">
                    {(selectedUser?.fullName || "U")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div>
                    <h3>{selectedUser?.fullName || "—"}</h3>
                    <p>{selectedUser?.email || "—"}</p>
                  </div>
                </div>

                <div className="userDetailGrid">
                  <div><span>Phone</span><strong>{selectedUser?.phone || "—"}</strong></div>
                  <div><span>Location</span><strong>{selectedUser?.location || "—"}</strong></div>
                  <div><span>Status</span><strong>{selectedUser?.status || "Active"}</strong></div>
                  <div><span>Registered</span><strong>{formatDate(selectedUser?.createdAt)}</strong></div>
                </div>

                <div className="userDetailResume">
                  <FileText size={18} />
                  <div>
                    <strong>Resume</strong>
                    <span>
                      Candidate resume and profile data remain available through the existing candidate profile flow.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form
                className="superModalForm"
                onSubmit={handleEdit}
              >
                <div className="superFormGrid">
                  <label>
                    Full Name
                    <input
                      name="fullName"
                      value={form.fullName}
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
                    Location
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleFormChange}
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
                    {saving ? "Saving..." : "Save Changes"}
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

export default Users;
