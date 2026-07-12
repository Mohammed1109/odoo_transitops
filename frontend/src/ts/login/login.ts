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
  usernameOrEmail: string,
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
          username_or_email: usernameOrEmail,
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
        message: "Server returned HTML instead of JSON.",
      };
    }

    const data = JSON.parse(text);

    if (response.ok) {
      const loginData = data as LoginResponse;

      resetSession();

      // Save JWT Token
      localStorage.setItem(
        "access_token",
        loginData.access_token
      );

      // Save Logged-in User
      localStorage.setItem(
        "user",
        JSON.stringify({
          full_name: loginData.full_name,
          username: loginData.username,
          email: loginData.email,
          role: loginData.role,
          is_first_login: loginData.is_first_login,
        })
      );

      return {
        success: true,
        data: loginData,
      };
    }

    return {
      success: false,
      message:
        data.detail ||
        "Invalid username/email or password.",
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

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function getCurrentUser(): Omit<LoginResponse, "access_token" | "token_type"> | null {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("access_token");
}