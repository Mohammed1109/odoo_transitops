// src/ts/FleetManagement/vehicle/deleteVehicle.ts

import { authHeaders } from "../../utils/authHeaders";

export interface DeleteVehicleResponse {
    success: boolean;
    message: string;
}

export async function deleteVehicle(
    vehicleId: number
): Promise<DeleteVehicleResponse> {
    try {
        const response = await fetch(
            `${globalThis.location.origin}/api/remove_vehicle/${vehicleId}`,
            {
                method: "DELETE",
                credentials: "include",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail ||
                result.message ||
                "Failed to delete vehicle."
            );
        }

        return result;
    } catch (error: any) {
        return {
            success: false,
            message:
                error?.message || "Failed to delete vehicle.",
        };
    }
}