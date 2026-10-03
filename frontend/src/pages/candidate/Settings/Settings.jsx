import {
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  FileText,
  Info,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import CandidateSidebar from "../../../components/CandidateSidebar/CandidateSidebar";

import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  /* =====================================
     STATE
  ===================================== */

  const [candidate, setCandidate] =
    useState(null);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("general");

  const [saveMessage, setSaveMessage] =
    useState("");

  const [
    notifications,
    setNotifications,
  ] = useState({
    newJobAlerts: true,
    applicationUpdates: true,
    interviewUpdates: true,
    hiringUpdates: true,
  });

  /* =====================================
     LOAD CANDIDATE
  ===================================== */

  useEffect(() => {
    const storedCandidate =
      localStorage.getItem(
        "jobhubCandidate"
      );

    if (!storedCandidate) {
      return;
    }

    try {
      setCandidate(
        JSON.parse(
          storedCandidate
        )
      );
    } catch (error) {
      console.error(
        "Unable to load candidate:",
        error
      );

      setCandidate(null);
    }
  }, []);

  /* =====================================
     LOAD SETTINGS
  ===================================== */

  useEffect(() => {
    const storedSettings =
      localStorage.getItem(
        "jobhubCandidateSettings"
      );

    if (!storedSettings) {
      return;
    }

    try {
      const parsedSettings =
        JSON.parse(
          storedSettings
        );

      if (
        parsedSettings?.notifications
      ) {
        setNotifications({
          newJobAlerts:
            parsedSettings.notifications
              .newJobAlerts ??
            true,

          applicationUpdates:
            parsedSettings.notifications
              .applicationUpdates ??
            true,

          interviewUpdates:
            parsedSettings.notifications
              .interviewUpdates ??
            true,

          hiringUpdates:
            parsedSettings.notifications
              .hiringUpdates ??
            true,
        });
      }
    } catch (error) {
      console.error(
        "Unable to load candidate settings:",
        error
      );
    }
  }, []);

  /* =====================================
     INITIALS
  ===================================== */

  const getInitials = (
    fullName
  ) => {
    if (!fullName) {
      return "U";
    }

    return fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name
          .charAt(0)
          .toUpperCase()
      )
      .join("");
  };

  /* =====================================
     CANDIDATE DATA
  ===================================== */

  const fullName =
    candidate?.fullName ||
    "Candidate";

  const email =
    candidate?.email ||
    "Email not available";

  const phone =
    candidate?.phone ||
    "Phone not available";

  const location =
    candidate?.location ||
    "Location not added";

  const initials =
    getInitials(fullName);

  /* =====================================
     TOGGLE NOTIFICATION
  ===================================== */

  const handleNotificationChange =
    (name) => {
      setNotifications(
        (current) => ({
          ...current,
          [name]:
            !current[name],
        })
      );

      setSaveMessage("");
    };

  /* =====================================
     SAVE SETTINGS
  ===================================== */

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(
        "jobhubCandidateSettings",
        JSON.stringify({
          notifications,
          updatedAt:
            new Date().toISOString(),
        })
      );

      setSaveMessage(
        "Settings saved successfully."
      );

      window.setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Unable to save settings:",
        error
      );

      setSaveMessage(
        "Unable to save settings."
      );
    }
  };

  /* =====================================
     SECTION NAVIGATION
  ===================================== */

  const scrollToSection = (
    sectionId
  ) => {
    setActiveSection(
      sectionId
    );

    document
      .getElementById(
        sectionId
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    setIsSidebarOpen(false);
  };

  /* =====================================
     PROFILE NAVIGATION
  ===================================== */

  const handleManageProfile =
    () => {
      navigate("/profile");
    };

  /* =====================================
     JOB ALERTS NAVIGATION
  ===================================== */

  const handleJobAlerts =
    () => {
      navigate("/job-alerts");
    };

  /* =====================================
     APPLICATIONS NAVIGATION
  ===================================== */

  const handleApplications =
    () => {
      navigate("/my-applications");
    };

  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout = () => {
    const shouldLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!shouldLogout) {
      return;
    }

    localStorage.removeItem(
      "jobhubCandidateToken"
    );

    localStorage.removeItem(
      "jobhubCandidate"
    );

    localStorage.removeItem(
      "candidate"
    );

    navigate("/");
  };

  return (
    <main className="candidateSettingsPage">
      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {isSidebarOpen && (
        <div
          className="candidateSettingsSidebarOverlay"
          onClick={() =>
            setIsSidebarOpen(
              false
            )
          }
        />
      )}

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <CandidateSidebar />

      {/* =====================================
          MAIN
      ===================================== */}

      <section className="candidateSettingsMain">
        {/* =====================================
            TOPBAR
        ===================================== */}

        <header className="dashboardTopHeader candidateSettingsTopHeader">
          <div className="dashboardHeaderLeft">
            <button
              type="button"
              className="candidateSettingsMenuButton"
              onClick={() =>
                setIsSidebarOpen(
                  true
                )
              }
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="candidateSettingsPageTitle">
              <span>
                CANDIDATE
              </span>

              <h1>
                Settings
              </h1>
            </div>
          </div>

          <div className="dashboardHeaderRight">
            <button
              type="button"
              className="headerNotificationButton"
              onClick={() =>
                navigate(
                  "/job-alerts"
                )
              }
              aria-label="Job alerts"
            >
              <Bell size={16} />
            </button>

            <div className="headerCandidateInfo">
              <div className="headerCandidateAvatar">
                {initials}
              </div>

              <div className="headerCandidateText">
                <strong>
                  {fullName}
                </strong>

                <span>
                  Candidate
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================
            CONTENT
        ===================================== */}

        <div className="candidateSettingsContent">
          {/* =====================================
              INTRO
          ===================================== */}

          <section className="candidateSettingsIntro">
            <div>
              <span className="candidateSettingsEyebrow">
                ACCOUNT SETTINGS
              </span>

              <h2>
                Manage your account
              </h2>

              <p>
                Update your preferences,
                notifications and account
                security from one place.
              </p>
            </div>

            <div className="candidateSettingsProtectedBadge">
              <ShieldCheck
                size={17}
              />

              <span>
                Account protected
              </span>
            </div>
          </section>

          {/* =====================================
              SETTINGS LAYOUT
          ===================================== */}

          <section className="candidateSettingsLayout">
            {/* =====================================
                SETTINGS NAV
            ===================================== */}

            <aside className="candidateSettingsNav">
              <div className="candidateSettingsNavHeading">
                Settings
              </div>

              <button
                type="button"
                className={`candidateSettingsNavItem ${
                  activeSection ===
                  "general"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  scrollToSection(
                    "candidate-settings-general"
                  )
                }
              >
                <User size={17} />

                <span>
                  General
                </span>

                <ChevronRight
                  size={15}
                />
              </button>

              <button
                type="button"
                className={`candidateSettingsNavItem ${
                  activeSection ===
                  "notifications"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  scrollToSection(
                    "candidate-settings-notifications"
                  )
                }
              >
                <Bell size={17} />

                <span>
                  Notifications
                </span>

                <ChevronRight
                  size={15}
                />
              </button>

              <button
                type="button"
                className={`candidateSettingsNavItem ${
                  activeSection ===
                  "job-preferences"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  scrollToSection(
                    "candidate-settings-job-preferences"
                  )
                }
              >
                <BriefcaseBusiness
                  size={17}
                />

                <span>
                  Job Preferences
                </span>

                <ChevronRight
                  size={15}
                />
              </button>

              <button
                type="button"
                className={`candidateSettingsNavItem ${
                  activeSection ===
                  "security"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  scrollToSection(
                    "candidate-settings-security"
                  )
                }
              >
                <LockKeyhole
                  size={17}
                />

                <span>
                  Security
                </span>

                <ChevronRight
                  size={15}
                />
              </button>
            </aside>

            {/* =====================================
                PANELS
            ===================================== */}

            <div className="candidateSettingsPanels">
              {/* =====================================
                  GENERAL
              ===================================== */}

              <article
                id="candidate-settings-general"
                className="candidateSettingsPanel"
              >
                <div className="candidateSettingsPanelHeader">
                  <div className="candidateSettingsPanelIcon blue">
                    <UserRound
                      size={19}
                    />
                  </div>

                  <div>
                    <h3>
                      Profile & account
                    </h3>

                    <p>
                      Review the candidate
                      information connected
                      to your JobHub account.
                    </p>
                  </div>
                </div>

                <div className="candidateSettingsProfileCard">
                  <div className="candidateSettingsProfileIdentity">
                    <div className="candidateSettingsProfileAvatar">
                      {initials}
                    </div>

                    <div>
                      <strong>
                        {fullName}
                      </strong>

                      <span>
                        JobHub Candidate
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="candidateSettingsSecondaryButton"
                    onClick={
                      handleManageProfile
                    }
                  >
                    Manage Profile
                    <ChevronRight
                      size={16}
                    />
                  </button>
                </div>

                <div className="candidateSettingsInfoGrid">
                  <div className="candidateSettingsInfoItem">
                    <div className="candidateSettingsInfoIcon">
                      <Mail
                        size={16}
                      />
                    </div>

                    <div>
                      <span>
                        Email Address
                      </span>

                      <strong>
                        {email}
                      </strong>
                    </div>
                  </div>

                  <div className="candidateSettingsInfoItem">
                    <div className="candidateSettingsInfoIcon">
                      <UserRound
                        size={16}
                      />
                    </div>

                    <div>
                      <span>
                        Account Type
                      </span>

                      <strong>
                        Candidate
                      </strong>
                    </div>
                  </div>

                  <div className="candidateSettingsInfoItem">
                    <div className="candidateSettingsInfoIcon">
                      <MapPin
                        size={16}
                      />
                    </div>

                    <div>
                      <span>
                        Location
                      </span>

                      <strong>
                        {location}
                      </strong>
                    </div>
                  </div>

                  <div className="candidateSettingsInfoItem">
                    <div className="candidateSettingsInfoIcon">
                      <FileText
                        size={16}
                      />
                    </div>

                    <div>
                      <span>
                        Resume
                      </span>

                      <strong>
                        {candidate?.resume?.name ||
                          "Not uploaded"}
                      </strong>
                    </div>
                  </div>
                </div>
              </article>

              {/* =====================================
                  NOTIFICATIONS
              ===================================== */}

              <article
                id="candidate-settings-notifications"
                className="candidateSettingsPanel"
              >
                <div className="candidateSettingsPanelHeader">
                  <div className="candidateSettingsPanelIcon purple">
                    <Bell size={19} />
                  </div>

                  <div>
                    <h3>
                      Notifications
                    </h3>

                    <p>
                      Choose which JobHub
                      activity updates you
                      want to receive.
                    </p>
                  </div>
                </div>

                <div className="candidateSettingsOptionList">
                  <NotificationOption
                    icon={
                      <BriefcaseBusiness
                        size={17}
                      />
                    }
                    title="New job alerts"
                    description="Receive notifications when new jobs match your saved job alert preferences."
                    checked={
                      notifications.newJobAlerts
                    }
                    onChange={() =>
                      handleNotificationChange(
                        "newJobAlerts"
                      )
                    }
                  />

                  <NotificationOption
                    icon={
                      <FileText
                        size={17}
                      />
                    }
                    title="Application updates"
                    description="Get updates when the status of one of your applications changes."
                    checked={
                      notifications.applicationUpdates
                    }
                    onChange={() =>
                      handleNotificationChange(
                        "applicationUpdates"
                      )
                    }
                  />

                  <NotificationOption
                    icon={
                      <Bell size={17} />
                    }
                    title="Interview updates"
                    description="Receive updates about interview schedules, changes and interview details."
                    checked={
                      notifications.interviewUpdates
                    }
                    onChange={() =>
                      handleNotificationChange(
                        "interviewUpdates"
                      )
                    }
                  />

                  <NotificationOption
                    icon={
                      <ShieldCheck
                        size={17}
                      />
                    }
                    title="Hiring updates"
                    description="Get notified when your application reaches the hiring stage."
                    checked={
                      notifications.hiringUpdates
                    }
                    onChange={() =>
                      handleNotificationChange(
                        "hiringUpdates"
                      )
                    }
                  />
                </div>

                <div className="candidateSettingsSaveBar">
                  <div
                    className={`candidateSettingsSaveMessage ${
                      saveMessage
                        ? "visible"
                        : ""
                    }`}
                  >
                    {saveMessage && (
                      <>
                        <Check
                          size={15}
                        />

                        <span>
                          {saveMessage}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    className="candidateSettingsPrimaryButton"
                    onClick={
                      handleSaveSettings
                    }
                  >
                    <Check
                      size={16}
                    />

                    Save Changes
                  </button>
                </div>
              </article>

              {/* =====================================
                  JOB PREFERENCES
              ===================================== */}

              <article
                id="candidate-settings-job-preferences"
                className="candidateSettingsPanel"
              >
                <div className="candidateSettingsPanelHeader">
                  <div className="candidateSettingsPanelIcon orange">
                    <BriefcaseBusiness
                      size={19}
                    />
                  </div>

                  <div>
                    <h3>
                      Job preferences
                    </h3>

                    <p>
                      Manage the searches
                      JobHub uses to find
                      relevant opportunities
                      for you.
                    </p>
                  </div>
                </div>

                <div className="candidateSettingsPreferenceCards">
                  <button
                    type="button"
                    className="candidateSettingsPreferenceCard"
                    onClick={
                      handleJobAlerts
                    }
                  >
                    <div className="candidateSettingsPreferenceIcon">
                      <Bell size={18} />
                    </div>

                    <div className="candidateSettingsPreferenceText">
                      <strong>
                        Job Alerts
                      </strong>

                      <span>
                        Manage roles, skills,
                        locations and alert
                        frequency.
                      </span>
                    </div>

                    <ChevronRight
                      size={18}
                    />
                  </button>

                  <button
                    type="button"
                    className="candidateSettingsPreferenceCard"
                    onClick={
                      handleApplications
                    }
                  >
                    <div className="candidateSettingsPreferenceIcon">
                      <FileText
                        size={18}
                      />
                    </div>

                    <div className="candidateSettingsPreferenceText">
                      <strong>
                        My Applications
                      </strong>

                      <span>
                        Track your applications
                        and their latest
                        status.
                      </span>
                    </div>

                    <ChevronRight
                      size={18}
                    />
                  </button>

                  <button
                    type="button"
                    className="candidateSettingsPreferenceCard"
                    onClick={
                      handleManageProfile
                    }
                  >
                    <div className="candidateSettingsPreferenceIcon">
                      <MapPin
                        size={18}
                      />
                    </div>

                    <div className="candidateSettingsPreferenceText">
                      <strong>
                        Profile Preferences
                      </strong>

                      <span>
                        Keep your skills,
                        experience and location
                        up to date.
                      </span>
                    </div>

                    <ChevronRight
                      size={18}
                    />
                  </button>
                </div>
              </article>

              {/* =====================================
                  SECURITY
              ===================================== */}

              <article
                id="candidate-settings-security"
                className="candidateSettingsPanel"
              >
                <div className="candidateSettingsPanelHeader">
                  <div className="candidateSettingsPanelIcon green">
                    <LockKeyhole
                      size={19}
                    />
                  </div>

                  <div>
                    <h3>
                      Security
                    </h3>

                    <p>
                      Review your JobHub
                      account security and
                      active session.
                    </p>
                  </div>
                </div>

                <div className="candidateSettingsSecurityCard">
                  <div className="candidateSettingsSecurityStatus">
                    <div className="candidateSettingsSecurityCheck">
                      <ShieldCheck
                        size={19}
                      />
                    </div>

                    <div>
                      <strong>
                        Candidate authentication
                      </strong>

                      <span>
                        Your JobHub account is
                        protected by authenticated
                        candidate access.
                      </span>
                    </div>
                  </div>

                  <span className="candidateSettingsSecurityBadge">
                    Protected
                  </span>
                </div>

                <div className="candidateSettingsSecurityInfo">
                  <Info size={16} />

                  <p>
                    Keep your JobHub credentials
                    private and avoid sharing
                    your login token or account
                    details with anyone.
                  </p>
                </div>

                <div className="candidateSettingsLogoutCard">
                  <div className="candidateSettingsLogoutInfo">
                    <div className="candidateSettingsLogoutIcon">
                      <LogOut
                        size={18}
                      />
                    </div>

                    <div>
                      <strong>
                        Sign out
                      </strong>

                      <span>
                        End your current JobHub
                        candidate session on
                        this device.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="candidateSettingsLogoutButton"
                    onClick={
                      handleLogout
                    }
                  >
                    <LogOut
                      size={16}
                    />

                    Logout
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

/* =====================================
   NOTIFICATION OPTION
===================================== */

function NotificationOption({
  icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="candidateSettingsOption">
      <div className="candidateSettingsOptionIcon">
        {icon}
      </div>

      <div className="candidateSettingsOptionText">
        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>
      </div>

      <button
        type="button"
        className={`candidateSettingsToggle ${
          checked
            ? "on"
            : ""
        }`}
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        aria-pressed={
          checked
        }
      >
        <span />
      </button>
    </div>
  );
}

export default Settings;