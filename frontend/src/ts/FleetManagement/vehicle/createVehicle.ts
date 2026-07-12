// src/ts/FleetManagement/vehicle/createVehicle.ts

import { authHeaders } from "../../utils/authHeaders";

export interface CreateVehiclePayload {
  registration_number: string;

  vehicle_name: string;
  vehicle_model?: string;
  manufacturer?: string;
  vehicle_type: string;

  maximum_load_capacity: number;
  capacity_unit: string;

  odometer?: number;
  acquisition_cost?: number;
  purchase_date?: string;

  color?: string;

  chassis_number?: string;
  engine_number?: string;
  vin_number?: string;

  fuel_type?: string;
  fuel_tank_capacity?: number;

  gps_tracker_id?: string;
  current_latitude?: number;
  current_longitude?: number;

  insurance_number?: string;
  insurance_expiry?: string;

  registration_expiry?: string;
  permit_expiry?: string;

  status: string;
  is_active: boolean;
}

export interface CreateVehicleResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function createVehicle(
  payload: CreateVehiclePayload
): Promise<CreateVehicleResponse> {
  try {
    const response = await fetch(
      `${globalThis.location.origin}/api/create_new_vehicle`,
      {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.message || "Failed to create vehicle.");
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to create vehicle.",
    };
  }
}