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
import { fetchVehicles } from "../../../ts/FleetManagement/vehicle/fetchVehical";
import type { Vehicle } from "../../../ts/FleetManagement/vehicle/fetchVehical";

// ==========================================================================
// TYPES — mirrors the `maintenances` table (models/maintenance.py)
// ==========================================================================

export type MaintenancePriority = "Low" | "Normal" | "High" | "Critical";

export type MaintenanceStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface Maintenance {
  id: number;

  // Primary Key
  maintenance_number: string;

  // Vehicle
  vehicle_id: number;
  vehicle_registration_number?: string; // joined display field, not on the model

  // Service Details
  service_type: string;
  description?: string;
  service_center?: string;
  vendor_name?: string;
  vendor_contact?: string;
  invoice_number?: string;
  invoice_path?: string;

  // Vehicle Reading
  current_odometer?: number;
  next_service_odometer?: number;
  service_completed_odometer?: number;

  // Cost
  labour_cost?: number;
  parts_cost?: number;
  other_cost?: number;
  total_cost?: number;

  // Dates
  service_date: string;
  expected_completion_date?: string;
  completion_date?: string;

  // Priority / Status
  priority: MaintenancePriority;
  status: MaintenanceStatus;

  // Remarks
  remarks?: string;
  created_by?: string;

  // System
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ==========================================================================
// MOCK DATA — replace with a real fetchMaintenance() call once the backend
// endpoint / ts service module is ready (see fetchVehicles for the pattern).
// ==========================================================================

const MOCK_MAINTENANCE: Maintenance[] = [
  {
    id: 1,
    maintenance_number: "MTN-2001",
    vehicle_id: 1,
    vehicle_registration_number: "KA01AB1234",
    service_type: "Oil Change",
    description: "Routine engine oil and filter change",
    service_center: "City Auto Care",
    vendor_name: "City Auto Care Pvt Ltd",
    vendor_contact: "9876543210",
    invoice_number: "INV-1001",
    current_odometer: 45210,
    next_service_odometer: 50210,
    service_completed_odometer: 45210,
    labour_cost: 500,
    parts_cost: 1200,
    other_cost: 0,
    total_cost: 1700,
    service_date: "2025-05-10",
    expected_completion_date: "2025-05-10",
    completion_date: "2025-05-10",
    priority: "Normal",
    status: "In Progress",
    remarks: "",
    created_by: "admin",
    is_active: true,
  },
  {
    id: 2,
    maintenance_number: "MTN-2002",
    vehicle_id: 2,
    vehicle_registration_number: "KA02CD5678",
    service_type: "Tyre Replacement",
    description: "Replaced all 4 tyres",
    service_center: "Speed Tyres",
    vendor_name: "Speed Tyres & Alignment",
    vendor_contact: "9876501234",
    invoice_number: "INV-1002",
    current_odometer: 62000,
    next_service_odometer: 82000,
    service_completed_odometer: 62000,
    labour_cost: 800,
    parts_cost: 18000,
    other_cost: 200,
    total_cost: 19000,
    service_date: "2025-05-05",
    expected_completion_date: "2025-05-05",
    completion_date: "2025-05-05",
    priority: "High",
    status: "Completed",
    remarks: "Front alignment done as well",
    created_by: "admin",
    is_active: true,
  },
  {
    id: 3,
    maintenance_number: "MTN-2003",
    vehicle_id: 3,
    vehicle_registration_number: "KA03EF9012",
    service_type: "Brake Inspection",
    description: "Brake pad wear check",
    service_center: "City Auto Care",
    vendor_name: "City Auto Care Pvt Ltd",
    vendor_contact: "9876543210",
    invoice_number: "INV-1003",
    current_odometer: 38000,
    next_service_odometer: 48000,
    service_completed_odometer: 38000,
    labour_cost: 300,
    parts_cost: 0,
    other_cost: 0,
    total_cost: 300,
    service_date: "2025-04-20",
    expected_completion_date: "2025-04-20",
    completion_date: "2025-04-20",
    priority: "Low",
    status: "Completed",
    remarks: "Pads at 60%, revisit in 3 months",
    created_by: "admin",
    is_active: true,
  },
  {
    id: 4,
    maintenance_number: "MTN-2004",
    vehicle_id: 4,
    vehicle_registration_number: "KA04GH3456",
    service_type: "Engine Service",
    description: "Full engine overhaul checkup",
    service_center: "Precision Motors",
    vendor_name: "Precision Motors Garage",
    vendor_contact: "9998887771",
    invoice_number: "",
    current_odometer: 95000,
    next_service_odometer: 105000,
    service_completed_odometer: 0,
    labour_cost: 0,
    parts_cost: 0,
    other_cost: 0,
    total_cost: 0,
    service_date: "2025-05-18",
    expected_completion_date: "2025-05-20",
    completion_date: "",
    priority: "Critical",
    status: "Pending",
    remarks: "",
    created_by: "admin",
    is_active: true,
  },
];

// ==========================================================================
// FILTER OPTIONS
// ==========================================================================

const PRIORITY_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Low", value: "Low" },
  { label: "Normal", value: "Normal" },
  { label: "High", value: "High" },
  { label: "Critical", value: "Critical" },
];

const MAINTENANCE_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

const STATUS_BADGE_STYLES: Record<MaintenanceStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-pink-100 text-pink-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-rose-100 text-rose-600",
};

const PRIORITY_BADGE_STYLES: Record<MaintenancePriority, string> = {
  Low: "bg-slate-100 text-slate-700",
  Normal: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }: { status: MaintenanceStatus }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_STYLES[status]}`}
  >
    {status}
  </span>
);

const PriorityBadge = ({ priority }: { priority: MaintenancePriority }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_BADGE_STYLES[priority]}`}
  >
    {priority}
  </span>
);

const formatCurrency = (value: number) => value.toLocaleString("en-IN");
const formatOdometer = (value: number) => value.toLocaleString("en-IN");

// ==========================================================================
// MAINTENANCE FORM FIELDS
// ==========================================================================

interface MaintenanceFormFieldsProps {
  // Service Details
  maintenanceNumber: string;
  setMaintenanceNumber: React.Dispatch<React.SetStateAction<string>>;

  vehicleId: string;
  setVehicleId: React.Dispatch<React.SetStateAction<string>>;

  serviceType: string;
  setServiceType: React.Dispatch<React.SetStateAction<string>>;

  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;

  serviceCenter: string;
  setServiceCenter: React.Dispatch<React.SetStateAction<string>>;

  vendorName: string;
  setVendorName: React.Dispatch<React.SetStateAction<string>>;

  vendorContact: string;
  setVendorContact: React.Dispatch<React.SetStateAction<string>>;

  invoiceNumber: string;
  setInvoiceNumber: React.Dispatch<React.SetStateAction<string>>;

  // Vehicle Reading
  currentOdometer: string;
  setCurrentOdometer: React.Dispatch<React.SetStateAction<string>>;

  nextServiceOdometer: string;
  setNextServiceOdometer: React.Dispatch<React.SetStateAction<string>>;

  serviceCompletedOdometer: string;
  setServiceCompletedOdometer: React.Dispatch<React.SetStateAction<string>>;

  // Cost
  labourCost: string;
  setLabourCost: React.Dispatch<React.SetStateAction<string>>;

  partsCost: string;
  setPartsCost: React.Dispatch<React.SetStateAction<string>>;

  otherCost: string;
  setOtherCost: React.Dispatch<React.SetStateAction<string>>;

  totalCost: number;

  // Dates
  serviceDate: string;
  setServiceDate: React.Dispatch<React.SetStateAction<string>>;

  expectedCompletionDate: string;
  setExpectedCompletionDate: React.Dispatch<React.SetStateAction<string>>;

  completionDate: string;
  setCompletionDate: React.Dispatch<React.SetStateAction<string>>;

  // Priority / Status
  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;

  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;

  // Remarks
  remarks: string;
  setRemarks: React.Dispatch<React.SetStateAction<string>>;

  createdBy: string;
  setCreatedBy: React.Dispatch<React.SetStateAction<string>>;

  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;

  // Vehicle options for the dropdown
  vehicleOptions: { label: string; value: string }[];

  formLoading: boolean;
}

const MaintenanceFormFields = ({
  maintenanceNumber,
  setMaintenanceNumber,

  vehicleId,
  setVehicleId,

  serviceType,
  setServiceType,

  description,
  setDescription,

  serviceCenter,
  setServiceCenter,

  vendorName,
  setVendorName,

  vendorContact,
  setVendorContact,

  invoiceNumber,
  setInvoiceNumber,

  currentOdometer,
  setCurrentOdometer,

  nextServiceOdometer,
  setNextServiceOdometer,

  serviceCompletedOdometer,
  setServiceCompletedOdometer,

  labourCost,
  setLabourCost,

  partsCost,
  setPartsCost,

  otherCost,
  setOtherCost,

  totalCost,

  serviceDate,
  setServiceDate,

  expectedCompletionDate,
  setExpectedCompletionDate,

  completionDate,
  setCompletionDate,

  priority,
  setPriority,

  status,
  setStatus,

  remarks,
  setRemarks,

  createdBy,
  setCreatedBy,

  isActive,
  setIsActive,

  vehicleOptions,

  formLoading,
}: MaintenanceFormFieldsProps) => {
  return (
    <div className="space-y-6 relative">
      {/* FORM LOADER */}
      {formLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* LAYER 1 : SERVICE DETAILS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-tools text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Service Details
            </h3>
            <p className="text-xs text-gray-500">
              Identify the vehicle, service type and vendor for this
              maintenance record.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Maintenance Number */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Maintenance Number
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MTN-2005"
              className="w-full border rounded-lg p-2 text-sm"
              value={maintenanceNumber}
              onChange={(e) => setMaintenanceNumber(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Vehicle */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Vehicle
              <span className="text-red-500"> *</span>
            </label>
            <select
              className="w-full border rounded-lg p-2 text-sm"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={formLoading}
            >
              <option value="">Select Vehicle</option>
              {vehicleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Service Type
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Oil Change, Tyre Replacement"
              className="w-full border rounded-lg p-2 text-sm"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Service Center */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Service Center
            </label>
            <input
              type="text"
              placeholder="Enter Service Center"
              className="w-full border rounded-lg p-2 text-sm"
              value={serviceCenter}
              onChange={(e) => setServiceCenter(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Vendor Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Vendor Name
            </label>
            <input
              type="text"
              placeholder="Enter Vendor Name"
              className="w-full border rounded-lg p-2 text-sm"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Vendor Contact */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Vendor Contact
            </label>
            <input
              type="text"
              placeholder="Enter Vendor Contact"
              className="w-full border rounded-lg p-2 text-sm"
              value={vendorContact}
              onChange={(e) => setVendorContact(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Invoice Number */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Invoice Number
            </label>
            <input
              type="text"
              placeholder="Enter Invoice Number"
              className="w-full border rounded-lg p-2 text-sm"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Enter service description"
              className="w-full border rounded-lg p-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={formLoading}
            />
          </div>
        </div>
      </div>

      {/* LAYER 2 : VEHICLE READING & COST */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-tachometer-alt text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Vehicle Reading &amp; Cost
            </h3>
            <p className="text-xs text-gray-500">
              Odometer readings at service time and the cost breakdown for
              this maintenance.
            </p>
          </div>
        </div>

        {/* Odometer */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Odometer Readings
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Current Odometer
              </label>
              <input
                type="number"
                placeholder="Enter Current Odometer"
                className="w-full border rounded-lg p-2 text-sm"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(e.target.value)}
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Next Service Odometer
              </label>
              <input
                type="number"
                placeholder="Enter Next Service Odometer"
                className="w-full border rounded-lg p-2 text-sm"
                value={nextServiceOdometer}
                onChange={(e) => setNextServiceOdometer(e.target.value)}
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Service Completed Odometer
              </label>
              <input
                type="number"
                placeholder="Enter Odometer at Completion"
                className="w-full border rounded-lg p-2 text-sm"
                value={serviceCompletedOdometer}
                onChange={(e) => setServiceCompletedOdometer(e.target.value)}
                disabled={formLoading}
              />
            </div>
          </div>
        </div>

        {/* Cost */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Cost Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Labour Cost
              </label>
              <input
                type="number"
                placeholder="Enter Labour Cost"
                className="w-full border rounded-lg p-2 text-sm"
                value={labourCost}
                onChange={(e) => setLabourCost(e.target.value)}
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Parts Cost
              </label>
              <input
                type="number"
                placeholder="Enter Parts Cost"
                className="w-full border rounded-lg p-2 text-sm"
                value={partsCost}
                onChange={(e) => setPartsCost(e.target.value)}
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Other Cost
              </label>
              <input
                type="number"
                placeholder="Enter Other Cost"
                className="w-full border rounded-lg p-2 text-sm"
                value={otherCost}
                onChange={(e) => setOtherCost(e.target.value)}
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Total Cost
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 text-sm bg-gray-50 text-gray-600"
                value={formatCurrency(totalCost)}
                disabled
                readOnly
              />
              <p className="text-xs text-gray-400 mt-1">
                Auto-calculated from labour + parts + other cost.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 3 : DATES & PRIORITY */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-calendar-alt text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Dates &amp; Priority
            </h3>
            <p className="text-xs text-gray-500">
              Schedule this service and set its priority level.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Service Date
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-lg p-2 text-sm"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              disabled={formLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Expected Completion Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg p-2 text-sm"
              value={expectedCompletionDate}
              onChange={(e) => setExpectedCompletionDate(e.target.value)}
              disabled={formLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Completion Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg p-2 text-sm"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              disabled={formLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              className="w-full border rounded-lg p-2 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={formLoading}
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* LAYER 4 : STATUS & REMARKS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-clipboard-check text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Status &amp; Remarks
            </h3>
            <p className="text-xs text-gray-500">
              Track the current status of this maintenance and add any final
              remarks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              className="w-full border rounded-lg p-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={formLoading}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Created By
            </label>
            <input
              type="text"
              placeholder="Enter Created By"
              className="w-full border rounded-lg p-2 text-sm"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              disabled={formLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Availability
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={formLoading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <div>
                <span className="text-sm font-medium text-gray-800">
                  Active Record
                </span>
                <p className="text-xs text-gray-500">
                  Disable this if the record should be archived.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Remarks
          </label>
          <textarea
            placeholder="Enter any additional remarks"
            className="w-full border rounded-lg p-2 text-sm"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={formLoading}
          />
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// COMPONENT
// ==========================================================================

const MaintenanceManagement = () => {
  // ---- data state -------------------------------------------------------
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // ---- filter / search state ---------------------------------------------
  const [vehicleFilter, setVehicleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ---- table state --------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [tableHeight, setTableHeight] = useState("350px");
  const [, setSelectedRows] = useState<Maintenance[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<
    number | null
  >(null);
  const [formLoading] = useState(false);

  // ==========================================================
  // FORM FIELD STATE
  // ==========================================================
  const [maintenanceNumber, setMaintenanceNumber] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [serviceCenter, setServiceCenter] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [currentOdometer, setCurrentOdometer] = useState("");
  const [nextServiceOdometer, setNextServiceOdometer] = useState("");
  const [serviceCompletedOdometer, setServiceCompletedOdometer] =
    useState("");

  const [labourCost, setLabourCost] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [otherCost, setOtherCost] = useState("");

  const [serviceDate, setServiceDate] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  const [priority, setPriority] = useState("Normal");
  const [status, setStatus] = useState("Pending");

  const [remarks, setRemarks] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Auto-calculated total cost
  const totalCost = useMemo(() => {
    const labour = Number(labourCost) || 0;
    const parts = Number(partsCost) || 0;
    const other = Number(otherCost) || 0;
    return labour + parts + other;
  }, [labourCost, partsCost, otherCost]);

  // Vehicle options for filters + form dropdown
  const vehicleFilterOptions = useMemo(
    () => [
      { label: "All", value: "All" },
      ...vehicles.map((v) => ({
        label: v.registration_number,
        value: v.registration_number,
      })),
    ],
    [vehicles]
  );

  const vehicleFormOptions = useMemo(
    () =>
      vehicles.map((v) => ({
        label: `${v.registration_number} — ${v.vehicle_name}`,
        value: String(v.id),
      })),
    [vehicles]
  );

  const resetForm = () => {
    setMaintenanceNumber("");
    setVehicleId("");
    setServiceType("");
    setDescription("");
    setServiceCenter("");
    setVendorName("");
    setVendorContact("");
    setInvoiceNumber("");

    setCurrentOdometer("");
    setNextServiceOdometer("");
    setServiceCompletedOdometer("");

    setLabourCost("");
    setPartsCost("");
    setOtherCost("");

    setServiceDate("");
    setExpectedCompletionDate("");
    setCompletionDate("");

    setPriority("Normal");
    setStatus("Pending");

    setRemarks("");
    setCreatedBy("");
    setIsActive(true);

    setSelectedRows([]);
    setIsEditMode(false);
    setEditingMaintenanceId(null);
    setIsFormOpen(false);
  };

  // ---- loaders -------------------------------------------------------------
  const loadMaintenance = async () => {
    try {
      setIsLoading(true);

      // TODO: replace with a real fetchMaintenance() service call once the
      // backend endpoint is available — mirrors fetchVehicles() in
      // ts/FleetManagement/vehicle/fetchVehical.ts
      await new Promise((resolve) => setTimeout(resolve, 200));

      setMaintenance(MOCK_MAINTENANCE);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load maintenance.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await fetchVehicles({
        vehicle_type: "All",
        status: "All",
      });

      if (!response.success) {
        toast.error("Failed to load vehicles.");
        return;
      }

      setVehicles(response.data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load vehicles.");
    }
  };

  useEffect(() => {
    loadMaintenance();
    loadVehicles();
  }, []);

  // ---- responsive table height, same approach as VehicleRegistry.tsx -----
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
        key: "maintenance_number",
        header: "Maintenance No. (Unique)",
        visible: true,
        locked: true,
        filterable: true,
        align: "left",
        render: (value: string, row: Maintenance) => (
          <button
            type="button"
            className="text-blue-600 hover:underline bg-transparent p-0 text-left"
            onClick={() => handleViewMaintenance(row)}
          >
            {value}
          </button>
        ),
      },
      {
        key: "vehicle_registration_number",
        header: "Vehicle",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "service_type",
        header: "Service Type",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "service_center",
        header: "Service Center",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: string | null) => value || "-",
      },
      {
        key: "current_odometer",
        header: "Current Odometer",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number | null) =>
          value != null ? formatOdometer(value) : "-",
      },
      {
        key: "next_service_odometer",
        header: "Next Service Odometer",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number | null) =>
          value != null ? formatOdometer(value) : "-",
      },
      {
        key: "total_cost",
        header: "Total Cost",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number | null) =>
          value != null ? formatCurrency(value) : "-",
      },
      {
        key: "service_date",
        header: "Service Date",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "expected_completion_date",
        header: "Expected Completion",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: string | null) => value || "-",
      },
      {
        key: "priority",
        header: "Priority",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: MaintenancePriority) => (
          <PriorityBadge priority={value} />
        ),
      },
      {
        key: "status",
        header: "Status",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: MaintenanceStatus) => <StatusBadge status={value} />,
      },
    ]);
  }, []);

  const visibleColumns = columnsConfig.filter((column) => column.visible);

  // ==========================================================================
  // FILTERING (vehicle dropdown + status dropdown + priority dropdown + search)
  // ==========================================================================
  const filteredData = useMemo(() => {
    return maintenance.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesVehicle =
        vehicleFilter === "All" ||
        item.vehicle_registration_number === vehicleFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || item.priority === priorityFilter;

      const matchesSearch =
        keyword === "" ||
        item.maintenance_number.toLowerCase().includes(keyword) ||
        (item.vehicle_registration_number || "")
          .toLowerCase()
          .includes(keyword) ||
        item.service_type.toLowerCase().includes(keyword) ||
        (item.vendor_name || "").toLowerCase().includes(keyword);

      return matchesVehicle && matchesStatus && matchesPriority && matchesSearch;
    });
  }, [maintenance, vehicleFilter, statusFilter, priorityFilter, searchTerm]);

  // ==========================================================================
  // HANDLERS — placeholders wired for backend hookup
  // ==========================================================================

  const handleViewMaintenance = (row: Maintenance) => {
    // TODO: open a maintenance detail view / form in edit mode
    console.log("View maintenance", row);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMaintenance();
    setIsRefreshing(false);
  };

  const handleEditSelected = (rows: Maintenance[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one maintenance record to edit.");
      return;
    }

    const record = rows[0];

    setIsEditMode(true);
    setEditingMaintenanceId(record.id);
    setSelectedRows([record]);

    // Service Details
    setMaintenanceNumber(record.maintenance_number ?? "");
    setVehicleId(record.vehicle_id ? String(record.vehicle_id) : "");
    setServiceType(record.service_type ?? "");
    setDescription(record.description ?? "");
    setServiceCenter(record.service_center ?? "");
    setVendorName(record.vendor_name ?? "");
    setVendorContact(record.vendor_contact ?? "");
    setInvoiceNumber(record.invoice_number ?? "");

    // Vehicle Reading
    setCurrentOdometer(record.current_odometer?.toString() ?? "");
    setNextServiceOdometer(record.next_service_odometer?.toString() ?? "");
    setServiceCompletedOdometer(
      record.service_completed_odometer?.toString() ?? ""
    );

    // Cost
    setLabourCost(record.labour_cost?.toString() ?? "");
    setPartsCost(record.parts_cost?.toString() ?? "");
    setOtherCost(record.other_cost?.toString() ?? "");

    // Dates
    setServiceDate(record.service_date ? record.service_date.substring(0, 10) : "");
    setExpectedCompletionDate(
      record.expected_completion_date
        ? record.expected_completion_date.substring(0, 10)
        : ""
    );
    setCompletionDate(
      record.completion_date ? record.completion_date.substring(0, 10) : ""
    );

    // Priority / Status
    setPriority(record.priority ?? "Normal");
    setStatus(record.status ?? "Pending");

    // Remarks
    setRemarks(record.remarks ?? "");
    setCreatedBy(record.created_by ?? "");
    setIsActive(record.is_active ?? true);

    setIsFormOpen(true);
  };

  const handleDeleteSelected = (rows: Maintenance[]) => {
    if (rows.length === 0) {
      toast.warning("Please select maintenance record(s) to delete.");
      return;
    }

    // TODO: replace with a real deleteMaintenance() service call once the
    // backend endpoint is available — mirrors deleteVehicle() in
    // ts/FleetManagement/vehicle/deleteVehicle.ts
    const idsToDelete = rows.map((row) => row.id);
    setMaintenance((prev) =>
      prev.filter((item) => !idsToDelete.includes(item.id))
    );

    toast.success("Maintenance record(s) deleted successfully.");
  };

  const handleFormSubmit = async () => {
    try {
      // ===========================
      // Basic Validation
      // ===========================
      if (!maintenanceNumber.trim()) {
        toast.error("Maintenance Number is required.");
        return;
      }

      if (!vehicleId.trim()) {
        toast.error("Vehicle is required.");
        return;
      }

      if (!serviceType.trim()) {
        toast.error("Service Type is required.");
        return;
      }

      if (!serviceDate.trim()) {
        toast.error("Service Date is required.");
        return;
      }

      const selectedVehicle = vehicles.find(
        (v) => String(v.id) === vehicleId
      );

      const payload: Maintenance = {
        id: isEditMode && editingMaintenanceId ? editingMaintenanceId : Date.now(),
        maintenance_number: maintenanceNumber.trim(),
        vehicle_id: Number(vehicleId),
        vehicle_registration_number: selectedVehicle?.registration_number,

        service_type: serviceType.trim(),
        description: description.trim(),
        service_center: serviceCenter.trim(),
        vendor_name: vendorName.trim(),
        vendor_contact: vendorContact.trim(),
        invoice_number: invoiceNumber.trim(),

        current_odometer: currentOdometer ? Number(currentOdometer) : undefined,
        next_service_odometer: nextServiceOdometer
          ? Number(nextServiceOdometer)
          : undefined,
        service_completed_odometer: serviceCompletedOdometer
          ? Number(serviceCompletedOdometer)
          : undefined,

        labour_cost: labourCost ? Number(labourCost) : 0,
        parts_cost: partsCost ? Number(partsCost) : 0,
        other_cost: otherCost ? Number(otherCost) : 0,
        total_cost: totalCost,

        service_date: serviceDate,
        expected_completion_date: expectedCompletionDate || undefined,
        completion_date: completionDate || undefined,

        priority: priority as MaintenancePriority,
        status: status as MaintenanceStatus,

        remarks: remarks.trim(),
        created_by: createdBy.trim(),
        is_active: isActive,
      };

      // TODO: replace with real submitMaintenance() / getMaintenance()
      // service calls once the backend endpoint is available — mirrors
      // submitVehicle() in ts/FleetManagement/vehicle/createVehicle.ts
      if (isEditMode && editingMaintenanceId) {
        setMaintenance((prev) =>
          prev.map((item) =>
            item.id === editingMaintenanceId ? payload : item
          )
        );
        toast.success("Maintenance record updated successfully.");
      } else {
        setMaintenance((prev) => [...prev, payload]);
        toast.success("Maintenance record created successfully.");
      }

      resetForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save maintenance record.");
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden bg-gray-100">
      {/* Filter / Search / Add Maintenance Bar */}
      <div className="flex justify-between items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          {/* Vehicle Filter */}
          <div className="w-44">
            <CustomDropdown
              label=""
              value={vehicleFilter}
              placeholder="Vehicle: All"
              options={vehicleFilterOptions}
              onChange={(value) => {
                setVehicleFilter(value || "All");
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
              options={MAINTENANCE_STATUS_OPTIONS}
              onChange={(value) => {
                setStatusFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Priority Filter */}
          <div className="w-40">
            <CustomDropdown
              label=""
              value={priorityFilter}
              placeholder="Priority: All"
              options={PRIORITY_OPTIONS}
              onChange={(value) => {
                setPriorityFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Search */}
          <div className="w-80">
            <SearchBar
              value={inputValue}
              loading={isLoading}
              placeholder="Search Maintenance No., Vehicle, Type, Vendor..."
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
          {/* Add Maintenance */}
          <button
            onClick={() => {
              resetForm();
              setIsEditMode(false);
              setEditingMaintenanceId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 p-2 bg-white border rounded-xl hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
            Add Maintenance
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
        tableId="MaintenanceManagement-Table"
        columns={visibleColumns}
        data={filteredData}
        striped
        hoverEffect
        showSelection
        emptyMessage="No maintenance records found"
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
          title={isEditMode ? "Edit Maintenance" : "Add Maintenance"}
          onClose={() => {
            resetForm();
            setSelectedRows([]);
            setIsFormOpen(false);
          }}
          onSubmit={handleFormSubmit}
        >
          <MaintenanceFormFields
            maintenanceNumber={maintenanceNumber}
            setMaintenanceNumber={setMaintenanceNumber}
            vehicleId={vehicleId}
            setVehicleId={setVehicleId}
            serviceType={serviceType}
            setServiceType={setServiceType}
            description={description}
            setDescription={setDescription}
            serviceCenter={serviceCenter}
            setServiceCenter={setServiceCenter}
            vendorName={vendorName}
            setVendorName={setVendorName}
            vendorContact={vendorContact}
            setVendorContact={setVendorContact}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            currentOdometer={currentOdometer}
            setCurrentOdometer={setCurrentOdometer}
            nextServiceOdometer={nextServiceOdometer}
            setNextServiceOdometer={setNextServiceOdometer}
            serviceCompletedOdometer={serviceCompletedOdometer}
            setServiceCompletedOdometer={setServiceCompletedOdometer}
            labourCost={labourCost}
            setLabourCost={setLabourCost}
            partsCost={partsCost}
            setPartsCost={setPartsCost}
            otherCost={otherCost}
            setOtherCost={setOtherCost}
            totalCost={totalCost}
            serviceDate={serviceDate}
            setServiceDate={setServiceDate}
            expectedCompletionDate={expectedCompletionDate}
            setExpectedCompletionDate={setExpectedCompletionDate}
            completionDate={completionDate}
            setCompletionDate={setCompletionDate}
            priority={priority}
            setPriority={setPriority}
            status={status}
            setStatus={setStatus}
            remarks={remarks}
            setRemarks={setRemarks}
            createdBy={createdBy}
            setCreatedBy={setCreatedBy}
            isActive={isActive}
            setIsActive={setIsActive}
            vehicleOptions={vehicleFormOptions}
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

export default MaintenanceManagement;