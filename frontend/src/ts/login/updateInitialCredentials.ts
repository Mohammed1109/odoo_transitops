// src/ts/System/updateInitialCredentials.ts

import axios from "axios";

// ============================================================================
// Types
// ============================================================================

export interface UpdateInitialPasswordPayload {
  username_or_email: string;
  current_password: string;
  new_password: string;
}

export interface UpdateInitialPasswordResponse {
  status: "success" | "error";
  message: string;
}

// ============================================================================
// Update Initial Password
// ============================================================================

export async function updateInitialPassword(
  currentPassword: string,
  newPassword: string,
  usernameOrEmail: string = "admin"
): Promise<UpdateInitialPasswordResponse> {
  const base = globalThis.location.origin;

  const payload: UpdateInitialPasswordPayload = {
    username_or_email: usernameOrEmail,
    current_password: currentPassword,
    new_password: newPassword,
  };

  try {
    const response = await axios.post<UpdateInitialPasswordResponse>(
      `${base}/api/update_initial_password`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(error);

    return {
      status: "error",
      message:
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to update password.",
    };
  }
}