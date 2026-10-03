import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Mail,
  Phone,
  CalendarDays,
  Pencil,
  Save,
  X,
  RefreshCw,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";

import AdminSidebar from "../AdminSidebar/AdminSidebar";
import API_BASE_URL from "../../../services/api";

import "./CompanyProfile.css";

function CompanyProfile() {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    companyLogo: "",
  });

  const [companyLogoFile, setCompanyLogoFile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* =====================================
     GET TOKEN
  ===================================== */

  const getToken = () => {
    return (
      localStorage.getItem("jobhubCompanyAdminToken") ||
      localStorage.getItem("companyAdminToken") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  /* =====================================
     GET ADMIN STORAGE DATA
  ===================================== */

  const getStoredAdminData = () => {
    const possibleKeys = [
      "jobhubCompanyAdmin",
      "companyAdmin",
      "admin",
    ];

    for (const key of possibleKeys) {
      try {
        const storedData = localStorage.getItem(key);

        if (!storedData) {
          continue;
        }

        const parsedData = JSON.parse(storedData);

        if (parsedData) {
          return parsedData;
        }
      } catch (error) {
        console.error(
          `Unable to parse company admin data from ${key}:`,
          error,
        );
      }
    }

    return null;
  };

  /* =====================================
     ADMIN DATA
  ===================================== */

  const storedAdminData = useMemo(
    () => getStoredAdminData(),
    [],
  );

  /* =====================================
     FETCH COMPANY PROFILE
  ===================================== */

  const fetchProfile = async (showRefreshLoader = false) => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      navigateToLogin();
      return;
    }

    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load company profile.",
        );
      }

      const companyAdmin = data.companyAdmin || {};

      setProfile(companyAdmin);

      setFormData({
        companyName: companyAdmin.companyName || "",
        email: companyAdmin.email || "",
        phone: companyAdmin.phone || "",
        companyLogo: companyAdmin.companyLogo || "",
      });

      setCompanyLogoFile(null);
    } catch (error) {
      console.error(
        "Fetch company profile error:",
        error,
      );

      toast.error(
        error.message ||
          "Unable to load company profile.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================
     LOGIN REDIRECT
  ===================================== */

  const navigateToLogin = () => {
    window.location.href = "/company-admin/login";
  };

  /* =====================================
     INITIAL LOAD
  ===================================== */

  useEffect(() => {
    fetchProfile();
  }, []);

  /* =====================================
     HANDLE INPUT
  ===================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =====================================
     HANDLE COMPANY LOGO
  ===================================== */

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    /* ===============================
       FILE TYPE VALIDATION
    =============================== */

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Please upload a PNG, JPG, JPEG or WebP image.",
      );

      event.target.value = "";
      return;
    }

    /* ===============================
       FILE SIZE VALIDATION
    =============================== */

    const maxFileSize = 1 * 1024 * 1024;

    if (file.size > maxFileSize) {
      toast.error(
        "Company logo must be smaller than 1 MB.",
      );

      event.target.value = "";
      return;
    }

    /* ===============================
       STORE ACTUAL FILE
    =============================== */

    setCompanyLogoFile(file);

    /* ===============================
       CREATE PREVIEW
    =============================== */

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        companyLogo: reader.result || "",
      }));
    };

    reader.onerror = () => {
      toast.error(
        "Unable to preview the selected logo.",
      );
    };

    reader.readAsDataURL(file);
  };

  /* =====================================
     START EDIT
  ===================================== */

  const handleStartEdit = () => {
    if (!profile) {
      return;
    }

    setFormData({
      companyName: profile.companyName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      companyLogo: profile.companyLogo || "",
    });

    setCompanyLogoFile(null);
    setIsEditing(true);
  };

  /* =====================================
     CANCEL EDIT
  ===================================== */

  const handleCancelEdit = () => {
    if (saving) {
      return;
    }

    setFormData({
      companyName: profile?.companyName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      companyLogo: profile?.companyLogo || "",
    });

    setCompanyLogoFile(null);
    setIsEditing(false);
  };

  /* =====================================
     VALIDATE FORM
  ===================================== */

  const validateForm = () => {
    const companyName = formData.companyName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    if (!companyName) {
      toast.error("Company name is required.");
      return false;
    }

    if (!email) {
      toast.error("Company email is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid company email.");
      return false;
    }

    if (!phone) {
      toast.error("Phone number is required.");
      return false;
    }

    return true;
  };

  /* =====================================
     SAVE PROFILE
  ===================================== */

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Company admin session not found.");
      navigateToLogin();
      return;
    }

    try {
      setSaving(true);

      /* ===============================
         CREATE FORM DATA
      =============================== */

      const uploadData = new FormData();

      uploadData.append(
        "companyName",
        formData.companyName.trim(),
      );

      uploadData.append(
        "email",
        formData.email.trim().toLowerCase(),
      );

      uploadData.append(
        "phone",
        formData.phone.trim(),
      );

      /* ===============================
         ONLY APPEND LOGO WHEN
         A NEW FILE IS SELECTED
      =============================== */

      if (companyLogoFile) {
        uploadData.append(
          "companyLogo",
          companyLogoFile,
        );
      }

      /* ===============================
         SEND REQUEST
      =============================== */

      const response = await fetch(
        `${API_BASE_URL}/api/company-admin/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        },
      );

      const contentType =
        response.headers.get("content-type");

      let data;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        data = await response.json();
      } else {
        const responseText = await response.text();

        throw new Error(
          responseText ||
            "Server returned an invalid response.",
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update company profile.",
        );
      }

      /* ===============================
         UPDATED ADMIN DATA
      =============================== */

      const updatedAdmin =
        data.companyAdmin || {};

      setProfile(updatedAdmin);

      setFormData({
        companyName:
          updatedAdmin.companyName || "",
        email:
          updatedAdmin.email || "",
        phone:
          updatedAdmin.phone || "",
        companyLogo:
          updatedAdmin.companyLogo || "",
      });

      setCompanyLogoFile(null);

      /* ===============================
         KEEP STORAGE IN SYNC
      =============================== */

      const storageKeys = [
        "jobhubCompanyAdmin",
        "companyAdmin",
        "admin",
      ];

      storageKeys.forEach((key) => {
        try {
          const existingData =
            localStorage.getItem(key);

          if (!existingData) {
            return;
          }

          const parsedData =
            JSON.parse(existingData);

          const nextData = {
            ...parsedData,
            companyName:
              updatedAdmin.companyName ??
              parsedData.companyName ??
              "",
            email:
              updatedAdmin.email ??
              parsedData.email ??
              "",
            phone:
              updatedAdmin.phone ??
              parsedData.phone ??
              "",
            companyLogo:
              updatedAdmin.companyLogo ??
              parsedData.companyLogo ??
              "",
          };

          localStorage.setItem(
            key,
            JSON.stringify(nextData),
          );
        } catch (error) {
          console.error(
            `Unable to sync ${key}:`,
            error,
          );
        }
      });

      setIsEditing(false);

      toast.success(
        data.message ||
          "Company profile updated successfully.",
      );
    } catch (error) {
      console.error(
        "Update company profile error:",
        error,
      );

      toast.error(
        error.message ||
          "Unable to update company profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================
     FORMAT CREATED DATE
  ===================================== */

  const formatCreatedDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =====================================
     COMPANY INITIAL
  ===================================== */

  const getCompanyInitial = () => {
    const name =
      profile?.companyName ||
      storedAdminData?.companyName ||
      storedAdminData?.company ||
      "Company";

    return name.charAt(0).toUpperCase();
  };

  /* =====================================
     DISPLAY NAME
  ===================================== */

  const displayCompanyName =
    profile?.companyName ||
    storedAdminData?.companyName ||
    storedAdminData?.company ||
    "Company";

  /* =====================================
     DISPLAY LOGO
  ===================================== */

  const displayCompanyLogo =
    profile?.companyLogo ||
    storedAdminData?.companyLogo ||
    "";

  const editCompanyLogo =
    formData.companyLogo || "";

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <div className="companyProfilePage">
        <AdminSidebar />

        <main className="companyProfileMain">
          <div className="companyProfileLoading">
            <div className="companyProfileSpinner" />

            <h3>Loading company profile...</h3>

            <p>
              Please wait while we fetch your company
              information.
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* =====================================
     MAIN PAGE
  ===================================== */

  return (
    <div className="companyProfilePage">
      <AdminSidebar />

      <main className="companyProfileMain">
        {/* =====================================
            TOPBAR
        ===================================== */}

        <header className="companyProfileTopbar">
          <div className="companyProfileTopbarText">
            <span>Company Admin</span>
            <h1>Company Profile</h1>
          </div>

          <div className="companyProfileTopbarRight">
            <button
              type="button"
              className="companyProfileTopbarNotification"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="companyProfileTopbarAdmin">
              <div className="companyProfileTopbarAvatar">
                {displayCompanyLogo ? (
                  <img
                    src={displayCompanyLogo}
                    alt={`${displayCompanyName} logo`}
                  />
                ) : (
                  getCompanyInitial()
                )}
              </div>

              <div className="companyProfileTopbarInfo">
                <strong>{displayCompanyName}</strong>
                <span>Company Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================
            HEADER
        ===================================== */}

        <section className="companyProfileHeader">
          <div>
            <span className="companyProfileEyebrow">
              Company Management
            </span>

            <h2>Your Company Profile</h2>

            <p>
              Manage the company information associated
              with your JobHub employer account.
            </p>
          </div>

          <button
            type="button"
            className={`companyProfileRefreshButton ${
              refreshing ? "refreshing" : ""
            }`}
            onClick={() => fetchProfile(true)}
            disabled={refreshing || saving}
          >
            <RefreshCw size={16} />

            <span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </section>

        {/* =====================================
            PROFILE CONTENT
        ===================================== */}

        <section className="companyProfileContent">
          <div className="companyProfileCard">
            {/* PROFILE HERO */}

            <div className="companyProfileHero">
              <div className="companyProfileHeroLeft">
                <div className="companyProfileLargeAvatar">
                  {displayCompanyLogo ? (
                    <img
                      src={displayCompanyLogo}
                      alt={`${displayCompanyName} logo`}
                    />
                  ) : (
                    getCompanyInitial()
                  )}
                </div>

                <div className="companyProfileIdentity">
                  <span>Employer Account</span>

                  <h3>{displayCompanyName}</h3>

                  <p>
                    Company Administrator
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  className="companyProfileEditButton"
                  onClick={handleStartEdit}
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {/* ACCOUNT STATUS */}

            <div className="companyProfileSecurityNotice">
              <div className="companyProfileSecurityIcon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>Company account</strong>

                <span>
                  Your profile information is protected
                  by your company admin account.
                </span>
              </div>
            </div>

            {/* DETAILS */}

            {!isEditing ? (
              <div className="companyProfileDetails">
                <div className="companyProfileSectionHeading">
                  <div>
                    <span>Profile Information</span>
                    <h3>Company Details</h3>
                  </div>
                </div>

                <div className="companyProfileDetailsGrid">
                  <div className="companyProfileDetailItem">
                    <div className="companyProfileDetailIcon">
                      <Building2 size={18} />
                    </div>

                    <div>
                      <span>Company Name</span>
                      <strong>
                        {profile?.companyName ||
                          "Not available"}
                      </strong>
                    </div>
                  </div>

                  <div className="companyProfileDetailItem">
                    <div className="companyProfileDetailIcon">
                      <Mail size={18} />
                    </div>

                    <div>
                      <span>Company Email</span>
                      <strong>
                        {profile?.email ||
                          "Not available"}
                      </strong>
                    </div>
                  </div>

                  <div className="companyProfileDetailItem">
                    <div className="companyProfileDetailIcon">
                      <Phone size={18} />
                    </div>

                    <div>
                      <span>Phone Number</span>
                      <strong>
                        {profile?.phone ||
                          "Not available"}
                      </strong>
                    </div>
                  </div>

                  <div className="companyProfileDetailItem">
                    <div className="companyProfileDetailIcon">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <span>Account Created</span>
                      <strong>
                        {formatCreatedDate(
                          profile?.createdAt,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="companyProfileDetailItem companyProfileLogoDetailItem">
                    <div className="companyProfileDetailIcon">
                      <ImageIcon size={18} />
                    </div>

                    <div>
                      <span>Company Logo</span>

                      <strong>
                        {profile?.companyLogo
                          ? "Uploaded"
                          : "Not uploaded"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form
                className="companyProfileEditForm"
                onSubmit={handleSaveProfile}
              >
                <div className="companyProfileSectionHeading">
                  <div>
                    <span>Update Information</span>
                    <h3>Edit Company Details</h3>
                  </div>
                </div>

                {/* COMPANY LOGO */}

                <div className="companyProfileLogoUploadSection">
                  <div className="companyProfileLogoUploadHeader">
                    <div>
                      <span className="companyProfileFormLabel">
                        Company Logo
                      </span>

                      <p>
                        Upload your company logo. This logo
                        will be displayed on jobs published
                        by your company.
                      </p>
                    </div>
                  </div>

                  <div className="companyProfileLogoUploadArea">
                    <div className="companyProfileLogoPreview">
                      {editCompanyLogo ? (
                        <img
                          src={editCompanyLogo}
                          alt="Company logo preview"
                        />
                      ) : (
                        <div className="companyProfileLogoPlaceholder">
                          <Building2 size={30} />
                          <span>
                            {getCompanyInitial()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="companyProfileLogoUploadContent">
                      <label
                        htmlFor="companyLogo"
                        className="companyProfileLogoUploadButton"
                      >
                        <Upload size={16} />

                        {editCompanyLogo
                          ? "Change Logo"
                          : "Upload Logo"}
                      </label>

                      <input
                        id="companyLogo"
                        name="companyLogo"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleLogoChange}
                        disabled={saving}
                        hidden
                      />

                      <span>
                        PNG, JPG, JPEG or WebP · Max 1 MB
                      </span>

                      <small>
                        Recommended: square image with a
                        clear background.
                      </small>
                    </div>
                  </div>
                </div>

                {/* FORM FIELDS */}

                <div className="companyProfileFormGrid">
                  <div className="companyProfileFormGroup">
                    <label htmlFor="companyName">
                      Company Name
                    </label>

                    <div className="companyProfileInputWrap">
                      <Building2 size={17} />

                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        autoComplete="organization"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="companyProfileFormGroup">
                    <label htmlFor="email">
                      Company Email
                    </label>

                    <div className="companyProfileInputWrap">
                      <Mail size={17} />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter company email"
                        autoComplete="email"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="companyProfileFormGroup">
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <div className="companyProfileInputWrap">
                      <Phone size={17} />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        autoComplete="tel"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                {/* FORM ACTIONS */}

                <div className="companyProfileFormActions">
                  <button
                    type="button"
                    className="companyProfileCancelButton"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="companyProfileSaveButton"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="companyProfileButtonSpinner"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default CompanyProfile;