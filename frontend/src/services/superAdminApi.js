import API_BASE_URL from "./api";

const SUPER_ADMIN_TOKEN_KEY = "jobhubSuperAdminToken";
const SUPER_ADMIN_USER_KEY = "jobhubSuperAdmin";

export const getSuperAdminToken = () =>
  localStorage.getItem(SUPER_ADMIN_TOKEN_KEY) || "";

export const getStoredSuperAdmin = () => {
  try {
    return JSON.parse(
      localStorage.getItem(SUPER_ADMIN_USER_KEY) || "null",
    );
  } catch {
    return null;
  }
};

export const saveSuperAdminSession = (token, superAdmin) => {
  localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, token);
  localStorage.setItem(
    SUPER_ADMIN_USER_KEY,
    JSON.stringify(superAdmin),
  );
};

export const clearSuperAdminSession = () => {
  localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY);
  localStorage.removeItem(SUPER_ADMIN_USER_KEY);
};

export const superAdminFetch = async (path, options = {}) => {
  const token = getSuperAdminToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    },
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    clearSuperAdminSession();
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to complete the request",
    );
  }

  return data;
};

export { SUPER_ADMIN_TOKEN_KEY, SUPER_ADMIN_USER_KEY };
