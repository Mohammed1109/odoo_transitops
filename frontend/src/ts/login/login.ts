// ============================================================================
// Login Service
// ============================================================================

const SESSION_MARKER_KEY = "TransitOpsSession";

// ============================================================================
// Types
// ============================================================================

export interface LoginResponse {
  access_token: string;
  token_type: string;

  full_name: string;
  username: string;
  email: string;

  role: string;

  is_first_login: boolean;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  data?: LoginResponse;
}

// ============================================================================
// Reset Session
// ============================================================================

export function resetSession() {
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith("tableFilters_"))
    .forEach((key) => sessionStorage.removeItem(key));

  sessionStorage.setItem(
    SESSION_MARKER_KEY,
    Date.now().toString()
  );
}

// ============================================================================
// Prevent Browser Back Cache Issues
// ============================================================================

export function enableBFCacheProtection() {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}

// ============================================================================
// Login
// ============================================================================

export async function authenticateUserReact(
  username: string,
  password: string
): Promise<LoginResult> {
  try {
    const response = await fetch(
      `${globalThis.location.origin}/api/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const text = await response.text();

    // Backend returned HTML instead of JSON
    if (text.startsWith("<")) {
      console.error(text);

      return {
        success: false,
        message:
          "Server returned HTML instead of JSON.",
      };
    }

    const data = JSON.parse(text);

    if (response.ok) {
      resetSession();

      // Save JWT
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Save current user
      localStorage.setItem(
        "user",
        JSON.stringify({
          full_name: data.full_name,
          username: data.username,
          email: data.email,
          role: data.role,
          is_first_login: data.is_first_login,
        })
      );

      return {
        success: true,
        data,
      };
    }

    return {
      success: false,
      message: data.detail || "Invalid username or password.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Unable to connect to server.",
    };
  }
}

// ============================================================================
// Logout
// ============================================================================

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");

  sessionStorage.clear();

  window.location.href = "/";
}

// ============================================================================
// Helpers
// ============================================================================

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");

  if (!user) return null;

  return JSON.parse(user);
}

export function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}