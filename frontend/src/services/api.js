const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API_BASE_URL = configuredApiUrl.replace(/\/$/, "");

export default API_BASE_URL;
