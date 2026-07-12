// ts/services/users.ts
import axios from "axios";
import { toast } from "sonner";
import { authHeaders } from "../../../ts/utils/authHeaders"; // adjust path to wherever you save authHeaders.ts

const BASE_URL = `${globalThis.location.origin}/api/users`;

export interface UserResponse {
    id: number;
    full_name: string;
    username: string;
    email: string;
    phone?: string | null;
    role_id: number;
    is_active: boolean;
    is_first_login: boolean;
    showupdated: string;
    last_login?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface UserCreatePayload {
    full_name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    role_id: number;
    is_active?: boolean;
}

export interface UserUpdatePayload {
    full_name?: string;
    username?: string;
    email?: string;
    password?: string;
    phone?: string;
    role_id?: number;
    is_active?: boolean;
}

type ApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Centralized error handler — mirrors the pattern used in Roleservice.ts
 */
function handleApiError(error: any): { error: string } {
    let msg = "Something went wrong. Please try again.";
    let isWarning = false;

    if (error.response) {
        msg = error.response.data?.error || error.response.data?.detail || error.response.data?.message || msg;

        if (error.response.status === 403) {
            isWarning = true;
        }
    } else if (error.message) {
        msg = error.message;
    }

    if (isWarning) {
        toast.warning(msg, {
            description: "Please review and try again",
            duration: 4000,
        });
    } else {
        toast.error(msg, {
            description: "An unexpected error occurred",
            duration: 4000,
        });
    }

    return { error: msg };
}

/**
 * GET /get_all_users
 */
export async function fetchUsers(): Promise<ApiResult<UserResponse[]>> {
    try {
        const response = await axios.get(`${BASE_URL}/get_all_users`, {
            headers: authHeaders(),
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * GET /get_single_user/{user_id}
 */
export async function fetchUserById(userId: number): Promise<ApiResult<UserResponse>> {
    try {
        const response = await axios.get(`${BASE_URL}/get_single_user/${userId}`, {
            headers: authHeaders(),
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * POST /create_new_user
 */
export async function createUser(payload: UserCreatePayload): Promise<ApiResult<UserResponse>> {
    try {
        if (!payload.full_name?.trim()) {
            toast.error("Full name is required", { duration: 4000 });
            return { success: false, error: "Full name is required" };
        }

        if (!payload.username?.trim()) {
            toast.error("Username is required", { duration: 4000 });
            return { success: false, error: "Username is required" };
        }

        if (!payload.role_id) {
            toast.error("Role is required", { duration: 4000 });
            return { success: false, error: "Role is required" };
        }

        const response = await axios.post(
            `${BASE_URL}/create_new_user`,
            payload,
            { headers: authHeaders() }
        );

        toast.success("User created successfully");
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * PUT /update_user/{user_id}
 */
export async function updateUser(
    userId: number,
    payload: UserUpdatePayload
): Promise<ApiResult<UserResponse>> {
    try {
        const response = await axios.put(
            `${BASE_URL}/update_user/${userId}`,
            payload,
            { headers: authHeaders() }
        );

        toast.success("User updated successfully");
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * DELETE /delete_user/{user_id}
 */
export async function deleteUser(userId: number): Promise<ApiResult<{ message: string }>> {
    try {
        const response = await axios.delete(`${BASE_URL}/delete_user/${userId}`, {
            headers: authHeaders(),
        });
        toast.success("User deleted successfully");
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * Convenience: delete multiple users (used by table's multi-select delete)
 * NOTE: the backend only exposes a single-delete endpoint
 * (DELETE /delete_user/{user_id}), so this fires one request per id,
 * same approach as deleteRoles() in Roleservice.ts.
 */
export async function deleteUsers(userIds: (string | number)[]): Promise<ApiResult<null>> {
    try {
        await Promise.all(
            userIds.map((id) =>
                axios.delete(`${BASE_URL}/delete_user/${id}`, { headers: authHeaders() })
            )
        );
        toast.success(
            userIds.length > 1 ? "Users deleted successfully" : "User deleted successfully"
        );
        return { success: true, data: null };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}