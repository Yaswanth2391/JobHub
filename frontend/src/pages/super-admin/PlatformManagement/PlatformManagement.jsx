import { useEffect, useState } from "react";

import {
  Settings2,
  BriefcaseBusiness,
  MapPin,
  Mail,
  ServerCog,
  Plus,
  X,
  Trash2,
  Save,
  CheckCircle2,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  superAdminFetch,
} from "../../../services/superAdminApi";

import "../Companies/Companies.css";

import "./PlatformManagement.css";

const tabs = [
  {
    id: "general",
    label: "General Settings",
    icon: Settings2,
  },
  {
    id: "categories",
    label: "Job Categories",
    icon: BriefcaseBusiness,
  },
  {
    id: "locations",
    label: "Job Locations",
    icon: MapPin,
  },
  {
    id: "templates",
    label: "Email Templates",
    icon: Mail,
  },
  {
    id: "system",
    label: "System Configuration",
    icon: ServerCog,
  },
];

const defaultSettings = {
  platformName: "JobHub",
  tagline: "Find. Apply. Grow.",
  supportEmail: "",
  supportPhone: "",
  maintenanceMode: false,
  allowNewRegistrations: true,
  maxJobsPerCompany: 100,
  jobCategories: [],
  jobLocations: [],
  emailTemplates: [],
  systemConfiguration: {
    sessionDays: 7,
    enableCandidateApplications: true,
    enableCompanyJobPosting: true,
    enableEmailNotifications: true,
  },
};

function PlatformManagement() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await superAdminFetch(
        "/api/super-admin/platform-settings",
      );

      setSettings({
        ...defaultSettings,
        ...(data.settings || {}),
        systemConfiguration: {
          ...defaultSettings.systemConfiguration,
          ...(data.settings?.systemConfiguration || {}),
        },
        jobCategories: data.settings?.jobCategories || [],
        jobLocations: data.settings?.jobLocations || [],
        emailTemplates: data.settings?.emailTemplates || [],
      });
    } catch (error) {
      console.error("Platform Settings Load Error:", error);
      toast.error(
        error.message || "Unable to load platform settings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateSystemConfig = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      systemConfiguration: {
        ...previous.systemConfiguration,
        [field]: value,
      },
    }));
  };

  const addCategory = () => {
    const value = newCategory.trim();
    if (!value) return;

    if (
      settings.jobCategories.some(
        (item) => item.toLowerCase() === value.toLowerCase(),
      )
    ) {
      toast.info("This category already exists");
      return;
    }

    updateSettings("jobCategories", [
      ...settings.jobCategories,
      value,
    ]);
    setNewCategory("");
  };

  const removeCategory = (value) => {
    updateSettings(
      "jobCategories",
      settings.jobCategories.filter(
        (item) => item !== value,
      ),
    );
  };

  const addLocation = () => {
    const value = newLocation.trim();
    if (!value) return;

    if (
      settings.jobLocations.some(
        (item) => item.toLowerCase() === value.toLowerCase(),
      )
    ) {
      toast.info("This location already exists");
      return;
    }

    updateSettings("jobLocations", [
      ...settings.jobLocations,
      value,
    ]);
    setNewLocation("");
  };

  const removeLocation = (value) => {
    updateSettings(
      "jobLocations",
      settings.jobLocations.filter(
        (item) => item !== value,
      ),
    );
  };

  const updateTemplate = (index, field, value) => {
    const next = [...settings.emailTemplates];
    next[index] = {
      ...next[index],
      [field]: value,
    };

    updateSettings("emailTemplates", next);
  };

  const addTemplate = () => {
    updateSettings("emailTemplates", [
      ...settings.emailTemplates,
      {
        name: "New Template",
        subject: "",
        body: "",
        enabled: true,
      },
    ]);
  };

  const removeTemplate = (index) => {
    updateSettings(
      "emailTemplates",
      settings.emailTemplates.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      await superAdminFetch(
        "/api/super-admin/platform-settings",
        {
          method: "PUT",
          body: JSON.stringify(settings),
        },
      );

      toast.success("Platform settings saved successfully");
    } catch (error) {
      toast.error(
        error.message || "Unable to save platform settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="platformManagementPage">
        <div className="platformLoading">
          Loading platform settings...
        </div>
      </section>
    );
  }

  return (
    <section className="platformManagementPage">
      <div className="platformHeader">
        <div>
          <h1>Platform Management</h1>
          <p>Configure platform settings and manage content.</p>
        </div>

        <button
          type="button"
          className="superPrimaryButton"
          onClick={saveSettings}
          disabled={saving}
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="platformTabBar">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? "active"
                  : ""
              }
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* GENERAL */}
      {activeTab === "general" && (
        <div className="platformSectionGrid">
          <div className="platformCard">
            <div className="platformCardHeader">
              <div>
                <h2>General Settings</h2>
                <p>Basic public information for JobHub.</p>
              </div>
              <Settings2 size={18} />
            </div>

            <div className="platformFormGrid">
              <label>
                Platform Name
                <input
                  value={settings.platformName}
                  onChange={(event) =>
                    updateSettings(
                      "platformName",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Tagline
                <input
                  value={settings.tagline}
                  onChange={(event) =>
                    updateSettings(
                      "tagline",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Support Email
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(event) =>
                    updateSettings(
                      "supportEmail",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Support Phone
                <input
                  value={settings.supportPhone}
                  onChange={(event) =>
                    updateSettings(
                      "supportPhone",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </div>

          <div className="platformCard">
            <div className="platformCardHeader">
              <div>
                <h2>Platform Status</h2>
                <p>Control platform access.</p>
              </div>
              <CheckCircle2 size={18} />
            </div>

            <div className="settingRows">
              <div className="settingRow">
                <div>
                  <strong>Platform</strong>
                  <span className="onlineStatus">
                    <i /> Online
                  </span>
                </div>
                <small>Platform is running normally.</small>
              </div>

              <div className="settingRow">
                <div>
                  <strong>Maintenance Mode</strong>
                  <button
                    type="button"
                    className={`toggle ${
                      settings.maintenanceMode ? "on" : ""
                    }`}
                    onClick={() =>
                      updateSettings(
                        "maintenanceMode",
                        !settings.maintenanceMode,
                      )
                    }
                    aria-label="Toggle maintenance mode"
                  >
                    <span />
                  </button>
                </div>
                <small>Temporarily restrict public activity.</small>
              </div>

              <div className="settingRow">
                <div>
                  <strong>Allow New Registrations</strong>
                  <button
                    type="button"
                    className={`toggle ${
                      settings.allowNewRegistrations ? "on" : ""
                    }`}
                    onClick={() =>
                      updateSettings(
                        "allowNewRegistrations",
                        !settings.allowNewRegistrations,
                      )
                    }
                    aria-label="Toggle new registrations"
                  >
                    <span />
                  </button>
                </div>
                <small>Allow new candidates and companies to register.</small>
              </div>

              <label className="jobsLimitField">
                Max Jobs Per Company
                <input
                  type="number"
                  min="1"
                  value={settings.maxJobsPerCompany}
                  onChange={(event) =>
                    updateSettings(
                      "maxJobsPerCompany",
                      Number(event.target.value),
                    )
                  }
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES */}
      {activeTab === "categories" && (
        <div className="platformSingleCard">
          <div className="platformCardHeader">
            <div>
              <h2>Job Categories</h2>
              <p>Control the categories available to the platform.</p>
            </div>
            <BriefcaseBusiness size={18} />
          </div>

          <div className="tagCreateRow">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addCategory();
              }}
              placeholder="Add a new job category"
            />
            <button
              type="button"
              className="superPrimaryButton"
              onClick={addCategory}
            >
              <Plus size={14} />
              Add Category
            </button>
          </div>

          <div className="platformTags">
            {settings.jobCategories.length === 0 ? (
              <span className="platformEmptyTag">
                No categories added yet.
              </span>
            ) : (
              settings.jobCategories.map((category) => (
                <span
                  className="platformTag"
                  key={category}
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    aria-label={`Remove ${category}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* LOCATIONS */}
      {activeTab === "locations" && (
        <div className="platformSingleCard">
          <div className="platformCardHeader">
            <div>
              <h2>Job Locations</h2>
              <p>Maintain commonly used job locations.</p>
            </div>
            <MapPin size={18} />
          </div>

          <div className="tagCreateRow">
            <input
              value={newLocation}
              onChange={(event) => setNewLocation(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addLocation();
              }}
              placeholder="Add a location"
            />
            <button
              type="button"
              className="superPrimaryButton"
              onClick={addLocation}
            >
              <Plus size={14} />
              Add Location
            </button>
          </div>

          <div className="platformTags">
            {settings.jobLocations.length === 0 ? (
              <span className="platformEmptyTag">
                No locations configured yet.
              </span>
            ) : (
              settings.jobLocations.map((location) => (
                <span
                  className="platformTag"
                  key={location}
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => removeLocation(location)}
                    aria-label={`Remove ${location}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* EMAIL TEMPLATES */}
      {activeTab === "templates" && (
        <div className="platformSingleCard">
          <div className="platformCardHeader">
            <div>
              <h2>Email Templates</h2>
              <p>Store reusable notification templates for future email integration.</p>
            </div>
            <button
              type="button"
              className="superPrimaryButton"
              onClick={addTemplate}
            >
              <Plus size={14} />
              Add Template
            </button>
          </div>

          <div className="templateList">
            {settings.emailTemplates.length === 0 ? (
              <div className="platformBlankState">
                No email templates configured yet.
              </div>
            ) : (
              settings.emailTemplates.map((template, index) => (
                <div
                  className="templateCard"
                  key={template._id || index}
                >
                  <div className="templateTopRow">
                    <label>
                      Template Name
                      <input
                        value={template.name || ""}
                        onChange={(event) =>
                          updateTemplate(index, "name", event.target.value)
                        }
                      />
                    </label>

                    <label>
                      Subject
                      <input
                        value={template.subject || ""}
                        onChange={(event) =>
                          updateTemplate(index, "subject", event.target.value)
                        }
                      />
                    </label>

                    <button
                      type="button"
                      className="templateDeleteButton"
                      onClick={() => removeTemplate(index)}
                      aria-label="Remove template"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <label>
                    Body
                    <textarea
                      value={template.body || ""}
                      onChange={(event) =>
                        updateTemplate(index, "body", event.target.value)
                      }
                      rows={5}
                      placeholder="Write the email template body..."
                    />
                  </label>

                  <div className="templateEnabledRow">
                    <span>
                      <Mail size={14} />
                      Template enabled
                    </span>
                    <button
                      type="button"
                      className={`toggle ${
                        template.enabled ? "on" : ""
                      }`}
                      onClick={() =>
                        updateTemplate(
                          index,
                          "enabled",
                          !template.enabled,
                        )
                      }
                      aria-label="Toggle template"
                    >
                      <span />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SYSTEM */}
      {activeTab === "system" && (
        <div className="platformSingleCard">
          <div className="platformCardHeader">
            <div>
              <h2>System Configuration</h2>
              <p>Manage core platform behavior.</p>
            </div>
            <ServerCog size={18} />
          </div>

          <div className="systemConfigGrid">
            <label>
              Session Duration (days)
              <input
                type="number"
                min="1"
                value={settings.systemConfiguration.sessionDays}
                onChange={(event) =>
                  updateSystemConfig(
                    "sessionDays",
                    Number(event.target.value),
                  )
                }
              />
            </label>

            <div className="systemToggleCard">
              <div>
                <strong>Candidate Applications</strong>
                <span>Allow candidates to apply for jobs.</span>
              </div>
              <button
                type="button"
                className={`toggle ${
                  settings.systemConfiguration.enableCandidateApplications
                    ? "on"
                    : ""
                }`}
                onClick={() =>
                  updateSystemConfig(
                    "enableCandidateApplications",
                    !settings.systemConfiguration.enableCandidateApplications,
                  )
                }
              >
                <span />
              </button>
            </div>

            <div className="systemToggleCard">
              <div>
                <strong>Company Job Posting</strong>
                <span>Allow company admins to post new jobs.</span>
              </div>
              <button
                type="button"
                className={`toggle ${
                  settings.systemConfiguration.enableCompanyJobPosting
                    ? "on"
                    : ""
                }`}
                onClick={() =>
                  updateSystemConfig(
                    "enableCompanyJobPosting",
                    !settings.systemConfiguration.enableCompanyJobPosting,
                  )
                }
              >
                <span />
              </button>
            </div>

            <div className="systemToggleCard">
              <div>
                <strong>Email Notifications</strong>
                <span>Enable platform email notifications.</span>
              </div>
              <button
                type="button"
                className={`toggle ${
                  settings.systemConfiguration.enableEmailNotifications
                    ? "on"
                    : ""
                }`}
                onClick={() =>
                  updateSystemConfig(
                    "enableEmailNotifications",
                    !settings.systemConfiguration.enableEmailNotifications,
                  )
                }
              >
                <span />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="platformSaveBar">
        <span>
          <CheckCircle2 size={15} />
          Changes are saved to the JobHub database when you click Save Changes.
        </span>
        <button
          type="button"
          className="superPrimaryButton"
          onClick={saveSettings}
          disabled={saving}
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}

export default PlatformManagement;
