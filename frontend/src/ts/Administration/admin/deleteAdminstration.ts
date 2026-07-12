// src/ts/Configuration/Administration/DeleteAdministrators.ts

import axios from "axios";
const Swal = (await import("sweetalert2")).default;
import { toast } from "sonner";

/**
 * Bulk delete local administrators.
 *
 * Backend endpoint:
 * DELETE /api/delete_local_admins
 *
 * Payload:
 * {
 *   ids: [1, 2, 3]
 * }
 */
export async function deleteAdministrators(
  ids: number[],
  setTableData: (cb: (prev: any[]) => any[]) => void
): Promise<boolean> {
  // ------------------------------------------------------------
  // 1. Validate selection
  // ------------------------------------------------------------
  if (!ids || ids.length === 0) {
    toast.warning("No Selection", {
      description: "Please select at least one administrator.",
    });
    return false;
  }

  // ------------------------------------------------------------
  // 2. Prevent deleting protected admin (ID = 1)
  // ------------------------------------------------------------
  if (ids.includes(1)) {
    toast.warning("Protected Administrator", {
      description:
        "You cannot delete the User With Principal Role.",
    });
    return false;
  }

  // ------------------------------------------------------------
  // 3. Confirmation dialog
  // ------------------------------------------------------------
  const result = await Swal.fire({
    title: `Delete ${ids.length} administrator(s)?`,
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  if (!result.isConfirmed) {
    return false;
  }

  try {
    // ----------------------------------------------------------
    // 4. Call backend
    // ----------------------------------------------------------
    const response = await axios.delete(
      `${globalThis.location.origin}/api/delete_local_admins`,
      {
        data: {
          ids,
        },
      }
    );

    const data = response.data;

    // ----------------------------------------------------------
    // 5. Success notification
    // ----------------------------------------------------------
    toast.success("Deleted Successfully", {
      description:
        data.message ||
        `${ids.length} administrator(s) deleted successfully.`,
      duration: 2000,
    });

    // ----------------------------------------------------------
    // 6. Remove deleted rows from table
    // ----------------------------------------------------------
    setTableData((prev) =>
      prev.filter((row) => !ids.includes(Number(row.id)))
    );

    return true;
  } catch (error: any) {
    // ----------------------------------------------------------
    // 7. Error handling
    // ----------------------------------------------------------
    const status = error.response?.status;

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong while deleting administrators.";

    // Show SweetAlert for backend validation errors
    await Swal.fire({
      icon: status === 400 || status === 404 ? "warning" : "error",
      title:
        status === 400 || status === 404
          ? "Unable to Delete"
          : "Delete Failed",
      text: message,
      confirmButtonColor: "#d33",
    });

    return false;
  }
}