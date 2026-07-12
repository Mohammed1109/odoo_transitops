import { fetchAssignmentById } from "./getRoleAdministration";
import axios from "axios";

/**
 * Handles loading assignment data + populating React state for edit modal
 */
export async function loadRoleAssignmentForEdit(
  assignmentId: number,
  selectedUserId: number,
  setIsRoleFormOpen: (v: boolean) => void,
  setSelectedRoleUser: (v: any) => void,
  setRole: (v: string) => void,
  setPermission: (v: string) => void,
) {
  // OPEN FORM
  setIsRoleFormOpen(true);
  setSelectedRoleUser({ id: selectedUserId });

  // FETCH assignment from backend
  const data = await fetchAssignmentById(assignmentId);
  if (!data) return;

  //  Basic state
  setRole(data.role || "");
  setPermission(data.permission || "");

}

/**
 * PUT update assignment
 */
export async function updateRoleAssignment(assignmentId: number, payload: any) {
  try {
    const res = await axios.put(
      `${window.location.origin}/api/update_assignment/${assignmentId}`,
      payload,
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}
