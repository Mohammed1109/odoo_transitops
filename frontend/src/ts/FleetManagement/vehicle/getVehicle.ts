// src/ts/FleetManagement/vehicle/getVehicle.ts

import { authHeaders } from "../../utils/authHeaders";

export interface Vehicle {
  id: number;

  registration_number: string;

  vehicle_name: string;
  vehicle_model: string | null;
  manufacturer: string | null;
  vehicle_type: string;

  maximum_load_capacity: number;
  capacity_unit: string;

  odometer: number | null;
  acquisition_cost: number | null;
  purchase_date: string | null;

  color: string | null;

  chassis_number: string | null;
  engine_number: string | null;
  vin_number: string | null;

  fuel_type: string | null;
  fuel_tank_capacity: number | null;

  gps_tracker_id: string | null;
  current_latitude: number | null;
  current_longitude: number | null;

  insurance_number: string | null;
  insurance_expiry: string | null;

  registration_expiry: string | null;
  permit_expiry: string | null;

  status: string;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface GetVehicleResponse {
  success: boolean;
  data: Vehicle | null;
}

export async function getVehicle(
  vehicleId: number
): Promise<GetVehicleResponse> {
  try {
    const response = await fetch(
      `${globalThis.location.origin}/api/vehicle_details/${vehicleId}`,
      {
        method: "GET",
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
          "Failed to fetch vehicle details."
      );
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      data: null,
    };
  }
}