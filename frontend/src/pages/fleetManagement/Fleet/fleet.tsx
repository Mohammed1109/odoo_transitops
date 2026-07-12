import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import ManageColumns from "../../../components/utils/ManageColumns";
import FormLayout from "../../../components/utils/FormLayout";
import { deleteVehicle } from "../../../ts/FleetManagement/vehicle/deleteVehicle";
import { fetchVehicles } from "../../../ts/FleetManagement/vehicle/fetchVehical";
import type { Vehicle } from "../../../ts/FleetManagement/vehicle/fetchVehical";
import { getVehicle } from "../../../ts/FleetManagement/vehicle/getVehicle";
import { submitVehicle } from "../../../ts/FleetManagement/vehicle/createVehicle";

export type VehicleType = "Van" | "Truck" | "Mini";

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";


const VEHICLE_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Van", value: "Van" },
  { label: "Truck", value: "Truck" },
  { label: "Mini", value: "Mini" },
];

const VEHICLE_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Available", value: "Available" },
  { label: "On Trip", value: "On Trip" },
  { label: "In Shop", value: "In Shop" },
  { label: "Retired", value: "Retired" },
];

// Badge styling per status, matched to the reference screenshot's colors.
const STATUS_BADGE_STYLES: Record<VehicleStatus, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  "On Trip": "bg-blue-100 text-blue-700",
  "In Shop": "bg-amber-100 text-amber-700",
  Retired: "bg-rose-100 text-rose-600",
};

const StatusBadge = ({ status }: { status: VehicleStatus }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[status]}`}
  >
    {status}
  </span>
);

const formatCurrency = (value: number) => value.toLocaleString("en-IN");

const formatOdometer = (value: number) => value.toLocaleString("en-IN");

// ==========================================================================
// COMPONENT
// ==========================================================================
interface VehicalFormFieldsProps {
  // ==========================================================
  // VEHICLE INFORMATION
  // ==========================================================
  registrationNumber: string;
  setRegistrationNumber: React.Dispatch<React.SetStateAction<string>>;

  vehicleName: string;
  setVehicleName: React.Dispatch<React.SetStateAction<string>>;

  vehicleModel: string;
  setVehicleModel: React.Dispatch<React.SetStateAction<string>>;

  manufacturer: string;
  setManufacturer: React.Dispatch<React.SetStateAction<string>>;

  vehicleType: string;
  setVehicleType: React.Dispatch<React.SetStateAction<string>>;

  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // CAPACITY
  // ==========================================================
  maximumLoadCapacity: string;
  setMaximumLoadCapacity: React.Dispatch<React.SetStateAction<string>>;

  capacityUnit: string;
  setCapacityUnit: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // VEHICLE DETAILS
  // ==========================================================
  odometer: string;
  setOdometer: React.Dispatch<React.SetStateAction<string>>;

  acquisitionCost: string;
  setAcquisitionCost: React.Dispatch<React.SetStateAction<string>>;

  purchaseDate: string;
  setPurchaseDate: React.Dispatch<React.SetStateAction<string>>;

  chassisNumber: string;
  setChassisNumber: React.Dispatch<React.SetStateAction<string>>;

  engineNumber: string;
  setEngineNumber: React.Dispatch<React.SetStateAction<string>>;

  vinNumber: string;
  setVinNumber: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // FUEL INFORMATION
  // ==========================================================
  fuelType: string;
  setFuelType: React.Dispatch<React.SetStateAction<string>>;

  fuelTankCapacity: string;
  setFuelTankCapacity: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // GPS INFORMATION
  // ==========================================================
  gpsTrackerId: string;
  setGpsTrackerId: React.Dispatch<React.SetStateAction<string>>;

  currentLatitude: string;
  setCurrentLatitude: React.Dispatch<React.SetStateAction<string>>;

  currentLongitude: string;
  setCurrentLongitude: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // DOCUMENT INFORMATION
  // ==========================================================
  insuranceNumber: string;
  setInsuranceNumber: React.Dispatch<React.SetStateAction<string>>;

  insuranceExpiry: string;
  setInsuranceExpiry: React.Dispatch<React.SetStateAction<string>>;

  registrationExpiry: string;
  setRegistrationExpiry: React.Dispatch<React.SetStateAction<string>>;

  permitExpiry: string;
  setPermitExpiry: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // STATUS
  // ==========================================================
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;

  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;

  // ==========================================================
  // FORM STATE
  // ==========================================================
  formLoading: boolean;
}


const VehicalFormFields = ({

  // ==========================================================
  // VEHICLE INFORMATION Layer 1
  // ==========================================================
  registrationNumber,
  setRegistrationNumber,

  vehicleName,
  setVehicleName,

  vehicleModel,
  setVehicleModel,

  manufacturer,
  setManufacturer,

  vehicleType,
  setVehicleType,

  color,
  setColor,

  // ==========================================================
  // CAPACITY layer 2
  // ==========================================================
  maximumLoadCapacity,
  setMaximumLoadCapacity,

  capacityUnit,
  setCapacityUnit,

  odometer,
  setOdometer,

  acquisitionCost,
  setAcquisitionCost,

  purchaseDate,
  setPurchaseDate,

  chassisNumber,
  setChassisNumber,

  engineNumber,
  setEngineNumber,

  vinNumber,
  setVinNumber,

  // ==========================================================
  // FUEL INFORMATION layer 3
  // ==========================================================
  fuelType,
  setFuelType,

  fuelTankCapacity,
  setFuelTankCapacity,

  gpsTrackerId,
  setGpsTrackerId,

  currentLatitude,
  setCurrentLatitude,

  currentLongitude,
  setCurrentLongitude,

  // ==========================================================
  // DOCUMENT INFORMATION layer 4
  // ==========================================================
  insuranceNumber,
  setInsuranceNumber,

  insuranceExpiry,
  setInsuranceExpiry,

  registrationExpiry,
  setRegistrationExpiry,

  permitExpiry,
  setPermitExpiry,

  // ==========================================================
  // STATUS layer 6
  // ==========================================================
  status,
  setStatus,

  isActive,
  setIsActive,

  // ==========================================================
  // FORM STATE
  // ==========================================================
  formLoading,
}: VehicalFormFieldsProps) => {


  return (
    <div className="space-y-6 relative">
      {/* FORM LOADER */}
      {formLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* LAYER 1 : VEHICLE INFORMATION */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-truck text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Vehicle Information
            </h3>

            <p className="text-xs text-gray-500">
              Basic identification and classification details of the vehicle.
            </p>
          </div>
        </div>

        <div className="space-y-6">

          {/* =======================================================
        BASIC INFORMATION
    ======================================================= */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Registration Number */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Registration Number
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. MH12AB1234"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={registrationNumber}
                  onChange={(e) =>
                    setRegistrationNumber(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Vehicle Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Vehicle Name
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter Vehicle Name"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={vehicleName}
                  onChange={(e) =>
                    setVehicleName(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Vehicle Model */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Vehicle Model
                </label>

                <input
                  type="text"
                  placeholder="e.g. Actros 2545"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={vehicleModel}
                  onChange={(e) =>
                    setVehicleModel(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Manufacturer */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Manufacturer
                </label>

                <input
                  type="text"
                  placeholder="e.g. Tata, Volvo, Ashok Leyland"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={manufacturer}
                  onChange={(e) =>
                    setManufacturer(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Vehicle Type
                  <span className="text-red-500"> *</span>
                </label>

                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={vehicleType}
                  onChange={(e) =>
                    setVehicleType(e.target.value)
                  }
                  disabled={formLoading}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Truck">Truck</option>
                  <option value="Trailer">Trailer</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Mini Truck">Mini Truck</option>
                  <option value="Van">Van</option>
                  <option value="Bus">Bus</option>
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Tanker">Tanker</option>
                  <option value="Container">Container</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Vehicle Color
                </label>

                <input
                  type="text"
                  placeholder="e.g. White"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={color}
                  onChange={(e) =>
                    setColor(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

        </div>
      </div>

      {/*  LAYER 2 : CAPACITY & VEHICLE DETAILS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-weight-hanging text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Capacity & Vehicle Details
            </h3>

            <p className="text-xs text-gray-500">
              Configure the vehicle's carrying capacity, identification numbers,
              purchase information, and operational details.
            </p>
          </div>
        </div>

        {/* =======================================================
      LOAD CAPACITY
  ======================================================= */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Load Capacity
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Maximum Load Capacity */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Maximum Load Capacity
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="number"
                placeholder="Enter Capacity"
                className="w-full border rounded-lg p-2 text-sm"
                value={maximumLoadCapacity}
                onChange={(e) =>
                  setMaximumLoadCapacity(e.target.value)
                }
                disabled={formLoading}
              />
            </div>

            {/* Capacity Unit */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Capacity Unit
              </label>

              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={capacityUnit}
                onChange={(e) =>
                  setCapacityUnit(e.target.value)
                }
                disabled={formLoading}
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="ton">Ton</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>

            {/* Odometer */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Odometer Reading
              </label>

              <input
                type="number"
                placeholder="Enter Odometer"
                className="w-full border rounded-lg p-2 text-sm"
                value={odometer}
                onChange={(e) =>
                  setOdometer(e.target.value)
                }
                disabled={formLoading}
              />
            </div>

            {/* Acquisition Cost */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Acquisition Cost
              </label>

              <input
                type="number"
                placeholder="Enter Purchase Cost"
                className="w-full border rounded-lg p-2 text-sm"
                value={acquisitionCost}
                onChange={(e) =>
                  setAcquisitionCost(e.target.value)
                }
                disabled={formLoading}
              />
            </div>

          </div>
        </div>

        {/* =======================================================
      VEHICLE DETAILS
  ======================================================= */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Vehicle Identification
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

            {/* Purchase Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Purchase Date
              </label>

              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm"
                value={purchaseDate}
                onChange={(e) =>
                  setPurchaseDate(e.target.value)
                }
                disabled={formLoading}
              />
            </div>

            {/* Chassis Number */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Chassis Number
              </label>

              <input
                type="text"
                placeholder="Enter Chassis Number"
                className="w-full border rounded-lg p-2 text-sm"
                value={chassisNumber}
                onChange={(e) =>
                  setChassisNumber(e.target.value)
                }
                disabled={formLoading}
              />
            </div>

            {/* Engine Number */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Engine Number
              </label>

              <input
                type="text"
                placeholder="Enter Engine Number"
                className="w-full border rounded-lg p-2 text-sm"
                value={engineNumber}
                onChange={(e) =>
                  setEngineNumber(e.target.value)
                }
                disabled={formLoading}
              />
            </div>

            {/* VIN Number */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                VIN Number
              </label>

              <input
                type="text"
                placeholder="Enter VIN Number"
                className="w-full border rounded-lg p-2 text-sm"
                value={vinNumber}
                onChange={(e) =>
                  setVinNumber(e.target.value)
                }
                disabled={formLoading}
              />
            </div>

          </div>
        </div>

      </div>

      {/* LAYER 3: */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-gas-pump text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Fuel & GPS Information
            </h3>

            <p className="text-xs text-gray-500">
              Configure fuel specifications and GPS tracking information for the
              vehicle.
            </p>
          </div>
        </div>

        <div className="space-y-8">

          {/* =======================================================
        FUEL INFORMATION
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Fuel Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

              {/* Fuel Type */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Fuel Type
                </label>

                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  disabled={formLoading}
                >
                  <option value="">Select Fuel Type</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="CNG">CNG</option>
                  <option value="LPG">LPG</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Hydrogen">Hydrogen</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Fuel Tank Capacity */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Fuel Tank Capacity (Litres)
                </label>

                <input
                  type="number"
                  placeholder="Enter Tank Capacity"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={fuelTankCapacity}
                  onChange={(e) =>
                    setFuelTankCapacity(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

          {/* =======================================================
        GPS INFORMATION
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              GPS Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* GPS Tracker ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  GPS Tracker ID
                </label>

                <input
                  type="text"
                  placeholder="Enter GPS Tracker ID"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={gpsTrackerId}
                  onChange={(e) =>
                    setGpsTrackerId(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Current Latitude */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Current Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 19.0760"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={currentLatitude}
                  onChange={(e) =>
                    setCurrentLatitude(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Current Longitude */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Current Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 72.8777"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={currentLongitude}
                  onChange={(e) =>
                    setCurrentLongitude(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* LAYER 4 : INSURANCE & VEHICLE STATUS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-shield-alt text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Insurance & Status
            </h3>

            <p className="text-xs text-gray-500">
              Configure insurance details, registration validity, permits and the
              current operational status of the vehicle.
            </p>
          </div>
        </div>

        <div className="space-y-8">

          {/* =======================================================
        INSURANCE & DOCUMENTS
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Insurance & Registration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

              {/* Insurance Number */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Insurance Number
                </label>

                <input
                  type="text"
                  placeholder="Enter Insurance Number"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={insuranceNumber}
                  onChange={(e) =>
                    setInsuranceNumber(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Insurance Expiry */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Insurance Expiry
                </label>

                <input
                  type="date"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={insuranceExpiry}
                  onChange={(e) =>
                    setInsuranceExpiry(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Registration Expiry */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Registration Expiry
                </label>

                <input
                  type="date"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={registrationExpiry}
                  onChange={(e) =>
                    setRegistrationExpiry(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

              {/* Permit Expiry */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Permit Expiry
                </label>

                <input
                  type="date"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={permitExpiry}
                  onChange={(e) =>
                    setPermitExpiry(e.target.value)
                  }
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

          {/* =======================================================
        VEHICLE STATUS
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Vehicle Status
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Current Status
                </label>

                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  disabled={formLoading}
                >
                  <option value="">Select Status</option>
                  <option value="Available">Available</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Active */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Vehicle Availability
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">

                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) =>
                      setIsActive(e.target.checked)
                    }
                    disabled={formLoading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      Active Vehicle
                    </span>

                    <p className="text-xs text-gray-500">
                      Disable this if the vehicle is permanently inactive or no
                      longer available for operations.
                    </p>
                  </div>

                </label>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const VehicleRegistry = () => {
  // ---- data state -------------------------------------------------------
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // ---- filter / search state ---------------------------------------------
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ---- table state --------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [tableHeight, setTableHeight] = useState("350px");
  const [, setSelectedRows] = useState<Vehicle[]>([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);

  // ==========================================================
  // VEHICLE INFORMATION
  // ==========================================================
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [color, setColor] = useState("");

  // ==========================================================
  // CAPACITY
  // ==========================================================
  const [maximumLoadCapacity, setMaximumLoadCapacity] = useState("");
  const [capacityUnit, setCapacityUnit] = useState("kg");

  // ==========================================================
  // VEHICLE DETAILS
  // ==========================================================
  const [odometer, setOdometer] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [vinNumber, setVinNumber] = useState("");

  // ==========================================================
  // FUEL INFORMATION
  // ==========================================================
  const [fuelType, setFuelType] = useState("");
  const [fuelTankCapacity, setFuelTankCapacity] = useState("");

  // ==========================================================
  // GPS INFORMATION
  // ==========================================================
  const [gpsTrackerId, setGpsTrackerId] = useState("");
  const [currentLatitude, setCurrentLatitude] = useState("");
  const [currentLongitude, setCurrentLongitude] = useState("");

  // ==========================================================
  // DOCUMENT INFORMATION
  // ==========================================================
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [registrationExpiry, setRegistrationExpiry] = useState("");
  const [permitExpiry, setPermitExpiry] = useState("");

  // ==========================================================
  // STATUS
  // ==========================================================
  const [status, setStatus] = useState("Available");
  const [isActive, setIsActive] = useState(true);
  const [formLoading,] = useState(false);



  const resetForm = () => {
    // Vehicle Information
    setRegistrationNumber("");
    setVehicleName("");
    setVehicleModel("");
    setManufacturer("");
    setVehicleType("");
    setColor("");

    // Capacity
    setMaximumLoadCapacity("");
    setCapacityUnit("kg");

    // Vehicle Details
    setOdometer("");
    setAcquisitionCost("");
    setPurchaseDate("");
    setChassisNumber("");
    setEngineNumber("");
    setVinNumber("");

    // Fuel
    setFuelType("");
    setFuelTankCapacity("");

    // GPS
    setGpsTrackerId("");
    setCurrentLatitude("");
    setCurrentLongitude("");

    // Documents
    setInsuranceNumber("");
    setInsuranceExpiry("");
    setRegistrationExpiry("");
    setPermitExpiry("");

    // Status
    setStatus("Available");
    setIsActive(true);

    // Clear table selection
    setSelectedRows([]);

    // Exit edit mode
    setIsEditMode(false);
    setEditingVehicleId(null);

    // Close form
    setIsFormOpen(false);
  };

  // form state left as a placeholder — wire up a FormLayout + fields the
  // same way StudentFormFields is used in Fleet.tsx once you have the
  // vehicle create/edit form ready.
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);

      const response = await fetchVehicles({
        vehicle_type: typeFilter,
        status: statusFilter,
      });

      if (!response.success) {
        toast.error("Failed to load vehicles.");
        return;
      }

      setVehicles(response.data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load vehicles.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadVehicles();
  }, []);

  // ---- responsive table height, same approach as Fleet.tsx ---------------
  useEffect(() => {
    const calculateHeight = () => {
      const header = 220;
      const pagination = 96;
      const footer = 56;
      const gap = 12;

      const available = window.innerHeight - header - pagination - footer - gap;
      setTableHeight(`${Math.max(available, 300)}px`);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // ==========================================================================
  // TABLE COLUMNS
  // ==========================================================================
  const [columnsConfig, setColumnsConfig] = useState<ColumnWithState[]>([]);

  useEffect(() => {
    setColumnsConfig([
      {
        key: "registration_number",
        header: "Reg. No. (Unique)",
        visible: true,
        locked: true,
        filterable: true,
        align: "left",
        render: (value: string, row: Vehicle) => (
          <button
            type="button"
            className="text-blue-600 hover:underline bg-transparent p-0 text-left"
            onClick={() => handleViewVehicle(row)}
          >
            {value}
          </button>
        ),
      },
      {
        key: "vehicle_name",
        header: "Name / Model",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (_: any, row: Vehicle) =>
          row.vehicle_model
            ? `${row.vehicle_name} (${row.vehicle_model})`
            : row.vehicle_name,
      },
      {
        key: "vehicle_type",
        header: "Type",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "maximum_load_capacity",
        header: "Capacity",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (_: any, row: Vehicle) =>
          `${row.maximum_load_capacity} ${row.capacity_unit}`,
      },
      {
        key: "odometer",
        header: "Odometer",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number | null) =>
          value != null ? formatOdometer(value) : "-",
      },
      {
        key: "acquisition_cost",
        header: "Acq. Cost",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number | null) =>
          value != null ? formatCurrency(value) : "-",
      },
      {
        key: "status",
        header: "Status",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: string) => (
          <StatusBadge status={value as VehicleStatus} />
        ),
      },
    ]);
  }, []);

  const visibleColumns = columnsConfig.filter((column) => column.visible);

  // ==========================================================================
  // FILTERING (type dropdown + status dropdown + reg. no. search)
  // ==========================================================================
  const filteredData = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesType = typeFilter === "All" || vehicle.vehicle_type === typeFilter;
      const matchesStatus =
        statusFilter === "All" || vehicle.status === statusFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [vehicles, typeFilter, statusFilter, searchTerm]);

  // ==========================================================================
  // HANDLERS — placeholders wired for backend hookup
  // ==========================================================================
  const handleViewVehicle = (row: Vehicle) => {
    // TODO: open a vehicle detail view / form in edit mode
    console.log("View vehicle", row);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadVehicles();
    setIsRefreshing(false);
  };

  const handleEditSelected = async (rows: Vehicle[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one vehicle to edit.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await getVehicle(rows[0].id);

      if (!response.success || !response.data) {
        toast.error("Failed to load vehicle details.");
        return;
      }

      const vehicle = response.data;

      setIsEditMode(true);
      setEditingVehicleId(vehicle.id);

      setSelectedRows([rows[0]]);

      // ======================================================
      // Vehicle Information
      // ======================================================
      setRegistrationNumber(vehicle.registration_number ?? "");
      setVehicleName(vehicle.vehicle_name ?? "");
      setVehicleModel(vehicle.vehicle_model ?? "");
      setManufacturer(vehicle.manufacturer ?? "");
      setVehicleType(vehicle.vehicle_type ?? "");
      setColor(vehicle.color ?? "");

      // ======================================================
      // Capacity
      // ======================================================
      setMaximumLoadCapacity(
        vehicle.maximum_load_capacity?.toString() ?? ""
      );
      setCapacityUnit(vehicle.capacity_unit ?? "kg");

      // ======================================================
      // Vehicle Details
      // ======================================================
      setOdometer(vehicle.odometer?.toString() ?? "");
      setAcquisitionCost(
        vehicle.acquisition_cost?.toString() ?? ""
      );

      setPurchaseDate(
        vehicle.purchase_date
          ? vehicle.purchase_date.substring(0, 10)
          : ""
      );

      setChassisNumber(vehicle.chassis_number ?? "");
      setEngineNumber(vehicle.engine_number ?? "");
      setVinNumber(vehicle.vin_number ?? "");

      // ======================================================
      // Fuel
      // ======================================================
      setFuelType(vehicle.fuel_type ?? "");

      setFuelTankCapacity(
        vehicle.fuel_tank_capacity?.toString() ?? ""
      );

      // ======================================================
      // GPS
      // ======================================================
      setGpsTrackerId(vehicle.gps_tracker_id ?? "");

      setCurrentLatitude(
        vehicle.current_latitude?.toString() ?? ""
      );

      setCurrentLongitude(
        vehicle.current_longitude?.toString() ?? ""
      );

      // ======================================================
      // Documents
      // ======================================================
      setInsuranceNumber(vehicle.insurance_number ?? "");

      setInsuranceExpiry(
        vehicle.insurance_expiry
          ? vehicle.insurance_expiry.substring(0, 10)
          : ""
      );

      setRegistrationExpiry(
        vehicle.registration_expiry
          ? vehicle.registration_expiry.substring(0, 10)
          : ""
      );

      setPermitExpiry(
        vehicle.permit_expiry
          ? vehicle.permit_expiry.substring(0, 10)
          : ""
      );

      // ======================================================
      // Status
      // ======================================================
      setStatus(vehicle.status);
      setIsActive(vehicle.is_active);

      // Finally open the form
      setIsFormOpen(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load vehicle.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async (rows: Vehicle[]) => {
    if (!rows.length) {
      toast.warning("Please select vehicle(s) to delete.");
      return;
    }

    try {
      for (const row of rows) {
        const response = await deleteVehicle(row.id);

        if (!response.success) {
          toast.error(response.message);
          return;
        }
      }

      toast.success("Vehicle(s) deleted successfully.");

      await loadVehicles();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete vehicle.");
    }
  };

  const handleFormSubmit = async () => {
    try {
      // ===========================
      // Basic Validation
      // ===========================
      if (!registrationNumber.trim()) {
        toast.error("Registration Number is required.");
        return;
      }

      if (!vehicleName.trim()) {
        toast.error("Vehicle Name is required.");
        return;
      }

      if (!vehicleType.trim()) {
        toast.error("Vehicle Type is required.");
        return;
      }

      if (!maximumLoadCapacity.trim()) {
        toast.error("Maximum Load Capacity is required.");
        return;
      }

      const response = await submitVehicle({
        registration_number: registrationNumber.trim(),

        vehicle_name: vehicleName.trim(),
        vehicle_model: vehicleModel.trim(),
        manufacturer: manufacturer.trim(),
        vehicle_type: vehicleType,

        maximum_load_capacity: Number(maximumLoadCapacity),
        capacity_unit: capacityUnit,

        odometer: odometer ? Number(odometer) : undefined,
        acquisition_cost: acquisitionCost
          ? Number(acquisitionCost)
          : undefined,

        purchase_date: purchaseDate || undefined,

        color: color.trim(),

        chassis_number: chassisNumber.trim(),
        engine_number: engineNumber.trim(),
        vin_number: vinNumber.trim(),

        fuel_type: fuelType.trim(),

        fuel_tank_capacity: fuelTankCapacity
          ? Number(fuelTankCapacity)
          : undefined,

        gps_tracker_id: gpsTrackerId.trim(),

        current_latitude: currentLatitude
          ? Number(currentLatitude)
          : undefined,

        current_longitude: currentLongitude
          ? Number(currentLongitude)
          : undefined,

        insurance_number: insuranceNumber.trim(),

        insurance_expiry: insuranceExpiry || undefined,

        registration_expiry: registrationExpiry || undefined,

        permit_expiry: permitExpiry || undefined,

        status,
        is_active: isActive,

        editMode: isEditMode,
        vehicleId: editingVehicleId,
      });

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);

      // Refresh table
      await loadVehicles();

      // Reset form
      resetForm();

      // Close dialog
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create vehicle.");
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden bg-gray-100">
      {/* Filter / Search / Add Vehicle Bar */}
      <div className="flex justify-between items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <div className="w-40">
            <CustomDropdown
              label=""
              value={typeFilter}
              placeholder="Type: All"
              options={VEHICLE_TYPE_OPTIONS}
              onChange={(value) => {
                setTypeFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="w-44">
            <CustomDropdown
              label=""
              value={statusFilter}
              placeholder="Status: All"
              options={VEHICLE_STATUS_OPTIONS}
              onChange={(value) => {
                setStatusFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Reg. No. Search */}
          <div className="w-64">
            <SearchBar
              value={inputValue}
              loading={isLoading}
              placeholder="Search reg. no..."
              onChange={(val) => {
                setInputValue(val);
                if (val.trim() === "") {
                  setSearchTerm("");
                  setCurrentPage(1);
                }
              }}
              onSearch={(val) => {
                setSearchTerm(val.trim());
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* Add Vehical */}
          <button
            onClick={() => {
              resetForm();
              setIsEditMode(false);
              setEditingVehicleId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 p-2 bg-white border rounded-xl hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>

          <RefreshButton loading={isRefreshing} onClick={handleRefresh} />

          {/* Manage Columns */}
          <button
            className="p-2 bg-white border rounded-lg hover:bg-gray-100"
            onClick={() => setIsManageOpen(true)}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Table */}
      <ReusableTable
        loading={isLoading}
        tableId="VehicleRegistry-Table"
        columns={visibleColumns}
        data={filteredData}
        striped
        hoverEffect
        showSelection
        emptyMessage="No vehicles found"
        maxHeight={tableHeight}
        pagination={true}
        currentPage={currentPage}
        totalItems={filteredData.length}
        totalPages={Math.ceil(filteredData.length / itemsPerPage) || 1}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
        onEditSelected={(ids: (string | number)[]) => {
          const rows = filteredData.filter((row) =>
            ids.map(Number).includes(row.id)
          );
          handleEditSelected(rows);
        }}
        onDeleteSelected={(ids: (string | number)[]) => {
          const rows = filteredData.filter((row) =>
            ids.map(Number).includes(row.id)
          );
          handleDeleteSelected(rows);
        }}
      />


      {isFormOpen && (
        <FormLayout
          title="Add Vehicle"
          onClose={() => {
            resetForm();
            setSelectedRows([]);
            setIsFormOpen(false);
          }}
          onSubmit={handleFormSubmit}
        >
          <VehicalFormFields
            // ==========================================================
            // VEHICLE INFORMATION
            // ==========================================================
            registrationNumber={registrationNumber}
            setRegistrationNumber={setRegistrationNumber}

            vehicleName={vehicleName}
            setVehicleName={setVehicleName}

            vehicleModel={vehicleModel}
            setVehicleModel={setVehicleModel}

            manufacturer={manufacturer}
            setManufacturer={setManufacturer}

            vehicleType={vehicleType}
            setVehicleType={setVehicleType}

            color={color}
            setColor={setColor}

            // ==========================================================
            // CAPACITY
            // ==========================================================
            maximumLoadCapacity={maximumLoadCapacity}
            setMaximumLoadCapacity={setMaximumLoadCapacity}

            capacityUnit={capacityUnit}
            setCapacityUnit={setCapacityUnit}

            // ==========================================================
            // VEHICLE DETAILS
            // ==========================================================
            odometer={odometer}
            setOdometer={setOdometer}

            acquisitionCost={acquisitionCost}
            setAcquisitionCost={setAcquisitionCost}

            purchaseDate={purchaseDate}
            setPurchaseDate={setPurchaseDate}

            chassisNumber={chassisNumber}
            setChassisNumber={setChassisNumber}

            engineNumber={engineNumber}
            setEngineNumber={setEngineNumber}

            vinNumber={vinNumber}
            setVinNumber={setVinNumber}

            // ==========================================================
            // FUEL INFORMATION
            // ==========================================================
            fuelType={fuelType}
            setFuelType={setFuelType}

            fuelTankCapacity={fuelTankCapacity}
            setFuelTankCapacity={setFuelTankCapacity}

            // ==========================================================
            // GPS INFORMATION
            // ==========================================================
            gpsTrackerId={gpsTrackerId}
            setGpsTrackerId={setGpsTrackerId}

            currentLatitude={currentLatitude}
            setCurrentLatitude={setCurrentLatitude}

            currentLongitude={currentLongitude}
            setCurrentLongitude={setCurrentLongitude}

            // ==========================================================
            // DOCUMENT INFORMATION
            // ==========================================================
            insuranceNumber={insuranceNumber}
            setInsuranceNumber={setInsuranceNumber}

            insuranceExpiry={insuranceExpiry}
            setInsuranceExpiry={setInsuranceExpiry}

            registrationExpiry={registrationExpiry}
            setRegistrationExpiry={setRegistrationExpiry}

            permitExpiry={permitExpiry}
            setPermitExpiry={setPermitExpiry}

            // ==========================================================
            // STATUS
            // ==========================================================
            status={status}
            setStatus={setStatus}

            isActive={isActive}
            setIsActive={setIsActive}

            // ==========================================================
            // FORM STATE
            // ==========================================================
            formLoading={formLoading}
          />
        </FormLayout>
      )}

      {/* Manage Columns */}
      <ManageColumns
        open={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        columns={columnsConfig}
        onSave={(updated) => {
          setColumnsConfig(updated);
          setIsManageOpen(false);
        }}
      />

    </div>
  );
};

export default VehicleRegistry;