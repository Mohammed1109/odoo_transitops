// src/ts/FleetManagement/vehicle/getVehicles.ts

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

export interface GetVehiclesResponse {
  success: boolean;
  data: Vehicle[];
}

export interface GetVehiclesParams {
  vehicle_type?: string;
  status?: string;
}

export async function fetchVehicles(
  params: GetVehiclesParams = {}
): Promise<GetVehiclesResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (
      params.vehicle_type &&
      params.vehicle_type !== "All"
    ) {
      searchParams.append(
        "vehicle_type",
        params.vehicle_type
      );
    }

    if (
      params.status &&
      params.status !== "All"
    ) {
      searchParams.append(
        "status",
        params.status
      );
    }

    const response = await fetch(
      `${globalThis.location.origin}/api/list_vehicles?${searchParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: authHeaders(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.detail ||
          result.message ||
          "Failed to load vehicles."
      );
    }

    return result;
  } catch (error: any) {
    console.error("Failed to load vehicles:", error);

    return {
      success: false,
      data: [],
    };
  }
}