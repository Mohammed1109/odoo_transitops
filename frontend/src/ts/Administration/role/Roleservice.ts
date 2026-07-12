import axios from "axios";
import { toast } from "sonner";
import { authHeaders } from "../../../ts/utils/authHeaders"; // adjust path to wherever you save authHeaders.ts

const BASE_URL = `${globalThis.location.origin}/api/roles`;

export interface RoleResponse {
    id: number;
    name: string;
    description?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface RolePayload {
    name: string;
    description?: string;
    is_active?: boolean; // required for update, ignored on create
}

type ApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Centralized error handler — mirrors the pattern used in submitOrganization.ts
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
 * GET /get_all_roles
 */
export async function fetchRoles(): Promise<ApiResult<RoleResponse[]>> {
    try {
        const response = await axios.get(`${BASE_URL}/get_all_roles`, {
            headers: authHeaders(),
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * GET /get_single_role/{role_id}
 */
export async function fetchRoleById(roleId: number): Promise<ApiResult<RoleResponse>> {
    try {
        const response = await axios.get(`${BASE_URL}/get_single_role/${roleId}`, {
            headers: authHeaders(),
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * POST /create_new_role
 */
export async function createRole(payload: RolePayload): Promise<ApiResult<RoleResponse>> {
    try {
        if (!payload.name.trim()) {
            toast.error("Role name is required", { duration: 4000 });
            return { success: false, error: "Role name is required" };
        }

        const response = await axios.post(
            `${BASE_URL}/create_new_role`,
            {
                name: payload.name,
                description: payload.description ?? "",
            },
            { headers: authHeaders() }
        );

        toast.success("Role created successfully");
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * PUT /update_role/{role_id}
 */
export async function updateRole(
    roleId: number,
    payload: RolePayload
): Promise<ApiResult<RoleResponse>> {
    try {
        if (!payload.name.trim()) {
            toast.error("Role name is required", { duration: 4000 });
            return { success: false, error: "Role name is required" };
        }

        const response = await axios.put(
            `${BASE_URL}/update_role/${roleId}`,
            {
                name: payload.name,
                description: payload.description ?? "",
                is_active: payload.is_active ?? true,
            },
            { headers: authHeaders() }
        );

        toast.success("Role updated successfully");
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * DELETE /delete_role/{role_id}
 */
export async function deleteRole(roleId: number): Promise<ApiResult<{ message: string }>> {
    try {
        const response = await axios.delete(`${BASE_URL}/delete_role/${roleId}`, {
            headers: authHeaders(),
        });
        toast.success("Role deleted successfully");
        return { success: true, data: response.data };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}

/**
 * Convenience: delete multiple roles (used by table's multi-select delete)
 */
export async function deleteRoles(roleIds: (string | number)[]): Promise<ApiResult<null>> {
    try {
        await Promise.all(
            roleIds.map((id) =>
                axios.delete(`${BASE_URL}/delete_role/${id}`, { headers: authHeaders() })
            )
        );
        toast.success(
            roleIds.length > 1 ? "Roles deleted successfully" : "Role deleted successfully"
        );
        return { success: true, data: null };
    } catch (error: any) {
        const { error: msg } = handleApiError(error);
        return { success: false, error: msg };
    }
}