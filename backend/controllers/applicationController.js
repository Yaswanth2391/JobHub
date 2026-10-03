const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");

const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

// ======================================
// HELPER: NORMALIZE TEXT
// ======================================

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// ======================================
// HELPER: NORMALIZE SKILL
// ======================================

const normalizeSkill = (skill = "") => {
  return normalizeText(skill)
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// ======================================
// HELPER: CHECK SKILL IN RESUME
// ======================================

const skillMatchesResume = (skill, resumeText) => {
  const normalizedSkill = normalizeSkill(skill);

  if (!normalizedSkill || !resumeText) {
    return false;
  }

  const normalizedResume = normalizeText(resumeText);

  // Direct phrase match
  if (normalizedResume.includes(normalizedSkill)) {
    return true;
  }

  // Special handling for common technical skills
  const skillAliases = {
    javascript: ["javascript", "js", "ecmascript"],
    "react.js": ["react", "reactjs", "react.js"],
    react: ["react", "reactjs", "react.js"],
    "node.js": ["node", "nodejs", "node.js"],
    node: ["node", "nodejs", "node.js"],
    "express.js": ["express", "expressjs", "express.js"],
    express: ["express", "expressjs", "express.js"],
    mongodb: ["mongodb", "mongo db", "mongo"],
    mongoose: ["mongoose"],
    "next.js": ["next", "nextjs", "next.js"],
    nextjs: ["next", "nextjs", "next.js"],
    html: ["html", "html5"],
    css: ["css", "css3"],
    sql: ["sql"],
    mysql: ["mysql"],
    postgresql: ["postgresql", "postgres"],
    git: ["git"],
    github: ["github"],
    java: ["java"],
    python: ["python"],
    c: [" c "],
    cpp: ["c++"],
    "c++": ["c++"],
    flutter: ["flutter", "dart"],
    dart: ["dart"],
    bootstrap: ["bootstrap"],
    "rest api": ["rest api", "restful api", "restful services"],
    api: ["api", "apis"],
    jwt: ["jwt", "json web token", "json web tokens"],
    typescript: ["typescript", "ts"],
    "tailwind css": ["tailwind", "tailwind css"],
    docker: ["docker"],
    aws: ["aws", "amazon web services"],
    azure: ["azure"],
    firebase: ["firebase"],
  };

  const aliases = skillAliases[normalizedSkill];

  if (aliases && aliases.length > 0) {
    return aliases.some((alias) => {
      return normalizedResume.includes(normalizeSkill(alias));
    });
  }

  return false;
};

// ======================================
// HELPER: EXTRACT SKILLS FROM RESUME
// ======================================

const extractSkillsFromResume = (resumeText, requiredSkills = []) => {
  const extractedSkills = [];

  if (!resumeText) {
    return extractedSkills;
  }

  requiredSkills.forEach((skill) => {
    if (skillMatchesResume(skill, resumeText)) {
      extractedSkills.push(skill);
    }
  });

  return [...new Set(extractedSkills)];
};

// ======================================
// HELPER: PARSE EXPERIENCE REQUIREMENT
// ======================================

const parseExperienceRequirement = (experienceText = "") => {
  const text = normalizeText(experienceText);

  // ======================================
  // FRESHER / 0 YEARS
  // ======================================

  if (
    text.includes("fresher") ||
    text.includes("freshers") ||
    text.includes("no experience") ||
    text.includes("0 year") ||
    text.includes("0 years")
  ) {
    return {
      min: 0,
      max: 0,
    };
  }

  // ======================================
  // RANGE
  // Example: 0-1 years
  // Example: 1-3 years
  // Example: 2 to 5 years
  // ======================================

  const rangeMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*years?/,
  );

  if (rangeMatch) {
    return {
      min: Number(rangeMatch[1]),
      max: Number(rangeMatch[2]),
    };
  }

  // ======================================
  // PLUS
  // Example: 2+ years
  // ======================================

  const plusMatch = text.match(
    /(\d+(?:\.\d+)?)\s*\+\s*years?/,
  );

  if (plusMatch) {
    return {
      min: Number(plusMatch[1]),
      max: Infinity,
    };
  }

  // ======================================
  // MINIMUM
  // Example: minimum 2 years
  // Example: at least 2 years
  // ======================================

  const minimumMatch = text.match(
    /(?:minimum|min|at least)\s*(\d+(?:\.\d+)?)\s*years?/,
  );

  if (minimumMatch) {
    return {
      min: Number(minimumMatch[1]),
      max: Infinity,
    };
  }

  // ======================================
  // SIMPLE
  // Example: 2 years experience
  // ======================================

  const simpleMatch = text.match(
    /(\d+(?:\.\d+)?)\s*years?/,
  );

  if (simpleMatch) {
    return {
      min: Number(simpleMatch[1]),
      max: Infinity,
    };
  }

  // ======================================
  // DEFAULT
  // ======================================

  return {
    min: 0,
    max: Infinity,
  };
};

// ======================================
// HELPER: EXTRACT PROFESSIONAL EXPERIENCE
// ======================================

const calculateResumeExperienceYears = (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    return 0;
  }

  const originalText = String(resumeText);

  // --------------------------------------------------
  // Find only professional/work experience sections.
  // We intentionally ignore:
  // Education
  // Projects
  // Certifications
  // Achievements
  // Skills
  // Internship sections
  // --------------------------------------------------

  const sectionRegex =
    /(?:professional\s+experience|work\s+experience|work\s+history|employment\s+history|employment|experience)\s*:?\s*([\s\S]*?)(?=\n\s*(?:education|academic\s+qualifications?|projects?|personal\s+projects?|certifications?|certificates?|skills|technical\s+skills|achievements?|awards?|internships?|courses?|languages|declaration|references?)\s*:?\s*(?:\n|$)|$)/gi;

  const experienceSections = [];

  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(originalText)) !== null) {
    if (sectionMatch[1] && sectionMatch[1].trim()) {
      experienceSections.push(sectionMatch[1]);
    }
  }

  // If no clear experience section exists,
  // do NOT scan the entire resume because that can
  // incorrectly count education/project dates.
  if (experienceSections.length === 0) {
    return 0;
  }

  const experienceText = experienceSections.join("\n");

  // --------------------------------------------------
  // Remove internship-related entries.
  // Internship experience should not be counted as
  // professional work experience.
  // --------------------------------------------------

  const lines = experienceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const professionalLines = [];

  let insideInternship = false;

  lines.forEach((line) => {
    const normalizedLine = line.toLowerCase();

    if (
      /\bintern(ship)?\b|\binterned\b|\bintern\b/.test(
        normalizedLine,
      )
    ) {
      insideInternship = true;
      return;
    }

    // A new likely job entry can end the internship block.
    if (
      insideInternship &&
      (
        /\bdeveloper\b/.test(normalizedLine) ||
        /\bengineer\b/.test(normalizedLine) ||
        /\bmanager\b/.test(normalizedLine) ||
        /\banalyst\b/.test(normalizedLine) ||
        /\bdesigner\b/.test(normalizedLine) ||
        /\bconsultant\b/.test(normalizedLine) ||
        /\bexecutive\b/.test(normalizedLine)
      )
    ) {
      insideInternship = false;
    }

    if (!insideInternship) {
      professionalLines.push(line);
    }
  });

  const professionalText = professionalLines.join("\n");

  if (!professionalText.trim()) {
    return 0;
  }

  // --------------------------------------------------
  // Supported date formats:
  //
  // Jan 2024 - Dec 2025
  // January 2024 - Present
  // 01/2024 - 12/2025
  // 2024 - 2025
  // 2023 to Present
  // --------------------------------------------------

  const monthNames =
    "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

  const dateRangeRegex = new RegExp(
    `(${monthNames})?\\s*(\\d{4})\\s*(?:-|to)\\s*(present|${monthNames}\\s*\\d{4}|\\d{4})`,
    "gi",
  );

  const ranges = [];

  const matches = [
    ...professionalText.matchAll(dateRangeRegex),
  ];

  matches.forEach((match) => {
    const startYear = Number(match[2]);

    if (
      !startYear ||
      startYear < 1950 ||
      startYear > new Date().getFullYear()
    ) {
      return;
    }

    let endYear;

    if (
      String(match[3])
        .toLowerCase()
        .includes("present")
    ) {
      endYear = new Date().getFullYear();
    } else {
      const yearMatch =
        String(match[3]).match(/\d{4}/);

      if (!yearMatch) {
        return;
      }

      endYear = Number(yearMatch[0]);
    }

    if (
      !endYear ||
      endYear < startYear ||
      endYear > new Date().getFullYear()
    ) {
      return;
    }

    const startMonthText =
      String(match[1] || "").toLowerCase();

    let startMonth = 1;

    if (startMonthText) {
      const monthMap = {
        jan: 1,
        january: 1,
        feb: 2,
        february: 2,
        mar: 3,
        march: 3,
        apr: 4,
        april: 4,
        may: 5,
        jun: 6,
        june: 6,
        jul: 7,
        july: 7,
        aug: 8,
        august: 8,
        sep: 9,
        sept: 9,
        september: 9,
        oct: 10,
        october: 10,
        nov: 11,
        november: 11,
        dec: 12,
        december: 12,
      };

      startMonth =
        monthMap[startMonthText] || 1;
    }

    let endMonth = 12;

    const endText =
      String(match[3]).toLowerCase();

    if (!endText.includes("present")) {
      const endMonthMatch =
        endText.match(
          new RegExp(monthNames, "i"),
        );

      if (endMonthMatch) {
        const monthMap = {
          jan: 1,
          january: 1,
          feb: 2,
          february: 2,
          mar: 3,
          march: 3,
          apr: 4,
          april: 4,
          may: 5,
          jun: 6,
          june: 6,
          jul: 7,
          july: 7,
          aug: 8,
          august: 8,
          sep: 9,
          sept: 9,
          september: 9,
          oct: 10,
          october: 10,
          nov: 11,
          november: 11,
          dec: 12,
          december: 12,
        };

        endMonth =
          monthMap[
            endMonthMatch[0].toLowerCase()
          ] || 12;
      }
    } else {
      endMonth =
        new Date().getMonth() + 1;
    }

    const startDate =
      startYear * 12 + (startMonth - 1);

    const endDate =
      endYear * 12 + (endMonth - 1);

    if (endDate >= startDate) {
      ranges.push({
        start: startDate,
        end: endDate,
      });
    }
  });

  // --------------------------------------------------
  // YEAR-ONLY RANGE FALLBACK
  // --------------------------------------------------

  if (ranges.length === 0) {
    const yearRangeRegex =
      /\b(19\d{2}|20\d{2})\s*(?:-|to)\s*(present|19\d{2}|20\d{2})\b/gi;

    const yearMatches = [
      ...professionalText.matchAll(yearRangeRegex),
    ];

    yearMatches.forEach((match) => {
      const startYear = Number(match[1]);

      const endYear =
        String(match[2]).toLowerCase() === "present"
          ? new Date().getFullYear()
          : Number(match[2]);

      if (
        startYear >= 1950 &&
        startYear <= new Date().getFullYear() &&
        endYear >= startYear &&
        endYear <= new Date().getFullYear()
      ) {
        ranges.push({
          start: startYear * 12,
          end: endYear * 12,
        });
      }
    });
  }

  // --------------------------------------------------
  // MERGE OVERLAPPING JOB PERIODS
  // --------------------------------------------------

  ranges.sort(
    (a, b) => a.start - b.start,
  );

  const mergedRanges = [];

  ranges.forEach((range) => {
    const last =
      mergedRanges[mergedRanges.length - 1];

    if (!last) {
      mergedRanges.push({ ...range });
      return;
    }

    if (range.start <= last.end) {
      last.end = Math.max(
        last.end,
        range.end,
      );
    } else {
      mergedRanges.push({ ...range });
    }
  });

  let totalMonths = 0;

  mergedRanges.forEach((range) => {
    totalMonths +=
      range.end - range.start;
  });

  // --------------------------------------------------
  // EXPLICIT PROFESSIONAL EXPERIENCE STATEMENTS
  //
  // Example:
  // "2 years of professional experience"
  // "6 months work experience"
  //
  // Only use these if they occur inside the
  // professional experience section.
  // --------------------------------------------------

  const explicitExperienceRegex =
    /(\d+(?:\.\d+)?)\s*(years?|yrs?|months?)\s+(?:of\s+)?(?:professional\s+experience|work\s+experience|experience)/gi;

  const explicitMatches = [
    ...professionalText.matchAll(
      explicitExperienceRegex,
    ),
  ];

  explicitMatches.forEach((match) => {
    const value = Number(match[1]);

    if (
      !value ||
      value < 0 ||
      value > 50
    ) {
      return;
    }

    const unit =
      String(match[2]).toLowerCase();

    const months = unit.startsWith("month")
      ? value
      : value * 12;

    totalMonths = Math.max(
      totalMonths,
      months,
    );
  });

  // --------------------------------------------------
  // FINAL RESULT
  // --------------------------------------------------

  const years = totalMonths / 12;

  return Math.round(years * 10) / 10;
};

// ======================================
// ATS: EXPERIENCE SCORE
// ======================================

const calculateExperienceScore = (
  requiredExperience,
  candidateExperienceYears,
) => {
  const requirement = parseExperienceRequirement(
    requiredExperience,
  );

  const candidateYears =
    Number(candidateExperienceYears) || 0;

  // ======================================
  // CANDIDATE IS WITHIN REQUIRED RANGE
  // ======================================

  if (
    candidateYears >= requirement.min &&
    candidateYears <= requirement.max
  ) {
    return {
      score: 25,
      maxScore: 25,
      candidateYears,
      requiredMin: requirement.min,
      requiredMax: requirement.max,
      matched: true,
    };
  }

  // ======================================
  // MORE EXPERIENCE THAN REQUIRED
  // ======================================
  //
  // We do not punish a candidate for
  // having more experience.
  //
  // ======================================

  if (
    requirement.max !== Infinity &&
    candidateYears > requirement.max
  ) {
    return {
      score: 25,
      maxScore: 25,
      candidateYears,
      requiredMin: requirement.min,
      requiredMax: requirement.max,
      matched: true,
    };
  }

  // ======================================
  // LESS THAN MINIMUM
  // ======================================

  if (candidateYears < requirement.min) {
    if (requirement.min <= 0) {
      return {
        score: 25,
        maxScore: 25,
        candidateYears,
        requiredMin: requirement.min,
        requiredMax: requirement.max,
        matched: true,
      };
    }

    const ratio =
      candidateYears / requirement.min;

    const score = Math.round(
      Math.max(
        0,
        Math.min(25, ratio * 25),
      ),
    );

    return {
      score,
      maxScore: 25,
      candidateYears,
      requiredMin: requirement.min,
      requiredMax: requirement.max,
      matched: false,
    };
  }

  return {
    score: 25,
    maxScore: 25,
    candidateYears,
    requiredMin: requirement.min,
    requiredMax: requirement.max,
    matched: true,
  };
};

// ======================================
// ATS: RESUME QUALITY SCORE
// ======================================

const calculateResumeQuality = (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    return {
      score: 0,
      maxScore: 15,
      checks: {
        contact: false,
        summary: false,
        skills: false,
        education: false,
        experience: false,
        projects: false,
        certifications: false,
      },
    };
  }

  const text = normalizeText(resumeText);

  let score = 0;

  const checks = {
    contact: false,
    summary: false,
    skills: false,
    education: false,
    experience: false,
    projects: false,
    certifications: false,
  };

  // ======================================
  // CONTACT - 2 POINTS
  // ======================================

  const hasEmail =
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(
      resumeText,
    );

  const hasPhone =
    /(?:\+91[\s-]?)?[6-9]\d{9}/.test(
      resumeText.replace(/\s/g, ""),
    );

  if (hasEmail || hasPhone) {
    checks.contact = true;
    score += 2;
  }

  // ======================================
  // SUMMARY - 2 POINTS
  // ======================================

  if (
    text.includes("summary") ||
    text.includes("objective") ||
    text.includes("professional summary") ||
    text.includes("profile")
  ) {
    checks.summary = true;
    score += 2;
  }

  // ======================================
  // SKILLS - 2 POINTS
  // ======================================

  if (
    text.includes("skills") ||
    text.includes("technical skills") ||
    text.includes("technologies") ||
    text.includes("technical expertise")
  ) {
    checks.skills = true;
    score += 2;
  }

  // ======================================
  // EDUCATION - 2 POINTS
  // ======================================

  if (
    text.includes("education") ||
    text.includes("qualification") ||
    text.includes("academic")
  ) {
    checks.education = true;
    score += 2;
  }

  // ======================================
  // EXPERIENCE - 2 POINTS
  // ======================================

  if (
    text.includes("experience") ||
    text.includes("employment") ||
    text.includes("work history") ||
    text.includes("professional experience")
  ) {
    checks.experience = true;
    score += 2;
  }

  // ======================================
  // PROJECTS - 2 POINTS
  // ======================================

  if (
    text.includes("projects") ||
    text.includes("project")
  ) {
    checks.projects = true;
    score += 2;
  }

  // ======================================
  // CERTIFICATIONS - 2 POINTS
  // ======================================

  if (
    text.includes("certification") ||
    text.includes("certifications")
  ) {
    checks.certifications = true;
    score += 2;
  }

  return {
    score: Math.min(15, score),
    maxScore: 15,
    checks,
  };
};

// ======================================
// ATS: ROLE MATCH SCORE
// ======================================

const calculateRoleMatch = (
  jobTitle,
  resumeText,
) => {
  if (!jobTitle || !resumeText) {
    return {
      score: 0,
      maxScore: 10,
      matchedKeywords: [],
    };
  }

  const jobWords = normalizeText(jobTitle)
    .split(" ")
    .filter(
      (word) =>
        word.length > 2 &&
        ![
          "the",
          "and",
          "for",
          "with",
          "developer",
          "engineer",
          "role",
        ].includes(word),
    );

  if (jobWords.length === 0) {
    return {
      score: 10,
      maxScore: 10,
      matchedKeywords: [],
    };
  }

  const normalizedResumeText =
    normalizeText(resumeText);

  const matchedKeywords = jobWords.filter(
    (word) =>
      normalizedResumeText.includes(word),
  );

  const uniqueMatchedKeywords = [
    ...new Set(matchedKeywords),
  ];

  const ratio =
    uniqueMatchedKeywords.length /
    jobWords.length;

  const score = Math.round(
    Math.min(10, ratio * 10),
  );

  return {
    score,
    maxScore: 10,
    matchedKeywords:
      uniqueMatchedKeywords,
  };
};

// ======================================
// ATS: EDUCATION SCORE
// ======================================

const calculateEducationScore = (
  resumeText,
) => {
  if (!resumeText || !resumeText.trim()) {
    return {
      score: 0,
      maxScore: 10,
      matched: false,
    };
  }

  const text = normalizeText(resumeText);

  const hasEducationSection =
    text.includes("education") ||
    text.includes("qualification") ||
    text.includes("academic");

  if (!hasEducationSection) {
    return {
      score: 0,
      maxScore: 10,
      matched: false,
    };
  }

  // Detect common degree/qualification terms
  const educationKeywords = [
    "b.tech",
    "btech",
    "b.e",
    "be ",
    "bachelor",
    "bachelors",
    "degree",
    "m.tech",
    "mtech",
    "m.e",
    "master",
    "mca",
    "bca",
    "mba",
    "m.sc",
    "msc",
    "b.sc",
    "bsc",
    "diploma",
    "intermediate",
    "12th",
    "10th",
    "ssc",
    "hsc",
  ];

  const hasQualification =
    educationKeywords.some(
      (keyword) =>
        text.includes(normalizeSkill(keyword)),
    );

  if (hasQualification) {
    return {
      score: 10,
      maxScore: 10,
      matched: true,
    };
  }

  return {
    score: 7,
    maxScore: 10,
    matched: true,
  };
};

// ======================================
// ATS CALCULATION
// ======================================

const calculateATS = async (
  candidate,
  job,
) => {
  let resumeText = "";

  // ====================================
  // RESUME IS REQUIRED FOR ATS
  // ====================================

  if (
    !candidate.resume ||
    !candidate.resume.url
  ) {
    throw new Error(
      "Candidate resume not found.",
    );
  }

  // ====================================
  // READ RESUME PDF
  // ====================================

  try {
    let actualFileName = "";

    // ------------------------------------
    // Extract generated filename from URL
    // ------------------------------------

    try {
      const resumeUrl = new URL(
        candidate.resume.url,
      );

      actualFileName = path.basename(
        resumeUrl.pathname,
      );
    } catch (urlError) {
      actualFileName = "";
    }

    // ------------------------------------
    // Fallback to stored resume name
    // ------------------------------------

    if (!actualFileName) {
      actualFileName =
        candidate.resume.name || "";
    }

    if (!actualFileName) {
      throw new Error(
        "Resume filename not available.",
      );
    }

    const resumeFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      "resumes",
      actualFileName,
    );

    // ------------------------------------
    // Check file exists
    // ------------------------------------

    if (!fs.existsSync(resumeFilePath)) {
      throw new Error(
        `Resume file not found: ${actualFileName}`,
      );
    }

    // ------------------------------------
    // Read PDF
    // ------------------------------------

    const pdfBuffer =
      fs.readFileSync(
        resumeFilePath,
      );

    // ------------------------------------
    // pdf-parse v2.4.5
    // ------------------------------------

    const parser = new PDFParse({
      data: pdfBuffer,
    });

    const result =
      await parser.getText();

    resumeText =
      result.text || "";

    await parser.destroy();

    // ------------------------------------
    // Validate extracted text
    // ------------------------------------

    if (!resumeText.trim()) {
      throw new Error(
        "Unable to extract text from resume PDF.",
      );
    }

    console.log(
      "Resume parsed successfully.",
    );

    console.log(
      `Resume text length: ${resumeText.length}`,
    );
  } catch (resumeError) {
    console.error(
      "Resume parsing error:",
      resumeError,
    );

    throw new Error(
      "Unable to read candidate resume. Please upload a valid text-based PDF resume.",
    );
  }

  // ====================================
  // IMPORTANT:
  // ATS USES RESUME ONLY
  // ====================================
  //
  // Candidate profile skills:
  // NOT USED
  //
  // Candidate profile experience:
  // NOT USED
  //
  // Candidate profile education:
  // NOT USED
  //
  // Application experience field:
  // NOT USED
  //
  // Everything below comes from:
  // RESUME PDF TEXT
  //
  // ====================================

  // ====================================
  // REQUIRED JOB SKILLS
  // 40 POINTS
  // ====================================

  const requiredSkills =
    Array.isArray(job.skills)
      ? job.skills.filter(Boolean)
      : [];

  const candidateSkills =
    extractSkillsFromResume(
      resumeText,
      requiredSkills,
    );

  const matchedSkills =
    candidateSkills;

  const missingSkills =
    requiredSkills.filter(
      (skill) =>
        !candidateSkills.some(
          (matchedSkill) =>
            normalizeSkill(
              matchedSkill,
            ) ===
            normalizeSkill(skill),
        ),
    );

  let skillsScore = 0;

  if (requiredSkills.length > 0) {
    skillsScore = Math.round(
      (matchedSkills.length /
        requiredSkills.length) *
        40,
    );
  } else {
    // No required skills means
    // no penalty.
    skillsScore = 40;
  }

  // ====================================
  // EXPERIENCE
  // 25 POINTS
  // ====================================

  // IMPORTANT:
  // Experience is extracted from
  // the resume PDF only.
  const candidateExperienceYears =
    calculateResumeExperienceYears(
      resumeText,
    );

  const experienceResult =
    calculateExperienceScore(
      job.experience,
      candidateExperienceYears,
    );

  // ====================================
  // RESUME QUALITY
  // 15 POINTS
  // ====================================

  const resumeQuality =
    calculateResumeQuality(
      resumeText,
    );

  // ====================================
  // ROLE MATCH
  // 10 POINTS
  // ====================================

  const roleMatch =
    calculateRoleMatch(
      job.jobTitle,
      resumeText,
    );

  // ====================================
  // EDUCATION
  // 10 POINTS
  // ====================================

  const educationMatch =
    calculateEducationScore(
      resumeText,
    );

  // ====================================
  // FINAL SCORE
  // ====================================

  const totalScore =
    skillsScore +
    experienceResult.score +
    resumeQuality.score +
    roleMatch.score +
    educationMatch.score;

  const finalScore = Math.min(
    100,
    Math.max(
      0,
      totalScore,
    ),
  );

  // ====================================
  // ATS LOGGING
  // ====================================

  console.log(
    "======================================",
  );

  console.log(
    "ATS CALCULATION",
  );

  console.log(
    "======================================",
  );

  console.log(
    `Candidate: ${candidate.fullName}`,
  );

  console.log(
    `Job: ${job.jobTitle}`,
  );

  console.log(
    `ATS Score: ${finalScore}/100`,
  );

  console.log(
    `Skills: ${skillsScore}/40`,
  );

  console.log(
    `Experience: ${experienceResult.score}/25`,
  );

  console.log(
    `Resume Quality: ${resumeQuality.score}/15`,
  );

  console.log(
    `Role Match: ${roleMatch.score}/10`,
  );

  console.log(
    `Education: ${educationMatch.score}/10`,
  );

  console.log(
    `Resume Experience: ${candidateExperienceYears} years`,
  );

  console.log(
    `Matched Skills: ${matchedSkills.join(", ") || "None"}`,
  );

  console.log(
    `Missing Skills: ${missingSkills.join(", ") || "None"}`,
  );

  console.log(
    "======================================",
  );

  // ====================================
  // RETURN ATS RESULT
  // ====================================

  return {
    atsScore: finalScore,

    // These are skills extracted
    // from resume only.
    candidateSkills,

    requiredSkills,

    atsMatchedSkills:
      matchedSkills,

    atsMissingSkills:
      missingSkills,

    atsStatus:
      "Calculated",

    atsBreakdown: {
      skills: {
        score: skillsScore,
        maxScore: 40,
        matched:
          matchedSkills.length,
        required:
          requiredSkills.length,
      },

      experience: {
        score:
          experienceResult.score,
        maxScore: 25,
        candidateYears:
          candidateExperienceYears,
        requiredMin:
          experienceResult.requiredMin,
        requiredMax:
          experienceResult.requiredMax,
        matched:
          experienceResult.matched,
      },

      resumeQuality: {
        score:
          resumeQuality.score,
        maxScore: 15,
        checks:
          resumeQuality.checks,
      },

      roleMatch: {
        score:
          roleMatch.score,
        maxScore: 10,
        matchedKeywords:
          roleMatch.matchedKeywords,
      },

      education: {
        score:
          educationMatch.score,
        maxScore: 10,
        matched:
          educationMatch.matched,
      },
    },
  };
};

// ======================================
// APPLY FOR JOB
// ======================================

const applyForJob = async (
  req,
  res,
) => {
  try {
    const {
      jobId,
      jobTitle,
      companyName,
      companyLogo,
      location,
      fullName,
      email,
      phone,
      experience,
      coverLetter,
    } = req.body;

    // ======================================
    // CHECK REQUIRED FIELDS
    // ======================================

    if (
      !jobId ||
      !jobTitle ||
      !companyName ||
      !fullName ||
      !email ||
      !phone ||
      !experience ||
      !coverLetter
    ) {
      return res.status(400).json({
        message:
          "Please fill all required fields.",
      });
    }

    // ======================================
    // CHECK DUPLICATE APPLICATION
    // ======================================

    const existingApplication =
      await Application.findOne({
        candidate:
          req.candidateId,
        jobId,
      });

    if (existingApplication) {
      return res.status(400).json({
        message:
          "You have already applied for this job.",
      });
    }

    // ======================================
    // GET CANDIDATE
    // ======================================

    const candidate =
      await Candidate.findById(
        req.candidateId,
      );

    if (!candidate) {
      return res.status(404).json({
        message:
          "Candidate profile not found.",
      });
    }

    // ======================================
    // RESUME CHECK
    // ======================================

    if (
      !candidate.resume ||
      !candidate.resume.url
    ) {
      return res.status(400).json({
        message:
          "Please upload your resume before applying.",
      });
    }

    // ======================================
    // GET JOB
    // ======================================

    const job =
      await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message:
          "Job not found.",
      });
    }

    // ======================================
    // CALCULATE ATS
    // ======================================

    let atsResult;

    try {
      atsResult =
        await calculateATS(
          candidate,
          job,
        );
    } catch (atsError) {
      console.error(
        "ATS calculation failed:",
        atsError,
      );

      return res.status(400).json({
        message:
          atsError.message ||
          "Unable to calculate ATS score from resume.",
      });
    }

    // ======================================
    // CREATE APPLICATION
    // ======================================

    const application =
      await Application.create({
        candidate:
          req.candidateId,

        jobId,

        jobTitle:
          job.jobTitle ||
          jobTitle,

        companyName:
          job.companyName ||
          companyName,

        companyLogo:
          job.companyLogo ||
          companyLogo ||
          "",

        location:
          job.location ||
          location ||
          "",

        fullName:
          candidate.fullName ||
          fullName,

        email:
          candidate.email ||
          email,

        phone:
          candidate.phone ||
          phone,

        // This field is stored for
        // application information only.
        //
        // It is NOT used by ATS.
        experience,

        coverLetter,

        // ==================================
        // ATS DATA
        // ==================================

        candidateSkills:
          atsResult.candidateSkills,

        requiredSkills:
          atsResult.requiredSkills,

        atsScore:
          atsResult.atsScore,

        atsMatchedSkills:
          atsResult.atsMatchedSkills,

        atsMissingSkills:
          atsResult.atsMissingSkills,

        atsStatus:
          atsResult.atsStatus,

        atsBreakdown:
          atsResult.atsBreakdown,

        // ==================================
        // APPLICATION STATUS
        // ==================================

        status:
          "Applied",
      });

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(201).json({
      message:
        "Application submitted successfully!",

      application,
    });
  } catch (error) {
    console.error(
      "Apply job error:",
      error,
    );

    return res.status(500).json({
      message:
        "Unable to submit application.",
    });
  }
};

// ======================================
// GET MY APPLICATIONS
// ======================================

const getMyApplications = async (
  req,
  res,
) => {
  try {
    const applications =
      await Application.find({
        candidate:
          req.candidateId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count:
        applications.length,

      applications,
    });
  } catch (error) {
    console.error(
      "Get applications error:",
      error,
    );

    return res.status(500).json({
      message:
        "Unable to fetch applications.",
    });
  }
};

// ======================================
// GET SINGLE APPLICATION
// ======================================

const getApplicationById = async (
  req,
  res,
) => {
  try {
    const application =
      await Application.findOne({
        _id:
          req.params.applicationId,

        candidate:
          req.candidateId,
      });

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found.",
      });
    }

    return res.status(200).json({
      application,
    });
  } catch (error) {
    console.error(
      "Get application error:",
      error,
    );

    return res.status(500).json({
      message:
        "Unable to fetch application.",
    });
  }
};

// ======================================
// DELETE APPLICATION
// ======================================

const deleteApplication = async (
  req,
  res,
) => {
  try {
    const application =
      await Application.findOne({
        _id:
          req.params.applicationId,

        candidate:
          req.candidateId,
      });

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found.",
      });
    }

    await application.deleteOne();

    return res.status(200).json({
      message:
        "Application deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete application error:",
      error,
    );

    return res.status(500).json({
      message:
        "Unable to delete application.",
    });
  }
};

// ======================================
// EXPORT
// ======================================

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationById,
  deleteApplication,
};