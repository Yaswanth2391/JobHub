import { useEffect, useState } from "react";

import {
  UserRound,
  ShieldCheck,
  KeyRound,
  Save,
  LockKeyhole,
  Mail,
  CalendarDays,
  CircleCheck,
  LogOut,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  clearSuperAdminSession,
  getStoredSuperAdmin,
  saveSuperAdminSession,
  superAdminFetch,
} from "../../../services/superAdminApi";

import "./Settings.css";

const emptyProfile = {
  fullName: "Super Admin",
  email: "",
  role: "superAdmin",
  status: "Active",
  createdAt: null,
  updatedAt: null,
  lastLoginAt: null,
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Settings() {
  const [profile, setProfile] = useState(emptyProfile);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data = await superAdminFetch(
        "/api/super-admin/profile",
      );

      const nextProfile = {
        ...emptyProfile,
        ...(data.profile || {}),
      };

      setProfile(nextProfile);
      setProfileForm({
        fullName: nextProfile.fullName || "",
        email: nextProfile.email || "",
      });
    } catch (error) {
      console.error("Super Admin Settings Load Error:", error);
      toast.error(error.message || "Unable to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateProfileField = (field, value) => {
    setProfileForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    const fullName = profileForm.fullName.trim();
    const email = profileForm.email.trim().toLowerCase();

    if (!fullName || !email) {
      toast.error("Full name and email are required");
      return;
    }

    try {
      setSavingProfile(true);

      const data = await superAdminFetch(
        "/api/super-admin/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            fullName,
            email,
          }),
        },
      );

      const nextProfile = {
        ...profile,
        ...(data.profile || {}),
      };

      setProfile(nextProfile);

      const storedAdmin = getStoredSuperAdmin() || {};

      saveSuperAdminSession(
        localStorage.getItem("jobhubSuperAdminToken") || "",
        {
          ...storedAdmin,
          id: data.profile?.id || storedAdmin.id,
          fullName: data.profile?.fullName || fullName,
          email: data.profile?.email || email,
          role: data.profile?.role || storedAdmin.role || "superAdmin",
        },
      );

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Enter your current and new password");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);

      await superAdminFetch(
        "/api/super-admin/profile/password",
        {
          method: "PUT",
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        },
      );

      toast.success("Password changed. Please sign in again.");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        clearSuperAdminSession();
        window.location.replace("/super-admin/login");
      }, 900);
    } catch (error) {
      toast.error(error.message || "Unable to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <section className="superAdminSettingsPage">
        <div className="superAdminSettingsLoading">
          Loading settings...
        </div>
      </section>
    );
  }

  return (
    <section className="superAdminSettingsPage">
      <div className="superAdminSettingsHeader">
        <div>
          <p className="superAdminSettingsEyebrow">ACCOUNT SETTINGS</p>
          <h1>Settings</h1>
          <p>
            Manage your Super Admin profile and account security.
          </p>
        </div>
      </div>

      <div className="superAdminSettingsGrid">
        {/* PROFILE */}
        <div className="superAdminSettingsCard">
          <div className="superAdminSettingsCardHeader">
            <div className="superAdminSettingsIcon profileIcon">
              <UserRound size={19} />
            </div>
            <div>
              <h2>Profile Information</h2>
              <p>Update the information shown across the admin portal.</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="superAdminSettingsForm">
            <label>
              Full Name
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(event) =>
                  updateProfileField("fullName", event.target.value)
                }
                autoComplete="name"
              />
            </label>

            <label>
              Email Address
              <div className="settingsInputWithIcon">
                <Mail size={15} />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    updateProfileField("email", event.target.value)
                  }
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              Role
              <input
                type="text"
                value="Super Admin"
                disabled
              />
            </label>

            <label>
              Account Status
              <div className="settingsStatusField">
                <span className="settingsStatusDot" />
                {profile.status || "Active"}
              </div>
            </label>

            <div className="settingsFormActions">
              <button
                type="submit"
                className="superPrimaryButton"
                disabled={savingProfile}
              >
                <Save size={15} />
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* SECURITY */}
        <div className="superAdminSettingsCard">
          <div className="superAdminSettingsCardHeader">
            <div className="superAdminSettingsIcon securityIcon">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2>Account Security</h2>
              <p>Keep your Super Admin credentials secure.</p>
            </div>
          </div>

          <form onSubmit={changePassword} className="superAdminSettingsForm">
            <label>
              Current Password
              <div className="settingsInputWithIcon">
                <LockKeyhole size={15} />
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    updatePasswordField(
                      "currentPassword",
                      event.target.value,
                    )
                  }
                  autoComplete="current-password"
                />
              </div>
            </label>

            <label>
              New Password
              <div className="settingsInputWithIcon">
                <KeyRound size={15} />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    updatePasswordField(
                      "newPassword",
                      event.target.value,
                    )
                  }
                  autoComplete="new-password"
                />
              </div>
            </label>

            <label>
              Confirm New Password
              <div className="settingsInputWithIcon">
                <KeyRound size={15} />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    updatePasswordField(
                      "confirmPassword",
                      event.target.value,
                    )
                  }
                  autoComplete="new-password"
                />
              </div>
            </label>

            <div className="passwordHint">
              <CircleCheck size={14} />
              Use at least 6 characters and avoid reusing old passwords.
            </div>

            <div className="settingsFormActions">
              <button
                type="submit"
                className="superPrimaryButton"
                disabled={changingPassword}
              >
                <KeyRound size={15} />
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>

        {/* ACCOUNT DETAILS */}
        <div className="superAdminSettingsCard accountDetailsCard">
          <div className="superAdminSettingsCardHeader">
            <div className="superAdminSettingsIcon accountIcon">
              <CalendarDays size={19} />
            </div>
            <div>
              <h2>Account Details</h2>
              <p>Reference information for this Super Admin account.</p>
            </div>
          </div>

          <div className="accountDetailsList">
            <div>
              <span>Account Created</span>
              <strong>{formatDate(profile.createdAt)}</strong>
            </div>

            <div>
              <span>Last Updated</span>
              <strong>{formatDate(profile.updatedAt)}</strong>
            </div>

            <div>
              <span>Last Login</span>
              <strong>{formatDate(profile.lastLoginAt)}</strong>
            </div>

            <div>
              <span>Access Level</span>
              <strong>Full platform access</strong>
            </div>
          </div>
        </div>

        {/* SESSION */}
        <div className="superAdminSettingsCard sessionCard">
          <div className="superAdminSettingsCardHeader">
            <div className="superAdminSettingsIcon sessionIcon">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2>Session & Access</h2>
              <p>Quick controls for your current administrator session.</p>
            </div>
          </div>

          <div className="sessionInfoBox">
            <span className="sessionOnlineIndicator" />
            <div>
              <strong>Current session is active</strong>
              <p>
                You are signed in as {profile.email || "Super Admin"}.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="settingsLogoutButton"
            onClick={() => {
              clearSuperAdminSession();
              window.location.replace("/super-admin/login");
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;
