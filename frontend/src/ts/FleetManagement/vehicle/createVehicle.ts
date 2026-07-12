// src/ts/FleetManagement/vehicle/submitVehicle.ts

import axios from "axios";
import { toast } from "sonner";
import { authHeaders } from "../../utils/authHeaders";

export interface VehiclePayload {
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

  // For Edit
  editMode?: boolean;
  vehicleId?: number | null;
}

export async function submitVehicle(
  form: VehiclePayload
) {
  try {
    const {
      editMode = false,
      vehicleId,

      ...payload
    } = form;

    // ==========================================================
    // Validation
    // ==========================================================

    if (!payload.registration_number.trim()) {
      throw new Error("Registration Number is required.");
    }

    if (!payload.vehicle_name.trim()) {
      throw new Error("Vehicle Name is required.");
    }

    if (!payload.vehicle_type.trim()) {
      throw new Error("Vehicle Type is required.");
    }

    if (
      payload.maximum_load_capacity === undefined ||
      payload.maximum_load_capacity <= 0
    ) {
      throw new Error(
        "Maximum Load Capacity is required."
      );
    }

    // ==========================================================
    // URL & METHOD
    // ==========================================================

    const url = editMode
      ? `${globalThis.location.origin}/api/edit_vehicle/${vehicleId}`
      : `${globalThis.location.origin}/api/create_new_vehicle`;

    const method = editMode ? "put" : "post";

    // ==========================================================
    // API
    // ==========================================================

    const response = await axios({
      url,
      method,
      data: payload,
      withCredentials: true,
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error: any) {
    let message =
      "Something went wrong. Please try again.";

    if (error.response) {
      message =
        error.response.data?.message ||
        error.response.data?.detail ||
        message;

      if (Array.isArray(error.response.data?.detail)) {
        message = error.response.data.detail
          .map((x: any) => x.msg)
          .join("\n");
      }
    } else if (error.message) {
      message = error.message;
    }

    toast.error(message, {
      description: "Please review the entered details.",
      duration: 4000,
    });

    return {
      success: false,
      message,
    };
  }
}