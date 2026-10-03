import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Info,
  LockKeyhole,
  Mail,
  Menu,
  Save,
  ShieldCheck,
  Smartphone,
  User,
  UserCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

import AdminSidebar from "../AdminSidebar/AdminSidebar";

import "./Settings.css";

function Settings() {
  const [companyAdmin, setCompanyAdmin] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [notifications, setNotifications] = useState({
    newApplications: true,
    interviewUpdates: true,
    hiringUpdates: true,
    rejectionUpdates: true,
  });

  useEffect(() => {
    const storedCompanyAdmin =
      localStorage.getItem("jobhubCompanyAdmin");

    if (!storedCompanyAdmin) return;

    try {
      setCompanyAdmin(JSON.parse(storedCompanyAdmin));
    } catch (error) {
      console.error(
        "Unable to load company information:",
        error
      );
    }
  }, []);

  useEffect(() => {
    const storedSettings =
      localStorage.getItem(
        "jobhubCompanyAdminSettings"
      );

    if (!storedSettings) return;

    try {
      const parsedSettings = JSON.parse(storedSettings);
      const savedNotifications =
        parsedSettings?.notifications;

      if (savedNotifications) {
        setNotifications({
          newApplications:
            savedNotifications.newApplications ?? true,
          interviewUpdates:
            savedNotifications.interviewUpdates ?? true,
          hiringUpdates:
            savedNotifications.hiringUpdates ?? true,
          rejectionUpdates:
            savedNotifications.rejectionUpdates ?? true,
        });
      }
    } catch (error) {
      console.error(
        "Unable to load settings:",
        error
      );
    }
  }, []);

  const handleNotificationChange = (name) => {
    setNotifications((current) => ({
      ...current,
      [name]: !current[name],
    }));

    setSaveMessage("");
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(
        "jobhubCompanyAdminSettings",
        JSON.stringify({
          notifications,
          updatedAt: new Date().toISOString(),
        })
      );

      setSaveMessage("Settings saved successfully.");

      window.setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Unable to save settings:",
        error
      );

      setSaveMessage("Unable to save settings.");
    }
  };

  const scrollToSection = (sectionId) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const companyName =
    companyAdmin?.companyName || "Company";

  const companyEmail =
    companyAdmin?.email || "Email not available";

  const companyPhone =
    companyAdmin?.phone || "Phone not available";

  const companyInitial = companyName
    .charAt(0)
    .toUpperCase();

  return (
    <main className="companySettingsPage">
      {isSidebarOpen && (
        <div
          className="companySettingsSidebarOverlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <section className="companySettingsMain">
        <header className="companySettingsTopbar">
          <div className="companySettingsTopbarLeft">
            <button
              type="button"
              className="companySettingsMenuButton"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div className="companySettingsTopbarTitle">
              <span>COMPANY ADMIN</span>
              <h1>Settings</h1>
            </div>
          </div>

          <div className="companySettingsTopbarRight">
            <button
              type="button"
              className="companySettingsNotificationButton"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="companySettingsAdmin">
              <div className="companySettingsAdminAvatar">
                {companyInitial}
              </div>

              <div className="companySettingsAdminInfo">
                <strong>{companyName}</strong>
                <span>Company Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="companySettingsContent">
          <section className="companySettingsIntro">
            <div>
              <span className="companySettingsEyebrow">
                ACCOUNT SETTINGS
              </span>

              <h2>Manage your settings</h2>

              <p>
                Control your company admin account,
                notifications and security preferences.
              </p>
            </div>

            <div className="companySettingsIntroBadge">
              <ShieldCheck size={18} />
              <span>Account protected</span>
            </div>
          </section>

          <section className="companySettingsLayout">
            <aside className="companySettingsNav">
              <div className="companySettingsNavHeading">
                Settings
              </div>

              <button
                type="button"
                className="companySettingsNavItem active"
                onClick={() => scrollToSection("company-settings-general")}
              >
                <User size={17} />
                <span>General</span>
                <ChevronRight size={15} />
              </button>

              <button
                type="button"
                className="companySettingsNavItem"
                onClick={() =>
                  scrollToSection(
                    "company-settings-notifications"
                  )
                }
              >
                <Bell size={17} />
                <span>Notifications</span>
                <ChevronRight size={15} />
              </button>

              <button
                type="button"
                className="companySettingsNavItem"
                onClick={() =>
                  scrollToSection("company-settings-security")
                }
              >
                <LockKeyhole size={17} />
                <span>Security</span>
                <ChevronRight size={15} />
              </button>
            </aside>

            <div className="companySettingsPanels">
              <article
                id="company-settings-general"
                className="companySettingsPanel"
              >
                <div className="companySettingsPanelHeader">
                  <div className="companySettingsPanelIcon blue">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <h3>Company account</h3>

                    <p>
                      Review the company information connected
                      to your employer account.
                    </p>
                  </div>
                </div>

                <div className="companySettingsAccountCard">
                  <div className="companySettingsAccountIdentity">
                    <div className="companySettingsCompanyAvatar">
                      {companyInitial}
                    </div>

                    <div>
                      <strong>{companyName}</strong>
                      <span>Company Administrator</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="companySettingsSecondaryButton"
                    onClick={() => {
                      window.location.href =
                        "/company-admin/profile";
                    }}
                  >
                    Manage Profile
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="companySettingsInfoGrid">
                  <div className="companySettingsInfoItem">
                    <div className="companySettingsInfoIcon">
                      <Mail size={16} />
                    </div>

                    <div>
                      <span>Company Email</span>
                      <strong>{companyEmail}</strong>
                    </div>
                  </div>

                  <div className="companySettingsInfoItem">
                    <div className="companySettingsInfoIcon">
                      <Smartphone size={16} />
                    </div>

                    <div>
                      <span>Phone Number</span>
                      <strong>{companyPhone}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <article
                id="company-settings-notifications"
                className="companySettingsPanel"
              >
                <div className="companySettingsPanelHeader">
                  <div className="companySettingsPanelIcon purple">
                    <Bell size={19} />
                  </div>

                  <div>
                    <h3>Notifications</h3>

                    <p>
                      Choose which hiring activity updates you want
                      to receive.
                    </p>
                  </div>
                </div>

                <div className="companySettingsOptionList">
                  <NotificationOption
                    icon={<FileText size={17} />}
                    title="New applications"
                    description="Get notified when a candidate applies to one of your jobs."
                    checked={notifications.newApplications}
                    onChange={() =>
                      handleNotificationChange(
                        "newApplications"
                      )
                    }
                  />

                  <NotificationOption
                    icon={<CalendarDays size={17} />}
                    title="Interview updates"
                    description="Get notified about interview scheduling and changes."
                    checked={notifications.interviewUpdates}
                    onChange={() =>
                      handleNotificationChange(
                        "interviewUpdates"
                      )
                    }
                  />

                  <NotificationOption
                    icon={<UserCheck size={17} />}
                    title="Hiring updates"
                    description="Get notified when candidates are moved to the hired stage."
                    checked={notifications.hiringUpdates}
                    onChange={() =>
                      handleNotificationChange(
                        "hiringUpdates"
                      )
                    }
                  />

                  <NotificationOption
                    icon={<Info size={17} />}
                    title="Rejection updates"
                    description="Keep track of candidate rejection activity."
                    checked={notifications.rejectionUpdates}
                    onChange={() =>
                      handleNotificationChange(
                        "rejectionUpdates"
                      )
                    }
                  />
                </div>

                <div className="companySettingsSaveBar">
                  <div
                    className={`companySettingsSaveMessage ${
                      saveMessage ? "visible" : ""
                    }`}
                  >
                    {saveMessage && (
                      <>
                        <Check size={15} />
                        <span>{saveMessage}</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    className="companySettingsPrimaryButton"
                    onClick={handleSaveSettings}
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </article>

              <article
                id="company-settings-security"
                className="companySettingsPanel"
              >
                <div className="companySettingsPanelHeader">
                  <div className="companySettingsPanelIcon green">
                    <LockKeyhole size={19} />
                  </div>

                  <div>
                    <h3>Security</h3>

                    <p>
                      Review the security status of your Company
                      Admin account.
                    </p>
                  </div>
                </div>

                <div className="companySettingsSecurityCard">
                  <div className="companySettingsSecurityStatus">
                    <div className="companySettingsSecurityCheck">
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <strong>
                        Company Admin authentication
                      </strong>

                      <span>
                        Your account is protected by authenticated
                        company admin access.
                      </span>
                    </div>
                  </div>

                  <span className="companySettingsProtectedBadge">
                    Protected
                  </span>
                </div>

                <div className="companySettingsSecurityNote">
                  <Info size={16} />

                  <p>
                    Keep your account credentials private and sign
                    in only through the JobHub Company Admin portal.
                  </p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function NotificationOption({
  icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="companySettingsOption">
      <div className="companySettingsOptionIcon">
        {icon}
      </div>

      <div className="companySettingsOptionText">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={`companySettingsToggle ${
          checked ? "on" : ""
        }`}
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        aria-pressed={checked}
      >
        <span />
      </button>
    </div>
  );
}

export default Settings;
