import tcsLogo from "../assets/Companies/tcs_logo.png";
import infosysLogo from "../assets/Companies/infosys_logo.png";
import wiproLogo from "../assets/Companies/wipro_logo.png";

const jobs = [
  {
    id: 1,
    company: "TCS",
    logo: tcsLogo,
    title: "Frontend Developer",
    location: "Hyderabad, Telangana",
    type: "Full Time",
    workMode: "Hybrid",
    salary: "₹4 LPA – ₹8 LPA",
    experience: "0 – 2 Years",
    postedDate: "Recently Posted",
    skills: [
      "React",
      "JavaScript",
      "HTML",
      "CSS",
      "Git",
    ],

    description:
      "We are looking for a passionate Frontend Developer to join our team. You will work on modern and responsive web applications and collaborate with designers and backend developers to create high-quality user experiences.",

    responsibilities: [
      "Develop responsive and user-friendly web applications.",
      "Build reusable React components.",
      "Collaborate with UI/UX designers and backend developers.",
      "Write clean, maintainable and efficient code.",
      "Optimize applications for performance.",
      "Participate in code reviews and team discussions.",
    ],

    requirements: [
      "Good knowledge of React.js.",
      "Strong understanding of JavaScript.",
      "Knowledge of HTML and CSS.",
      "Understanding of responsive web design.",
      "Basic knowledge of Git and version control.",
      "Good communication and problem-solving skills.",
    ],
  },

  {
    id: 2,
    company: "Infosys",
    logo: infosysLogo,
    title: "Software Engineer",
    location: "Bangalore, Karnataka",
    type: "Full Time",
    workMode: "On Site",
    salary: "₹5 LPA – ₹9 LPA",
    experience: "0 – 2 Years",
    postedDate: "Recently Posted",
    skills: [
      "Java",
      "Spring Boot",
      "SQL",
      "Git",
    ],

    description:
      "We are looking for an enthusiastic Software Engineer to work with our development team and contribute to the design, development and maintenance of modern software applications.",

    responsibilities: [
      "Develop and maintain software applications.",
      "Write clean and efficient Java code.",
      "Work with databases and backend services.",
      "Collaborate with developers and technical teams.",
      "Participate in testing and debugging.",
      "Follow software development best practices.",
    ],

    requirements: [
      "Good knowledge of Java.",
      "Basic understanding of Spring Boot.",
      "Knowledge of SQL databases.",
      "Understanding of object-oriented programming.",
      "Knowledge of Git is preferred.",
      "Good analytical and problem-solving skills.",
    ],
  },

  {
    id: 3,
    company: "Wipro",
    logo: wiproLogo,
    title: "UI/UX Designer",
    location: "Pune, Maharashtra",
    type: "Full Time",
    workMode: "Hybrid",
    salary: "₹4 LPA – ₹7 LPA",
    experience: "0 – 2 Years",
    postedDate: "Recently Posted",
    skills: [
      "Figma",
      "UI/UX",
      "Wireframing",
      "Prototyping",
    ],

    description:
      "We are looking for a creative UI/UX Designer who can design clean, modern and user-friendly digital experiences for web applications.",

    responsibilities: [
      "Create modern and user-friendly interface designs.",
      "Develop wireframes and prototypes.",
      "Work closely with developers and product teams.",
      "Conduct basic user experience research.",
      "Maintain design consistency across applications.",
      "Create reusable design components.",
    ],

    requirements: [
      "Knowledge of Figma.",
      "Understanding of UI and UX principles.",
      "Knowledge of wireframing and prototyping.",
      "Understanding of responsive design.",
      "Good creativity and attention to detail.",
      "Good communication skills.",
    ],
  },
];

export default jobs;