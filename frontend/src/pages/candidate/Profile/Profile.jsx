import { useEffect, useRef, useState } from "react";

import {
  Bell,
  Edit3,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  Upload,
  Plus,
  X,
  Trash2,
  Briefcase,
  GraduationCap,
  Camera,
} from "lucide-react";

import CandidateSidebar from "../../../components/CandidateSidebar/CandidateSidebar";
import LoadingAnimation from "../../../components/LoadingAnimation/LoadingAnimation";

import API_BASE_URL from "../../../services/api";

import "./Profile.css";

function Profile() {
  // =====================================
  // STATES
  // =====================================

  const [activeTab, setActiveTab] =
    useState("Personal Info");

  const [candidate, setCandidate] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isEditing, setIsEditing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isUploadingResume, setIsUploadingResume] =
    useState(false);

  const [isUploadingProfileImage, setIsUploadingProfileImage] =
    useState(false);

  const [isEducationModalOpen, setIsEducationModalOpen] =
    useState(false);

  const [isExperienceModalOpen, setIsExperienceModalOpen] =
    useState(false);

  const [editingEducation, setEditingEducation] =
    useState(null);

  const [editingExperience, setEditingExperience] =
    useState(null);

  const [isSavingEducation, setIsSavingEducation] =
    useState(false);

  const [isSavingExperience, setIsSavingExperience] =
    useState(false);

  const fileInputRef = useRef(null);

  const profileImageInputRef = useRef(null);

  // =====================================
  // PROFILE FORM
  // =====================================

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    skills: "",
  });

  // =====================================
  // EDUCATION FORM
  // =====================================

  const [educationForm, setEducationForm] =
    useState({
      degree: "",
      institution: "",
      stream: "",
      cgpa: "",
      educationType: "Full Time",
      startYear: "",
      endYear: "",
    });

  // =====================================
  // EXPERIENCE FORM
  // =====================================

  const [experienceForm, setExperienceForm] =
    useState({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    });

  // =====================================
  // GET TOKEN
  // =====================================

  const getToken = () => {
    return localStorage.getItem(
      "jobhubCandidateToken"
    );
  };

  // =====================================
  // UPDATE CANDIDATE
  // =====================================

  const updateCandidateData = (
    updatedCandidate
  ) => {
    setCandidate(updatedCandidate);

    localStorage.setItem(
      "jobhubCandidate",
      JSON.stringify(updatedCandidate)
    );

    window.dispatchEvent(
      new CustomEvent("jobhub:candidateUpdated"),
    );
  };

  // =====================================
  // FETCH PROFILE
  // =====================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login to view your profile."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/candidate/profile`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType ||
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "Backend API returned an invalid response."
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch profile."
        );
      }

      const profileCandidate =
        data.candidate || data;

      updateCandidateData(
        profileCandidate
      );

      setFormData({
        fullName:
          profileCandidate.fullName ||
          "",

        phone:
          profileCandidate.phone ||
          "",

        location:
          profileCandidate.location ||
          "",

        dateOfBirth:
          profileCandidate.dateOfBirth
            ? profileCandidate.dateOfBirth.split(
                "T"
              )[0]
            : "",

        gender:
          profileCandidate.gender ||
          "",

        bio:
          profileCandidate.bio ||
          "",

        skills:
          Array.isArray(
            profileCandidate.skills
          )
            ? profileCandidate.skills.join(
                ", "
              )
            : "",
      });
    } catch (err) {
      console.error(
        "Profile fetch error:",
        err
      );

      setError(
        err.message ||
          "Unable to fetch profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================
  // INITIALS
  // =====================================

  const getInitials = (name) => {
    if (!name) return "C";

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =====================================
  // PROFILE EDIT
  // =====================================

  const handleEditProfile = () => {
    setMessage("");
    setError("");
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    if (candidate) {
      setFormData({
        fullName:
          candidate.fullName || "",

        phone:
          candidate.phone || "",

        location:
          candidate.location || "",

        dateOfBirth:
          candidate.dateOfBirth
            ? candidate.dateOfBirth.split(
                "T"
              )[0]
            : "",

        gender:
          candidate.gender || "",

        bio:
          candidate.bio || "",

        skills:
          Array.isArray(candidate.skills)
            ? candidate.skills.join(", ")
            : "",
      });
    }

    setIsEditing(false);
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );
  };

  // =====================================
  // SAVE PROFILE
  // =====================================

  const handleSaveProfile = async (
    event
  ) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      const formattedSkills =
        formData.skills
          .split(",")
          .map((skill) =>
            skill.trim()
          )
          .filter(
            (skill) =>
              skill.length > 0
          );

      const response = await fetch(
        `${API_BASE_URL}/api/candidate/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            fullName:
              formData.fullName,

            phone:
              formData.phone,

            location:
              formData.location,

            dateOfBirth:
              formData.dateOfBirth,

            gender:
              formData.gender,

            bio:
              formData.bio,

            skills:
              formattedSkills,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update profile."
        );
      }

      updateCandidateData(
        data.candidate || data
      );

      setMessage(
        "Profile updated successfully!"
      );

      setIsEditing(false);
    } catch (err) {
      setError(
        err.message ||
          "Unable to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================
  // PROFILE IMAGE
  // =====================================

  const handleProfileImageButtonClick = () => {
    profileImageInputRef.current?.click();
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setIsUploadingProfileImage(true);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login again.");
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a JPG, PNG or WebP image.");
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Profile picture must be less than 2MB.");
      }

      const uploadData = new FormData();
      uploadData.append("profileImage", file);

      const response = await fetch(
        `${API_BASE_URL}/api/candidate/profile/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to upload profile picture.",
        );
      }

      updateCandidateData(data.candidate || data);

      setMessage("Profile picture updated successfully!");

      window.dispatchEvent(
        new CustomEvent("jobhub:candidateUpdated"),
      );
    } catch (err) {
      setError(
        err.message || "Unable to upload profile picture.",
      );
    } finally {
      setIsUploadingProfileImage(false);
      event.target.value = "";
    }
  };

  // =====================================
  // RESUME
  // =====================================

  const handleResumeButtonClick =
    () => {
      fileInputRef.current?.click();
    };

  const handleResumeUpload = async (
    event
  ) => {
    const file =
      event.target.files[0];

    if (!file) return;

    try {
      setIsUploadingResume(true);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }

      if (
        file.type !==
        "application/pdf"
      ) {
        throw new Error(
          "Please upload only a PDF resume."
        );
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        throw new Error(
          "Resume size must be less than 5MB."
        );
      }

      const uploadData =
        new FormData();

      uploadData.append(
        "resume",
        file
      );

      const response = await fetch(
        `${API_BASE_URL}/api/candidate/profile/resume`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: uploadData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to upload resume."
        );
      }

      updateCandidateData(
        data.candidate || data
      );

      setMessage(
        "Resume uploaded successfully!"
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to upload resume."
      );
    } finally {
      setIsUploadingResume(false);

      event.target.value = "";
    }
  };

  const handleViewResume = () => {
    const resumeUrl =
      candidate?.resume?.url;

    if (!resumeUrl) {
      setError(
        "Resume is not available."
      );

      return;
    }

    const finalUrl =
      resumeUrl.startsWith("http")
        ? resumeUrl
        : `${API_BASE_URL}${resumeUrl}`;

    window.open(
      finalUrl,
      "_blank"
    );
  };

  // =====================================
  // EDUCATION
  // =====================================

  const openAddEducation = () => {
    setEditingEducation(null);

    setEducationForm({
      degree: "",
      institution: "",
      stream: "",
      cgpa: "",
      educationType: "Full Time",
      startYear: "",
      endYear: "",
    });

    setIsEducationModalOpen(true);
  };

  const openEditEducation = (
    education
  ) => {
    setEditingEducation(
      education
    );

    setEducationForm({
      degree:
        education.degree || "",

      institution:
        education.institution || "",

      stream:
        education.stream || "",

      cgpa:
        education.cgpa || "",

      educationType:
        education.educationType ||
        "Full Time",

      startYear:
        education.startYear || "",

      endYear:
        education.endYear || "",
    });

    setIsEducationModalOpen(true);
  };

  const closeEducationModal =
    () => {
      if (
        isSavingEducation
      ) {
        return;
      }

      setEditingEducation(null);

      setIsEducationModalOpen(
        false
      );
    };

  const handleEducationChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setEducationForm(
        (previousData) => ({
          ...previousData,
          [name]: value,
        })
      );
    };

  const handleSaveEducation =
    async (event) => {
      event.preventDefault();

      try {
        setIsSavingEducation(
          true
        );

        setError("");
        setMessage("");

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login again."
          );
        }

        if (
          !educationForm.degree.trim() ||
          !educationForm.institution.trim()
        ) {
          throw new Error(
            "Degree and institution are required."
          );
        }

        const educationData =
          {
            degree:
              educationForm.degree.trim(),

            institution:
              educationForm.institution.trim(),

            stream:
              educationForm.stream.trim(),

            cgpa:
              educationForm.cgpa
                .toString()
                .trim(),

            educationType:
              educationForm.educationType ||
              "Full Time",

            startYear:
              educationForm.startYear,

            endYear:
              educationForm.endYear,
          };

        let url =
          `${API_BASE_URL}/api/candidate/profile/education`;

        let method = "POST";

        if (
          editingEducation
        ) {
          url =
            `${API_BASE_URL}/api/candidate/profile/education/${editingEducation._id}`;

          method = "PUT";
        }

        const response =
          await fetch(url, {
            method,

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify(
              educationData
            ),
          });

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          !contentType ||
          !contentType.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "Backend API returned an invalid response."
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to save education details."
          );
        }

        const updatedCandidate =
          data.candidate ||
          data;

        updateCandidateData(
          updatedCandidate
        );

        setMessage(
          data.message ||
            "Education saved successfully."
        );

        setIsEducationModalOpen(
          false
        );

        setEditingEducation(
          null
        );

        setEducationForm({
          degree: "",
          institution: "",
          stream: "",
          cgpa: "",
          educationType:
            "Full Time",
          startYear: "",
          endYear: "",
        });
      } catch (err) {
        console.error(
          "Save education error:",
          err
        );

        setError(
          err.message ||
            "Unable to save education details."
        );
      } finally {
        setIsSavingEducation(
          false
        );
      }
    };

  const handleDeleteEducation =
    async (educationId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this education record?"
        );

      if (!confirmed) return;

      try {
        const token =
          getToken();

        const response =
          await fetch(
            `${API_BASE_URL}/api/candidate/profile/education/${educationId}`,
            {
              method: "DELETE",

              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to delete education."
          );
        }

        updateCandidateData(
          data.candidate || data
        );

        setMessage(
          "Education deleted successfully!"
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to delete education."
        );
      }
    };

  // =====================================
  // EXPERIENCE
  // =====================================

  const openAddExperience =
    () => {
      setEditingExperience(
        null
      );

      setExperienceForm({
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        description: "",
      });

      setIsExperienceModalOpen(
        true
      );
    };

  const openEditExperience = (
    experience
  ) => {
    setEditingExperience(
      experience
    );

    setExperienceForm({
      company:
        experience.company ||
        "",

      role:
        experience.role ||
        "",

      startDate:
        experience.startDate
          ? experience.startDate.split(
              "T"
            )[0]
          : "",

      endDate:
        experience.endDate
          ? experience.endDate.split(
              "T"
            )[0]
          : "",

      description:
        experience.description ||
        "",
    });

    setIsExperienceModalOpen(
      true
    );
  };

  const closeExperienceModal =
    () => {
      if (
        isSavingExperience
      ) {
        return;
      }

      setEditingExperience(
        null
      );

      setIsExperienceModalOpen(
        false
      );
    };

  const handleExperienceChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setExperienceForm(
        (previousData) => ({
          ...previousData,
          [name]: value,
        })
      );
    };

  const handleSaveExperience =
    async (event) => {
      event.preventDefault();

      try {
        setIsSavingExperience(
          true
        );

        setError("");
        setMessage("");

        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Please login again."
          );
        }

        const editing =
          Boolean(
            editingExperience
          );

        const url = editing
          ? `${API_BASE_URL}/api/candidate/profile/experience/${editingExperience._id}`
          : `${API_BASE_URL}/api/candidate/profile/experience`;

        const response =
          await fetch(url, {
            method:
              editing
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify(
              experienceForm
            ),
          });

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to save experience."
          );
        }

        updateCandidateData(
          data.candidate || data
        );

        setMessage(
          editing
            ? "Experience updated successfully!"
            : "Experience added successfully!"
        );

        setIsExperienceModalOpen(
          false
        );

        setEditingExperience(
          null
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to save experience."
        );
      } finally {
        setIsSavingExperience(
          false
        );
      }
    };

  const handleDeleteExperience =
    async (
      experienceId
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this experience record?"
        );

      if (!confirmed) return;

      try {
        const token =
          getToken();

        const response =
          await fetch(
            `${API_BASE_URL}/api/candidate/profile/experience/${experienceId}`,
            {
              method: "DELETE",

              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to delete experience."
          );
        }

        updateCandidateData(
          data.candidate || data
        );

        setMessage(
          "Experience deleted successfully!"
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to delete experience."
        );
      }
    };

  // =====================================
  // PROFILE COMPLETION
  // =====================================

  const calculateCompletion =
    () => {
      if (!candidate) return 0;

      const fields = [
        candidate.fullName,
        candidate.email,
        candidate.phone,
        candidate.location,
        candidate.dateOfBirth,
        candidate.gender,
        candidate.bio,
        candidate.skills?.length >
          0,
        candidate.education?.length >
          0,
        candidate.experience?.length >
          0,
        candidate.resume?.name,
        candidate.profileImage,
      ];

      const completed =
        fields.filter(Boolean)
          .length;

      return Math.round(
        (completed /
          fields.length) *
          100
      );
    };

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <main className="candidateProfilePage">
        <CandidateSidebar />

        <section className="candidateProfileMain">
          <div className="candidateProfileLoading">
            <LoadingAnimation label="Loading your JobHub profile..." />
          </div>
        </section>
      </main>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error && !candidate) {
    return (
      <main className="candidateProfilePage">
        <CandidateSidebar />

        <section className="candidateProfileMain">
          <div className="candidateProfileError">
            {error}
          </div>
        </section>
      </main>
    );
  }

  const fullName =
    candidate?.fullName ||
    "";

  const email =
    candidate?.email ||
    "";

  const phone =
    candidate?.phone ||
    "";

  const location =
    candidate?.location ||
    "";

  const dateOfBirth =
    candidate?.dateOfBirth
      ? new Date(
          candidate.dateOfBirth
        ).toLocaleDateString()
      : "";

  const gender =
    candidate?.gender ||
    "";

  const bio =
    candidate?.bio ||
    "";

  const skills =
    candidate?.skills ||
    [];

  const education =
    candidate?.education ||
    [];

  const experience =
    candidate?.experience ||
    [];

  const initials =
    getInitials(fullName);

  const profileImage = candidate?.profileImage || "";

  const completion =
    calculateCompletion();

  return (
    <>
      <main className="candidateProfilePage">
        <CandidateSidebar />

        <section className="candidateProfileMain">

          {/* TOPBAR */}

          <header className="candidateProfileTopbar">
            <div />

            <div className="profileTopbarRight">

              <button
                type="button"
                className="profileNotificationButton"
              >
                <Bell size={18} />
              </button>

              <div className="profileUserMenu">

                <div className="profileSmallAvatar">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={`${fullName || "Candidate"} profile`}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="profileTopUserInfo">
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

          <div className="candidateProfileContent">

            {message && (
              <div className="profileSuccessMessage">
                {message}
              </div>
            )}

            {error &&
              candidate && (
                <div className="profileErrorMessage">
                  {error}
                </div>
              )}

            {/* TITLE */}

            <div className="profilePageTitleRow">

              <h1>
                My Profile
              </h1>

              <button
                type="button"
                className="editProfileButton"
                onClick={
                  handleEditProfile
                }
              >
                <Edit3 size={16} />
                Edit Profile
              </button>

            </div>

            {/* OVERVIEW */}

            <div className="profileOverviewGrid">

              <section className="profileInfoCard">

                <div className="profileAvatarUploadWrap">
                  <div className="profileLargeAvatar">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={`${fullName || "Candidate"} profile`}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <button
                    type="button"
                    className="profileAvatarCameraButton"
                    onClick={handleProfileImageButtonClick}
                    disabled={isUploadingProfileImage}
                    aria-label="Upload profile picture"
                    title="Upload profile picture"
                  >
                    <Camera size={15} />
                  </button>

                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hiddenFileInput"
                    onChange={handleProfileImageUpload}
                  />
                </div>

                <div className="profileCandidateInfo">

                  <h2>
                    {fullName ||
                      "Candidate"}
                  </h2>

                  <button
                    type="button"
                    className="profilePictureTextButton"
                    onClick={handleProfileImageButtonClick}
                    disabled={isUploadingProfileImage}
                  >
                    <Camera size={14} />
                    {isUploadingProfileImage
                      ? "Updating picture..."
                      : profileImage
                        ? "Change profile picture"
                        : "Add profile picture"}
                  </button>

                  <div className="profileInfoLine">
                    <Mail size={15} />

                    <span>
                      {email}
                    </span>
                  </div>

                  <div className="profileInfoLine">
                    <Phone size={15} />

                    <span>
                      {phone ||
                        "Phone not added"}
                    </span>
                  </div>

                  <div className="profileInfoLine">
                    <MapPin size={15} />

                    <span>
                      {location ||
                        "Location not added"}
                    </span>
                  </div>

                  <p className="profileDescription">
                    {bio ||
                      "Add a professional summary to your profile."}
                  </p>

                </div>

              </section>

              <section className="profileCompletionCard">

                <div className="completionHeader">

                  <h2>
                    Profile Completion
                  </h2>

                  <span>
                    {completion}%
                  </span>

                </div>

                <div className="completionProgress">

                  <div
                    className="completionProgressFill"
                    style={{
                      width: `${completion}%`,
                    }}
                  />

                </div>

                <p>
                  Complete your profile to get better job recommendations.
                </p>

              </section>

            </div>

            {/* TABS */}

            <div className="profileTabs">

              {[
                "Personal Info",
                "Education",
                "Experience",
                "Skills",
                "Resume",
              ].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={
                    activeTab === tab
                      ? "profileTab activeProfileTab"
                      : "profileTab"
                  }
                  onClick={() =>
                    setActiveTab(tab)
                  }
                >
                  {tab}
                </button>
              ))}

            </div>

            {/* PERSONAL INFO */}

            {activeTab ===
              "Personal Info" && (
              <div className="profileLowerGrid">

                <section className="personalInformationCard">

                  <h2>
                    Personal Information
                  </h2>

                  <div className="personalInformationList">

                    <div className="personalInformationRow">
                      <span>
                        Full Name
                      </span>

                      <strong>
                        {fullName ||
                          "Not added"}
                      </strong>
                    </div>

                    <div className="personalInformationRow">
                      <span>
                        Email
                      </span>

                      <strong>
                        {email ||
                          "Not added"}
                      </strong>
                    </div>

                    <div className="personalInformationRow">
                      <span>
                        Phone
                      </span>

                      <strong>
                        {phone ||
                          "Not added"}
                      </strong>
                    </div>

                    <div className="personalInformationRow">
                      <span>
                        Location
                      </span>

                      <strong>
                        {location ||
                          "Not added"}
                      </strong>
                    </div>

                    <div className="personalInformationRow">
                      <span>
                        Date of Birth
                      </span>

                      <strong>
                        {dateOfBirth ||
                          "Not added"}
                      </strong>
                    </div>

                    <div className="personalInformationRow">
                      <span>
                        Gender
                      </span>

                      <strong>
                        {gender ||
                          "Not added"}
                      </strong>
                    </div>

                  </div>

                </section>

                <section className="skillsProfileCard">

                  <div className="skillsHeader">
                    <h2>
                      Skills
                    </h2>
                  </div>

                  <div className="skillsList">

                    {skills.length >
                    0 ? (
                      skills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="profileSkillTag"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <p className="emptySkillsText">
                        No skills added yet.
                      </p>
                    )}

                  </div>

                </section>

              </div>
            )}

            {/* EDUCATION */}

            {activeTab ===
              "Education" && (
              <section className="profileSectionCard">

                <div className="sectionHeader">

                  <div>
                    <h2>
                      Education
                    </h2>

                    <p>
                      Add your educational qualifications and academic details.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="addProfileItemButton"
                    onClick={
                      openAddEducation
                    }
                  >
                    <Plus size={17} />

                    Add Education
                  </button>

                </div>

                {education.length >
                0 ? (
                  <div className="profileItemList">

                    {education.map(
                      (item) => (
                        <div
                          className="profileItemCard"
                          key={
                            item._id
                          }
                        >

                          <div className="profileItemIcon">
                            <GraduationCap
                              size={24}
                            />
                          </div>

                          <div className="profileItemContent">

                            <div className="profileItemTitleRow">

                              <div>

                                <h3>
                                  {item.degree ||
                                    "Degree not added"}
                                </h3>

                                <h4>
                                  {item.stream ||
                                    "Stream not added"}
                                </h4>

                              </div>

                            </div>

                            <p className="profileInstitution">
                              {item.institution ||
                                "Institution not added"}
                            </p>

                            <div className="educationDetailsGrid">

                              <span>
                                <strong>
                                  Education Type:
                                </strong>{" "}
                                {item.educationType ||
                                  "Not added"}
                              </span>

                              <span>
                                <strong>
                                  Duration:
                                </strong>{" "}
                                {item.startYear ||
                                  "N/A"}

                                {" - "}

                                {item.endYear ||
                                  "N/A"}
                              </span>

                              <span>
                                <strong>
                                  CGPA / Score:
                                </strong>{" "}
                                {item.cgpa ||
                                  "Not added"}
                              </span>

                            </div>

                          </div>

                          <div className="profileItemActions">

                            <button
                              type="button"
                              className="itemEditButton"
                              onClick={() =>
                                openEditEducation(
                                  item
                                )
                              }
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              className="itemDeleteButton"
                              onClick={() =>
                                handleDeleteEducation(
                                  item._id
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="emptyProfileState">

                    <GraduationCap size={40} />

                    <h3>
                      No education added
                    </h3>

                    <p>
                      Add your education details to make your profile complete.
                    </p>

                    <button
                      type="button"
                      className="emptyStateButton"
                      onClick={
                        openAddEducation
                      }
                    >
                      <Plus size={16} />

                      Add Education
                    </button>

                  </div>
                )}

              </section>
            )}

            {/* EXPERIENCE */}

            {activeTab ===
              "Experience" && (
              <section className="profileSectionCard">

                <div className="sectionHeader">

                  <div>
                    <h2>
                      Experience
                    </h2>

                    <p>
                      Add your professional work experience.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="addProfileItemButton"
                    onClick={
                      openAddExperience
                    }
                  >
                    <Plus size={17} />

                    Add Experience
                  </button>

                </div>

                {experience.length >
                0 ? (
                  <div className="profileItemList">

                    {experience.map(
                      (item) => (
                        <div
                          className="profileItemCard"
                          key={
                            item._id
                          }
                        >

                          <div className="profileItemIcon">
                            <Briefcase size={23} />
                          </div>

                          <div className="profileItemContent">

                            <h3>
                              {item.role}
                            </h3>

                            <h4>
                              {item.company}
                            </h4>

                            <p>
                              {item.startDate ||
                                "N/A"}{" "}
                              -{" "}
                              {item.endDate ||
                                "Present"}
                            </p>

                            {item.description && (
                              <p className="profileItemDescription">
                                {
                                  item.description
                                }
                              </p>
                            )}

                          </div>

                          <div className="profileItemActions">

                            <button
                              type="button"
                              className="itemEditButton"
                              onClick={() =>
                                openEditExperience(
                                  item
                                )
                              }
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              className="itemDeleteButton"
                              onClick={() =>
                                handleDeleteExperience(
                                  item._id
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="emptyProfileState">

                    <Briefcase size={40} />

                    <h3>
                      No experience added
                    </h3>

                    <p>
                      Add your work experience to strengthen your profile.
                    </p>

                    <button
                      type="button"
                      className="emptyStateButton"
                      onClick={
                        openAddExperience
                      }
                    >
                      <Plus size={16} />

                      Add Experience
                    </button>

                  </div>
                )}

              </section>
            )}

            {/* SKILLS */}

            {activeTab ===
              "Skills" && (
              <section className="skillsProfileCard skillsFullCard">

                <div className="skillsHeader">
                  <h2>
                    Skills
                  </h2>
                </div>

                <div className="skillsList">

                  {skills.length >
                  0 ? (
                    skills.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="profileSkillTag"
                        >
                          {skill}
                        </span>
                      )
                    )
                  ) : (
                    <p className="emptySkillsText">
                      No skills added yet.
                    </p>
                  )}

                  <button
                    type="button"
                    className="addSkillButton"
                    onClick={
                      handleEditProfile
                    }
                  >
                    <Plus size={15} />

                    Add Skill
                  </button>

                </div>

              </section>
            )}

            {/* RESUME */}

            {activeTab ===
              "Resume" && (
              <section className="resumeCard">

                <h2>
                  Resume
                </h2>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hiddenFileInput"
                  onChange={
                    handleResumeUpload
                  }
                />

                {candidate?.resume?.name ? (
                  <div className="resumeContent">

                    <div className="resumeLeft">

                      <div className="resumeIcon">
                        <FileText size={26} />
                      </div>

                      <div className="resumeDetails">

                        <strong>
                          {
                            candidate.resume.name
                          }
                        </strong>

                        <span>
                          Resume uploaded
                        </span>

                      </div>

                    </div>

                    <div className="resumeActions">

                      <button
                        type="button"
                        className="resumeViewButton"
                        onClick={
                          handleViewResume
                        }
                      >
                        <Eye size={16} />

                        View
                      </button>

                      <button
                        type="button"
                        className="resumeUpdateButton"
                        onClick={
                          handleResumeButtonClick
                        }
                        disabled={
                          isUploadingResume
                        }
                      >
                        <Upload size={16} />

                        {isUploadingResume
                          ? "Uploading..."
                          : "Update"}
                      </button>

                    </div>

                  </div>
                ) : (
                  <div className="emptyResumeState">

                    <FileText size={35} />

                    <h3>
                      No resume uploaded
                    </h3>

                    <p>
                      Upload your latest resume in PDF format.
                    </p>

                    <button
                      type="button"
                      className="resumeUpdateButton"
                      onClick={
                        handleResumeButtonClick
                      }
                      disabled={
                        isUploadingResume
                      }
                    >
                      <Upload size={16} />

                      {isUploadingResume
                        ? "Uploading..."
                        : "Upload Resume"}
                    </button>

                  </div>
                )}

              </section>
            )}

          </div>

        </section>
      </main>

      {/* EDIT PROFILE MODAL */}

      {isEditing && (
        <div className="modalOverlay">

          <div className="profileModal">

            <div className="modalHeader">

              <div>
                <h2>
                  Edit Profile
                </h2>

                <p>
                  Update your personal and professional details.
                </p>
              </div>

              <button
                type="button"
                className="modalCloseButton"
                onClick={
                  handleCloseEdit
                }
              >
                <X size={21} />
              </button>

            </div>

            <form
              className="modalForm"
              onSubmit={
                handleSaveProfile
              }
            >

              <div className="formGroup">

                <label>
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={
                    formData.fullName
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="formGroup">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  disabled
                />

              </div>

              <div className="formGrid">

                <div className="formGroup">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={
                      formData.location
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

              <div className="formGrid">

                <div className="formGroup">

                  <label>
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={
                      formData.dateOfBirth
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={
                      formData.gender
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

              </div>

              <div className="formGroup">

                <label>
                  Professional Summary
                </label>

                <textarea
                  name="bio"
                  value={
                    formData.bio
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                />

              </div>

              <div className="formGroup">

                <label>
                  Skills
                </label>

                <input
                  type="text"
                  name="skills"
                  placeholder="React, JavaScript, Node.js"
                  value={
                    formData.skills
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="modalActions">

                <button
                  type="button"
                  className="secondaryButton"
                  onClick={
                    handleCloseEdit
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primaryButton"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* EDUCATION MODAL */}

      {isEducationModalOpen && (
        <div className="modalOverlay">

          <div className="profileModal educationModal">

            <div className="modalHeader">

              <div>

                <h2>
                  {editingEducation
                    ? "Edit Education"
                    : "Add Education"}
                </h2>

                <p>
                  Add your complete educational qualification details.
                </p>

              </div>

              <button
                type="button"
                className="modalCloseButton"
                onClick={
                  closeEducationModal
                }
              >
                <X size={21} />
              </button>

            </div>

            <form
              className="modalForm"
              onSubmit={
                handleSaveEducation
              }
            >

              <div className="formGrid">

                <div className="formGroup">

                  <label>
                    Degree / Qualification *
                  </label>

                  <input
                    type="text"
                    name="degree"
                    placeholder="Example: B.Tech"
                    value={
                      educationForm.degree
                    }
                    onChange={
                      handleEducationChange
                    }
                    required
                  />

                </div>

                <div className="formGroup">

                  <label>
                    Stream / Specialization
                  </label>

                  <input
                    type="text"
                    name="stream"
                    placeholder="Example: Computer Science Engineering"
                    value={
                      educationForm.stream
                    }
                    onChange={
                      handleEducationChange
                    }
                  />

                </div>

              </div>

              <div className="formGroup">

                <label>
                  College / Institution *
                </label>

                <input
                  type="text"
                  name="institution"
                  placeholder="Example: XYZ College of Engineering"
                  value={
                    educationForm.institution
                  }
                  onChange={
                    handleEducationChange
                  }
                  required
                />

              </div>

              <div className="formGrid">

                <div className="formGroup">

                  <label>
                    Education Type
                  </label>

                  <select
                    name="educationType"
                    value={
                      educationForm.educationType
                    }
                    onChange={
                      handleEducationChange
                    }
                  >
                    <option value="Full Time">
                      Full Time
                    </option>

                    <option value="Part Time">
                      Part Time
                    </option>

                    <option value="Distance Education">
                      Distance Education
                    </option>
                  </select>

                </div>

                <div className="formGroup">

                  <label>
                    CGPA / Percentage / Grade
                  </label>

                  <input
                    type="text"
                    name="cgpa"
                    placeholder="Example: 8.2 or 85%"
                    value={
                      educationForm.cgpa
                    }
                    onChange={
                      handleEducationChange
                    }
                  />

                </div>

              </div>

              <div className="formGrid">

                <div className="formGroup">

                  <label>
                    Start Year
                  </label>

                  <input
                    type="number"
                    name="startYear"
                    placeholder="2019"
                    min="1900"
                    max="2100"
                    value={
                      educationForm.startYear
                    }
                    onChange={
                      handleEducationChange
                    }
                  />

                </div>

                <div className="formGroup">

                  <label>
                    End Year
                  </label>

                  <input
                    type="number"
                    name="endYear"
                    placeholder="2023"
                    min="1900"
                    max="2100"
                    value={
                      educationForm.endYear
                    }
                    onChange={
                      handleEducationChange
                    }
                  />

                </div>

              </div>

              <div className="modalActions">

                <button
                  type="button"
                  className="secondaryButton"
                  onClick={
                    closeEducationModal
                  }
                  disabled={
                    isSavingEducation
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primaryButton"
                  disabled={
                    isSavingEducation
                  }
                >
                  {isSavingEducation
                    ? "Saving..."
                    : editingEducation
                      ? "Update Education"
                      : "Save Education"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* EXPERIENCE MODAL */}

      {isExperienceModalOpen && (
        <div className="modalOverlay">

          <div className="profileModal">

            <div className="modalHeader">

              <div>

                <h2>
                  {editingExperience
                    ? "Edit Experience"
                    : "Add Experience"}
                </h2>

                <p>
                  Add your professional work experience.
                </p>

              </div>

              <button
                type="button"
                className="modalCloseButton"
                onClick={
                  closeExperienceModal
                }
              >
                <X size={21} />
              </button>

            </div>

            <form
              className="modalForm"
              onSubmit={
                handleSaveExperience
              }
            >

              <div className="formGroup">

                <label>
                  Company Name *
                </label>

                <input
                  type="text"
                  name="company"
                  placeholder="Example: Cognizant"
                  value={
                    experienceForm.company
                  }
                  onChange={
                    handleExperienceChange
                  }
                  required
                />

              </div>

              <div className="formGroup">

                <label>
                  Job Role *
                </label>

                <input
                  type="text"
                  name="role"
                  placeholder="Example: Frontend Developer"
                  value={
                    experienceForm.role
                  }
                  onChange={
                    handleExperienceChange
                  }
                  required
                />

              </div>

              <div className="formGrid">

                <div className="formGroup">

                  <label>
                    Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      experienceForm.startDate
                    }
                    onChange={
                      handleExperienceChange
                    }
                    required
                  />

                </div>

                <div className="formGroup">

                  <label>
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={
                      experienceForm.endDate
                    }
                    onChange={
                      handleExperienceChange
                    }
                  />

                </div>

              </div>

              <div className="formGroup">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Describe your responsibilities and work..."
                  value={
                    experienceForm.description
                  }
                  onChange={
                    handleExperienceChange
                  }
                  rows="5"
                />

              </div>

              <div className="modalActions">

                <button
                  type="button"
                  className="secondaryButton"
                  onClick={
                    closeExperienceModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primaryButton"
                  disabled={
                    isSavingExperience
                  }
                >
                  {isSavingExperience
                    ? "Saving..."
                    : editingExperience
                      ? "Update Experience"
                      : "Save Experience"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </>
  );
}

export default Profile;