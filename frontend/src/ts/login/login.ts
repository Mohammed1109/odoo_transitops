import axios from "axios";

// ---- RBAC roles -----------------------------------------------------------

export type Role =
  | "Fleet Manager"
  | "Dispatcher"
  | "Safety Officer"
  | "Financial Analyst";

export const ROLES: Role[] = [
  "Dispatcher",
  "Fleet Manager",
  "Safety Officer",
  "Financial Analyst",
];

// Where each role lands after a successful login, and what it can see.
// Keep this in sync with the backend's route guards.
export const ROLE_HOME: Record<Role, string> = {
  "Fleet Manager": "/fleet",
  Dispatcher: "/dashboard",
  "Safety Officer": "/drivers",
  "Financial Analyst": "/analytics",
};

export const ROLE_SCOPE: Record<Role, string> = {
  "Fleet Manager": "Fleet, Maintenance",
  Dispatcher: "Dashboard, Trips",
  "Safety Officer": "Drivers, Compliance",
  "Financial Analyst": "Fuel & Expenses, Analytics",
};

// ---- API --------------------------------------------------------------

export interface LoginPayload {
  email: string;
  password: string;
  role: Role;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  role?: Role;
  isFirstLogin?: boolean;
  message?: string;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const res = await axios.post<LoginResponse>("/api/auth/login", payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    // Normalize backend error shape so the UI has one thing to check.
    const message =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Invalid credentials";
    return { success: false, message };
  }
}

export interface ForgotPasswordPayload {
  email: string;
}

export async function requestPasswordReset(
  payload: ForgotPasswordPayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await axios.post("/api/auth/forgot-password", payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.detail || "Could not send reset email",
    };
  }
}