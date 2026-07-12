import axios from "axios";
const Swal = (await import("sweetalert2")).default;
import { toast } from "sonner";

const BASE = globalThis.location.origin;

/**
 * Bulk delete role-permission assignments
 * @param userId ID of user whose assignments we delete
 * @param assignmentIds array of assignment IDs
 * @returns success + message
 */
export async function deleteRoleAssignments(
    userId: number,
    assignmentIds: number[]
) {
    if (!userId) {
        return { success: false, message: "Missing user ID." };
    }

    if (!assignmentIds.length) {
        return { success: false, message: "No assignments selected." };
    }

    // Confirm delete
    const confirmRes = await Swal.fire({
        title: `Delete ${assignmentIds.length} assignment(s)?`,
        text: "All selected assignments will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete them!",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
    });

    if (!confirmRes.isConfirmed) {
        return { success: false, message: "Cancelled" };
    }

    try {
        const response = await axios.delete(`${BASE}/api/delete_assignments/${userId}`, {
            data: { assignment_ids: assignmentIds },
        });

        const data = response.data;

        if (data.success) {
            toast.success(`${assignmentIds.length} assignment(s) deleted successfully.`, {
                duration: 2000,
            });

            return { success: true, deleted: assignmentIds };
        }

        toast.warning("Permission Denied!", {
            description: data.message || "You do not have permission.",
            duration: 2000,
        });


        return { success: false, message: data.message };
    } catch (err: any) {
        console.error( err);

        await Swal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.message || "Something went wrong.",
        });

        return { success: false, message: "Failed to delete." };
    }
}
