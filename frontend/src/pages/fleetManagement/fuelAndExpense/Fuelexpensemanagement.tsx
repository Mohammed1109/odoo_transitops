import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import ManageColumns from "../../../components/utils/ManageColumns";
import FormLayout from "../../../components/utils/FormLayout";

export type ExpenseStatus = "Available" | "Completed" | "Pending";

export interface FuelLog {
  id: number;
  vehicle: string; // "VEHICLE"
  date: string; // "DATE" e.g. "05 Jul 2026"
  liters: number; // "LITERS"
  fuelCost: number; // "FUEL COST"
}

export interface OtherExpense {
  id: number;
  trip: string; // "TRIP"
  vehicle: string; // "VEHICLE"
  toll: number; // "TOLL"
  other: number; // "OTHER"
  maintLinked: number; // "MAINT. (LINKED)"
  status: ExpenseStatus; // status badge shown in "TOTAL" column area
}

type TabKey = "fuel" | "expenses";

// ==========================================================================
// MOCK DATA
// Replace these with calls to your fuel / expense services, e.g.:
//   const logs = await getFuelLogsService();
//   setFuelLogs(logs);
//   const expenses = await getOtherExpensesService();
//   setOtherExpenses(expenses);
// ==========================================================================

const MOCK_FUEL_LOGS: FuelLog[] = [
  { id: 1, vehicle: "VAN-05", date: "05 Jul 2026", liters: 42, fuelCost: 3150 },
  { id: 2, vehicle: "TRUCK-11", date: "06 Jul 2026", liters: 110, fuelCost: 8400 },
  { id: 3, vehicle: "MINI-08", date: "06 Jul 2026", liters: 28, fuelCost: 2050 },
];

const MOCK_OTHER_EXPENSES: OtherExpense[] = [
  {
    id: 1,
    trip: "TR001",
    vehicle: "VAN-05",
    toll: 120,
    other: 0,
    maintLinked: 0,
    status: "Available",
  },
  {
    id: 2,
    trip: "TR002",
    vehicle: "TRK-12",
    toll: 340,
    other: 150,
    maintLinked: 18000,
    status: "Completed",
  },
];

// Badge styling per status, matched to the reference screenshot's colors.
const STATUS_BADGE_STYLES: Record<ExpenseStatus, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Completed: "bg-lime-100 text-lime-700",
  Pending: "bg-amber-100 text-amber-700",
};

const StatusBadge = ({ status }: { status: ExpenseStatus }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[status]}`}
  >
    {status}
  </span>
);

const formatCurrency = (value: number) => value.toLocaleString("en-IN");

const formatLiters = (value: number) => `${value} L`;

// ==========================================================================
// COMPONENT
// ==========================================================================

interface FuelFormFieldsProps {
  // ==========================================================
  // VEHICLE / DRIVER / TRIP
  // ==========================================================
  vehicleId: string;
  setVehicleId: React.Dispatch<React.SetStateAction<string>>;

  driverId: string;
  setDriverId: React.Dispatch<React.SetStateAction<string>>;

  tripId: string;
  setTripId: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // FUEL DETAILS
  // ==========================================================
  fuelDate: string;
  setFuelDate: React.Dispatch<React.SetStateAction<string>>;

  fuelType: string;
  setFuelType: React.Dispatch<React.SetStateAction<string>>;

  liters: string;
  setLiters: React.Dispatch<React.SetStateAction<string>>;

  pricePerLiter: string;
  setPricePerLiter: React.Dispatch<React.SetStateAction<string>>;

  totalCost: string;
  setTotalCost: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // ODOMETER
  // ==========================================================
  odometer: string;
  setOdometer: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // FUEL STATION
  // ==========================================================
  fuelStation: string;
  setFuelStation: React.Dispatch<React.SetStateAction<string>>;

  stationLocation: string;
  setStationLocation: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // PAYMENT
  // ==========================================================
  paymentMethod: string;
  setPaymentMethod: React.Dispatch<React.SetStateAction<string>>;

  invoiceNumber: string;
  setInvoiceNumber: React.Dispatch<React.SetStateAction<string>>;

  invoicePath: string;
  setInvoicePath: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // REMARKS
  // ==========================================================
  remarks: string;
  setRemarks: React.Dispatch<React.SetStateAction<string>>;

  createdBy: string;
  setCreatedBy: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // SYSTEM
  // ==========================================================
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;

  // ==========================================================
  // FORM STATE
  // ==========================================================
  formLoading: boolean;
}


const FuelFormFields = ({
  // ==========================================================
  // VEHICLE / DRIVER / TRIP
  // ==========================================================
  vehicleId,
  setVehicleId,

  driverId,
  setDriverId,

  tripId,
  setTripId,

  // ==========================================================
  // FUEL DETAILS
  // ==========================================================
  fuelDate,
  setFuelDate,

  fuelType,
  setFuelType,

  liters,
  setLiters,

  pricePerLiter,
  setPricePerLiter,

  totalCost,
  setTotalCost,

  // ==========================================================
  // ODOMETER
  // ==========================================================
  odometer,
  setOdometer,

  // ==========================================================
  // FUEL STATION
  // ==========================================================
  fuelStation,
  setFuelStation,

  stationLocation,
  setStationLocation,

  // ==========================================================
  // PAYMENT
  // ==========================================================
  paymentMethod,
  setPaymentMethod,

  invoiceNumber,
  setInvoiceNumber,

  invoicePath,
  setInvoicePath,

  // ==========================================================
  // REMARKS
  // ==========================================================
  remarks,
  setRemarks,

  createdBy,
  setCreatedBy,

  // ==========================================================
  // SYSTEM
  // ==========================================================
  isActive,
  setIsActive,

  // ==========================================================
  // FORM STATE
  // ==========================================================
  formLoading,
}: FuelFormFieldsProps) => {

  return (
    <div className="space-y-6 relative">
      {/* FORM LOADER */}
      {formLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* LAYER 1 : */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-gas-pump text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Fuel Information
            </h3>

            <p className="text-xs text-gray-500">
              Record vehicle, driver, trip and fuel purchase details for this fuel
              transaction.
            </p>
          </div>
        </div>

        <div className="space-y-6">

          {/* =======================================================
        VEHICLE / DRIVER / TRIP
    ======================================================= */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Vehicle / Driver / Trip
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Vehicle ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Vehicle ID
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="number"
                  placeholder="Enter Vehicle ID"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Driver ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Driver ID
                </label>

                <input
                  type="number"
                  placeholder="Enter Driver ID"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Trip ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Trip ID
                </label>

                <input
                  type="number"
                  placeholder="Enter Trip ID"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

          {/* =======================================================
        FUEL DETAILS
    ======================================================= */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Fuel Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

              {/* Fuel Date */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Fuel Date
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="date"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Fuel Type
                  <span className="text-red-500"> *</span>
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
                </select>
              </div>

              {/* Liters */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Liters
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Price Per Liter */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Price / Liter
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Total Cost */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Total Cost
                </label>

                <input
                  type="number"
                  step="0.01"
                  placeholder="Auto / Manual"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

        </div>
      </div>

      {/*  LAYER 2 : */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-oil-can text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Odometer, Fuel Station & Payment
            </h3>

            <p className="text-xs text-gray-500">
              Record odometer reading, fuel station details, payment information and
              system settings for this fuel transaction.
            </p>
          </div>
        </div>

        {/* =======================================================
      ODOMETER
  ======================================================= */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Odometer Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

            {/* Odometer */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Odometer Reading
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="number"
                step="0.1"
                placeholder="Enter Odometer Reading"
                className="w-full border rounded-lg p-2 text-sm"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                disabled={formLoading}
              />
            </div>

          </div>
        </div>

        {/* =======================================================
      FUEL STATION
  ======================================================= */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Fuel Station Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Fuel Station */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Fuel Station
              </label>

              <input
                type="text"
                placeholder="e.g. Indian Oil, Shell"
                className="w-full border rounded-lg p-2 text-sm"
                value={fuelStation}
                onChange={(e) => setFuelStation(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* Station Location */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Station Location
              </label>

              <input
                type="text"
                placeholder="Enter Station Location"
                className="w-full border rounded-lg p-2 text-sm"
                value={stationLocation}
                onChange={(e) => setStationLocation(e.target.value)}
                disabled={formLoading}
              />
            </div>

          </div>
        </div>

        {/* =======================================================
      PAYMENT
  ======================================================= */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Payment Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Payment Method
              </label>

              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={formLoading}
              >
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Fuel Card">Fuel Card</option>
                <option value="Other">Other</option>
              </select>
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

            {/* Invoice Path */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Invoice File
              </label>

              <input
                type="text"
                placeholder="Invoice File Path"
                className="w-full border rounded-lg p-2 text-sm"
                value={invoicePath}
                onChange={(e) => setInvoicePath(e.target.value)}
                disabled={formLoading}
              />
            </div>

          </div>
        </div>

        {/* =======================================================
      REMARKS
  ======================================================= */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Additional Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Created By */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Created By
              </label>

              <input
                type="text"
                placeholder="Enter User Name"
                className="w-full border rounded-lg p-2 text-sm"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Remarks
              </label>

              <textarea
                rows={4}
                placeholder="Enter remarks..."
                className="w-full border rounded-lg p-2 text-sm resize-none"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={formLoading}
              />
            </div>

          </div>
        </div>

        {/* =======================================================
      SYSTEM
  ======================================================= */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            System Settings
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Active */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Fuel Log Status
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
                    Active Fuel Log
                  </span>

                  <p className="text-xs text-gray-500">
                    Disable this if this fuel record should no longer be considered
                    active.
                  </p>
                </div>

              </label>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

const FuelExpenseManagement = () => {
  // ---- tab state ---------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabKey>("fuel");

  // ---- data state -------------------------------------------------------
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageFuelOpen, setIsManageFuelOpen] = useState(false);
  const [isManageExpenseOpen, setIsManageExpenseOpen] = useState(false);

  // ---- search state (separate per tab) ------------------------------------
  const [fuelInputValue, setFuelInputValue] = useState("");
  const [fuelSearchTerm, setFuelSearchTerm] = useState("");
  const [expenseInputValue, setExpenseInputValue] = useState("");
  const [expenseSearchTerm, setExpenseSearchTerm] = useState("");

  // ---- table state --------------------------------------------------------
  const [fuelCurrentPage, setFuelCurrentPage] = useState(1);
  const [fuelItemsPerPage, setFuelItemsPerPage] = useState(25);
  const [expenseCurrentPage, setExpenseCurrentPage] = useState(1);
  const [expenseItemsPerPage, setExpenseItemsPerPage] = useState(25);
  const [, setSelectedFuelRows] = useState<FuelLog[]>([]);
  const [, setSelectedExpenseRows] = useState<OtherExpense[]>([]);

  // form state left as a placeholder — wire up a FormLayout + fields the
  // same way StudentFormFields is used in Fleet.tsx once you have the
  // fuel log / expense create forms ready.
  const [, setIsFuelFormOpen] = useState(false);
  const [, setIsExpenseFormOpen] = useState(false);

  // ==========================================================
  // VEHICLE / DRIVER / TRIP
  // ==========================================================
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [tripId, setTripId] = useState("");

  // ==========================================================
  // FUEL DETAILS
  // ==========================================================
  const [fuelDate, setFuelDate] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [totalCost, setTotalCost] = useState("");

  // ==========================================================
  // ODOMETER
  // ==========================================================
  const [odometer, setOdometer] = useState("");

  // ==========================================================
  // FUEL STATION
  // ==========================================================
  const [fuelStation, setFuelStation] = useState("");
  const [stationLocation, setStationLocation] = useState("");

  // ==========================================================
  // PAYMENT
  // ==========================================================
  const [paymentMethod, setPaymentMethod] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoicePath, setInvoicePath] = useState("");

  // ==========================================================
  // REMARKS
  // ==========================================================
  const [remarks, setRemarks] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  // ==========================================================
  // SYSTEM
  // ==========================================================
  const [isActive, setIsActive] = useState(true);

  // ==========================================================
  // FORM STATE
  // ==========================================================
  const [formLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [, setSelectedRows] = useState<FuelLog[]>([]);
  const resetForm = () => {
    // ==========================================================
    // VEHICLE / DRIVER / TRIP
    // ==========================================================
    setVehicleId("");
    setDriverId("");
    setTripId("");

    // ==========================================================
    // FUEL DETAILS
    // ==========================================================
    setFuelDate("");
    setFuelType("");
    setLiters("");
    setPricePerLiter("");
    setTotalCost("");

    // ==========================================================
    // ODOMETER
    // ==========================================================
    setOdometer("");

    // ==========================================================
    // FUEL STATION
    // ==========================================================
    setFuelStation("");
    setStationLocation("");

    // ==========================================================
    // PAYMENT
    // ==========================================================
    setPaymentMethod("");
    setInvoiceNumber("");
    setInvoicePath("");

    // ==========================================================
    // REMARKS
    // ==========================================================
    setRemarks("");
    setCreatedBy("");

    // ==========================================================
    // SYSTEM
    // ==========================================================
    setIsActive(true);
  };


  const loadData = async () => {
    try {
      setIsLoading(true);
      // TODO: replace with real API calls
      await new Promise((resolve) => setTimeout(resolve, 200));
      setFuelLogs(MOCK_FUEL_LOGS);
      setOtherExpenses(MOCK_OTHER_EXPENSES);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load fuel & expense data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================================================
  // FUEL LOGS — TABLE COLUMNS
  // ==========================================================================
  const [fuelColumnsConfig, setFuelColumnsConfig] = useState<
    ColumnWithState[]
  >([]);

  useEffect(() => {
    setFuelColumnsConfig([
      {
        key: "vehicle",
        header: "Vehicle",
        visible: true,
        locked: true,
        filterable: true,
        align: "left",
        render: (value: string, row: FuelLog) => (
          <button
            type="button"
            className="text-blue-600 hover:underline bg-transparent p-0 text-left"
            onClick={() => handleViewFuelLog(row)}
          >
            {value}
          </button>
        ),
      },
      {
        key: "date",
        header: "Date",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "liters",
        header: "Liters",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatLiters(value),
      },
      {
        key: "fuelCost",
        header: "Fuel Cost",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatCurrency(value),
      },
    ]);
  }, []);

  const visibleFuelColumns = fuelColumnsConfig.filter(
    (column) => column.visible
  );

  // ==========================================================================
  // OTHER EXPENSES — TABLE COLUMNS
  // ==========================================================================
  const [expenseColumnsConfig, setExpenseColumnsConfig] = useState<
    ColumnWithState[]
  >([]);

  useEffect(() => {
    setExpenseColumnsConfig([
      {
        key: "trip",
        header: "Trip",
        visible: true,
        locked: true,
        filterable: true,
        align: "left",
        render: (value: string, row: OtherExpense) => (
          <button
            type="button"
            className="text-blue-600 hover:underline bg-transparent p-0 text-left"
            onClick={() => handleViewExpense(row)}
          >
            {value}
          </button>
        ),
      },
      {
        key: "vehicle",
        header: "Vehicle",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "toll",
        header: "Toll",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatCurrency(value),
      },
      {
        key: "other",
        header: "Other",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatCurrency(value),
      },
      {
        key: "maintLinked",
        header: "Maint. (Linked)",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatCurrency(value),
      },
      {
        key: "status",
        header: "Total",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: ExpenseStatus) => <StatusBadge status={value} />,
      },
    ]);
  }, []);

  const visibleExpenseColumns = expenseColumnsConfig.filter(
    (column) => column.visible
  );

  // ==========================================================================
  // FILTERING (each tab has its own search bar / term)
  // ==========================================================================
  const filteredFuelLogs = useMemo(() => {
    return fuelLogs.filter((log) => {
      const matchesSearch =
        fuelSearchTerm.trim() === "" ||
        log.vehicle.toLowerCase().includes(fuelSearchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [fuelLogs, fuelSearchTerm]);

  const filteredOtherExpenses = useMemo(() => {
    return otherExpenses.filter((expense) => {
      const matchesSearch =
        expenseSearchTerm.trim() === "" ||
        expense.vehicle
          .toLowerCase()
          .includes(expenseSearchTerm.toLowerCase()) ||
        expense.trip.toLowerCase().includes(expenseSearchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [otherExpenses, expenseSearchTerm]);

  // ==========================================================================
  // HANDLERS — placeholders wired for backend hookup
  // ==========================================================================
  const handleViewFuelLog = (row: FuelLog) => {
    // TODO: open a fuel log detail view / form in edit mode
    console.log("View fuel log", row);
  };

  const handleViewExpense = (row: OtherExpense) => {
    // TODO: open an expense detail view / form in edit mode
    console.log("View expense", row);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleEditFuelSelected = (rows: FuelLog[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one fuel log to edit.");
      return;
    }
    setSelectedFuelRows(rows);
    setIsFuelFormOpen(true);
    // TODO: populate form fields from rows[0], call updateFuelLogService()
    // on submit.
  };

  const handleDeleteFuelSelected = (rows: FuelLog[]) => {
    if (!rows.length) {
      toast.warning("Please select fuel log(s) to delete.");
      return;
    }
    // TODO: confirm with Swal, call deleteFuelLogsService(ids), then
    // await loadData().
    console.log("Delete fuel logs", rows);
  };

  const handleEditExpenseSelected = (rows: OtherExpense[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one expense to edit.");
      return;
    }
    setSelectedExpenseRows(rows);
    setIsExpenseFormOpen(true);
    // TODO: populate form fields from rows[0], call updateExpenseService()
    // on submit.
  };

  const handleDeleteExpenseSelected = (rows: OtherExpense[]) => {
    if (!rows.length) {
      toast.warning("Please select expense(s) to delete.");
      return;
    }
    // TODO: confirm with Swal, call deleteExpensesService(ids), then
    // await loadData().
    console.log("Delete expenses", rows);
  };

  const TABS: { key: TabKey; label: string }[] = [
    { key: "fuel", label: "Fuel Logs" },
    { key: "expenses", label: "Other Expenses (Toll / Misc)" },
  ];

  const handleFormSubmit = async () => {

  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden bg-gray-100">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${activeTab === tab.key
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================== */}
      {/* FUEL LOGS TAB */}
      {/* ================================================================== */}
      {activeTab === "fuel" && (
        <div className="flex flex-col gap-2">
          {/* Search / Log Fuel / Manage Columns / Refresh Bar */}
          <div className="flex justify-between items-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-64">
                <SearchBar
                  value={fuelInputValue}
                  loading={isLoading}
                  placeholder="Search vehicle..."
                  onChange={(val) => {
                    setFuelInputValue(val);
                    if (val.trim() === "") {
                      setFuelSearchTerm("");
                    }
                  }}
                  onSearch={(val) => {
                    setFuelSearchTerm(val.trim());
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Log Fuel */}
              <button
                onClick={() => {
                  // resetFuelForm();
                  setIsFuelFormOpen(true);
                }}
                className="flex items-center gap-2 p-2 bg-white border rounded-xl hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
                Log Fuel
              </button>

              {/* Manage Columns */}
              <button
                className="p-2 bg-white border rounded-lg hover:bg-gray-100"
                onClick={() => setIsManageFuelOpen(true)}
                title="Manage Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <RefreshButton loading={isRefreshing} onClick={handleRefresh} />
            </div>
          </div>

          <ReusableTable
            loading={isLoading}
            tableId="FuelLogs-Table"
            columns={visibleFuelColumns}
            data={filteredFuelLogs}
            striped
            hoverEffect
            showSelection
            emptyMessage="No fuel logs found"
            maxHeight="420px"
            pagination={true}
            currentPage={fuelCurrentPage}
            totalItems={filteredFuelLogs.length}
            totalPages={
              Math.ceil(filteredFuelLogs.length / fuelItemsPerPage) || 1
            }
            itemsPerPage={fuelItemsPerPage}
            onPageChange={(page) => setFuelCurrentPage(page)}
            onItemsPerPageChange={(val) => {
              setFuelItemsPerPage(val);
              setFuelCurrentPage(1);
            }}
            onEditSelected={(ids: (string | number)[]) => {
              const rows = filteredFuelLogs.filter((row) =>
                ids.map(Number).includes(row.id)
              );
              handleEditFuelSelected(rows);
            }}
            onDeleteSelected={(ids: (string | number)[]) => {
              const rows = filteredFuelLogs.filter((row) =>
                ids.map(Number).includes(row.id)
              );
              handleDeleteFuelSelected(rows);
            }}
          />

          {isFormOpen && (
            <FormLayout
              title="Add Fuel Log"
              onClose={() => {
                resetForm();
                setSelectedRows([]);
                setIsFormOpen(false);
              }}
              onSubmit={handleFormSubmit}
            >
              <FuelFormFields
                // ==========================================================
                // VEHICLE / DRIVER / TRIP
                // ==========================================================
                vehicleId={vehicleId}
                setVehicleId={setVehicleId}

                driverId={driverId}
                setDriverId={setDriverId}

                tripId={tripId}
                setTripId={setTripId}

                // ==========================================================
                // FUEL DETAILS
                // ==========================================================
                fuelDate={fuelDate}
                setFuelDate={setFuelDate}

                fuelType={fuelType}
                setFuelType={setFuelType}

                liters={liters}
                setLiters={setLiters}

                pricePerLiter={pricePerLiter}
                setPricePerLiter={setPricePerLiter}

                totalCost={totalCost}
                setTotalCost={setTotalCost}

                // ==========================================================
                // ODOMETER
                // ==========================================================
                odometer={odometer}
                setOdometer={setOdometer}

                // ==========================================================
                // FUEL STATION
                // ==========================================================
                fuelStation={fuelStation}
                setFuelStation={setFuelStation}

                stationLocation={stationLocation}
                setStationLocation={setStationLocation}

                // ==========================================================
                // PAYMENT
                // ==========================================================
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}

                invoiceNumber={invoiceNumber}
                setInvoiceNumber={setInvoiceNumber}

                invoicePath={invoicePath}
                setInvoicePath={setInvoicePath}

                // ==========================================================
                // REMARKS
                // ==========================================================
                remarks={remarks}
                setRemarks={setRemarks}

                createdBy={createdBy}
                setCreatedBy={setCreatedBy}

                // ==========================================================
                // SYSTEM
                // ==========================================================
                isActive={isActive}
                setIsActive={setIsActive}

                // ==========================================================
                // FORM STATE
                // ==========================================================
                formLoading={formLoading}
              />
            </FormLayout>
          )}
          {/* Manage Columns — Fuel Logs */}
          <ManageColumns
            open={isManageFuelOpen}
            onClose={() => setIsManageFuelOpen(false)}
            columns={fuelColumnsConfig}
            onSave={(updated) => {
              setFuelColumnsConfig(updated);
              setIsManageFuelOpen(false);
            }}
          />
        </div>
      )}

      {/* ================================================================== */}
      {/* OTHER EXPENSES TAB */}
      {/* ================================================================== */}
      {activeTab === "expenses" && (
        <div className="flex flex-col gap-2">
          {/* Search / Add Expense / Manage Columns / Refresh Bar */}
          <div className="flex justify-between items-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-64">
                <SearchBar
                  value={expenseInputValue}
                  loading={isLoading}
                  placeholder="Search vehicle / trip..."
                  onChange={(val) => {
                    setExpenseInputValue(val);
                    if (val.trim() === "") {
                      setExpenseSearchTerm("");
                    }
                  }}
                  onSearch={(val) => {
                    setExpenseSearchTerm(val.trim());
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Add Expense */}
              <button
                onClick={() => {
                  // resetExpenseForm();
                  setIsExpenseFormOpen(true);
                }}
                className="flex items-center gap-2 p-2 bg-white border rounded-xl hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>

              {/* Manage Columns */}
              <button
                className="p-2 bg-white border rounded-lg hover:bg-gray-100"
                onClick={() => setIsManageExpenseOpen(true)}
                title="Manage Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <RefreshButton loading={isRefreshing} onClick={handleRefresh} />
            </div>
          </div>

          <ReusableTable
            loading={isLoading}
            tableId="OtherExpenses-Table"
            columns={visibleExpenseColumns}
            data={filteredOtherExpenses}
            striped
            hoverEffect
            showSelection
            emptyMessage="No expenses found"
            maxHeight="420px"
            pagination={true}
            currentPage={expenseCurrentPage}
            totalItems={filteredOtherExpenses.length}
            totalPages={
              Math.ceil(filteredOtherExpenses.length / expenseItemsPerPage) ||
              1
            }
            itemsPerPage={expenseItemsPerPage}
            onPageChange={(page) => setExpenseCurrentPage(page)}
            onItemsPerPageChange={(val) => {
              setExpenseItemsPerPage(val);
              setExpenseCurrentPage(1);
            }}
            onEditSelected={(ids: (string | number)[]) => {
              const rows = filteredOtherExpenses.filter((row) =>
                ids.map(Number).includes(row.id)
              );
              handleEditExpenseSelected(rows);
            }}
            onDeleteSelected={(ids: (string | number)[]) => {
              const rows = filteredOtherExpenses.filter((row) =>
                ids.map(Number).includes(row.id)
              );
              handleDeleteExpenseSelected(rows);
            }}
          />

          {/* Manage Columns — Other Expenses */}
          <ManageColumns
            open={isManageExpenseOpen}
            onClose={() => setIsManageExpenseOpen(false)}
            columns={expenseColumnsConfig}
            onSave={(updated) => {
              setExpenseColumnsConfig(updated);
              setIsManageExpenseOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FuelExpenseManagement;