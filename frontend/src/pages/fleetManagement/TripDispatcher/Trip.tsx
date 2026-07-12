import { useEffect, useMemo, useState } from "react";
import { X, LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";

import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import ManageColumns from "../../../components/utils/ManageColumns";

import TripFormFields, { type SelectOption } from "../../../components/TripFormFields";

// ==========================================================================
// TYPES
// ==========================================================================

export type TripStatus =
  | "Dispatched"
  | "Completed"
  | "Draft"
  | "Cancelled";

export interface Trip {
  id: number;
  tripId: string;
  source: string;
  destination: string;
  driver: string;
  vehicle: string;
  cargo: number;
  status: TripStatus;
}

// ==========================================================================
// STATIC OPTIONS
// ==========================================================================

const SOURCE_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Bengaluru", value: "Bengaluru" },
  { label: "Mumbai", value: "Mumbai" },
  { label: "Hyderabad", value: "Hyderabad" },
  { label: "Delhi", value: "Delhi" },
];

const TRIP_STATUS_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Dispatched", value: "Dispatched" },
  { label: "Completed", value: "Completed" },
  { label: "Draft", value: "Draft" },
  { label: "Cancelled", value: "Cancelled" },
];

// Mock reference data for the Vehicle / Driver selects in the form.
// Swap these for real lookups (e.g. from a vehicles/drivers API) when wiring
// up the backend.
const VEHICLE_OPTIONS: SelectOption[] = [
  { label: "KA01AB1234", value: "1" },
  { label: "KA02CD5678", value: "2" },
  { label: "KA03EF9012", value: "3" },
  { label: "KA04GH3456", value: "4" },
];

const DRIVER_OPTIONS: SelectOption[] = [
  { label: "Alex Johnson", value: "1" },
  { label: "Ramesh Babu", value: "2" },
  { label: "Imran Khan", value: "3" },
  { label: "Suresh Rao", value: "4" },
];

const MOCK_TRIPS: Trip[] = [
  {
    id: 1,
    tripId: "TRP-1001",
    source: "Bengaluru",
    destination: "Chennai",
    driver: "Alex Johnson",
    vehicle: "KA01AB1234",
    cargo: 450,
    status: "Dispatched",
  },
  {
    id: 2,
    tripId: "TRP-1002",
    source: "Mumbai",
    destination: "Pune",
    driver: "Ramesh Babu",
    vehicle: "KA02CD5678",
    cargo: 2500,
    status: "Completed",
  },
  {
    id: 3,
    tripId: "TRP-1003",
    source: "Hyderabad",
    destination: "Vijayawada",
    driver: "Imran Khan",
    vehicle: "KA03EF9012",
    cargo: 1800,
    status: "Draft",
  },
  {
    id: 4,
    tripId: "TRP-1004",
    source: "Delhi",
    destination: "Jaipur",
    driver: "Suresh Rao",
    vehicle: "KA04GH3456",
    cargo: 3200,
    status: "Cancelled",
  },
];

const STATUS_BADGE_STYLES: Record<TripStatus, string> = {
  Dispatched: "bg-pink-100 text-pink-700",
  Completed: "bg-green-100 text-green-700",
  Draft: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }: { status: TripStatus }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_STYLES[status]}`}
  >
    {status}
  </span>
);

// ==========================================================================
// EMPTY FORM STATE HELPER
// ==========================================================================

interface TripFormState {
  tripNumber: string;
  vehicleId: string;
  driverId: string;
  priority: string;
  status: string;

  source: string;
  destination: string;
  intermediateStop: string;
  plannedDistanceKm: string;
  actualDistanceKm: string;

  cargoName: string;
  cargoDescription: string;
  cargoWeight: string;
  cargoUnit: string;

  customerName: string;
  customerPhone: string;
  customerEmail: string;

  startOdometer: string;
  endOdometer: string;
  startLatitude: string;
  startLongitude: string;
  endLatitude: string;
  endLongitude: string;

  scheduledDate: string;
  dispatchTime: string;
  estimatedArrival: string;
  completionTime: string;

  estimatedFuel: string;
  actualFuel: string;
  fuelCost: string;

  tollCost: string;
  parkingCost: string;
  otherExpense: string;

  dispatchedBy: string;
  dispatchNotes: string;
  completionNotes: string;
  cancellationReason: string;

  isActive: boolean;
}

const EMPTY_TRIP_FORM: TripFormState = {
  tripNumber: "",
  vehicleId: "",
  driverId: "",
  priority: "Normal",
  status: "Draft",

  source: "",
  destination: "",
  intermediateStop: "",
  plannedDistanceKm: "",
  actualDistanceKm: "",

  cargoName: "",
  cargoDescription: "",
  cargoWeight: "",
  cargoUnit: "kg",

  customerName: "",
  customerPhone: "",
  customerEmail: "",

  startOdometer: "",
  endOdometer: "",
  startLatitude: "",
  startLongitude: "",
  endLatitude: "",
  endLongitude: "",

  scheduledDate: "",
  dispatchTime: "",
  estimatedArrival: "",
  completionTime: "",

  estimatedFuel: "",
  actualFuel: "",
  fuelCost: "",

  tollCost: "",
  parkingCost: "",
  otherExpense: "",

  dispatchedBy: "",
  dispatchNotes: "",
  completionNotes: "",
  cancellationReason: "",

  isActive: true,
};

// ==========================================================================
// COMPONENT
// ==========================================================================

const Trip = () => {
  // ---- data state -------------------------------------------------------
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // ---- filter / search state ---------------------------------------------
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ---- table state --------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [tableHeight, setTableHeight] = useState("350px");
  const [, setSelectedRows] = useState<Trip[]>([]);

  // ---- form / modal state -------------------------------------------------
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [form, setForm] = useState<TripFormState>(EMPTY_TRIP_FORM);

  const isEditing = editingTripId !== null;

  // Small helper so we don't need 34 individual useState calls — each field
  // still gets its own typed setter to hand to TripFormFields.
  const setField =
    <K extends keyof TripFormState>(key: K) =>
    (value: TripFormState[K] | ((prev: TripFormState[K]) => TripFormState[K])) => {
      setForm((prev) => ({
        ...prev,
        [key]:
          typeof value === "function"
            ? (value as (prev: TripFormState[K]) => TripFormState[K])(prev[key])
            : value,
      }));
    };

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      // TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 200));
      setTrips(MOCK_TRIPS);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load trips.");
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
        key: "tripId",
        header: "Trip ID",
        visible: true,
        locked: true,
        filterable: true,
        render: (value: string, row: Trip) => (
          <button
            className="text-blue-600 hover:underline"
            onClick={() => handleViewTrip(row)}
          >
            {value}
          </button>
        ),
      },
      {
        key: "source",
        header: "Source",
        visible: true,
        filterable: true,
      },
      {
        key: "destination",
        header: "Destination",
        visible: true,
        filterable: true,
      },
      {
        key: "driver",
        header: "Driver",
        visible: true,
        filterable: true,
      },
      {
        key: "vehicle",
        header: "Vehicle",
        visible: true,
        filterable: true,
      },
      {
        key: "cargo",
        header: "Cargo (kg)",
        visible: true,
        filterable: true,
        render: (value: number) => value.toLocaleString(),
      },
      {
        key: "status",
        header: "Status",
        visible: true,
        filterable: true,
        render: (value: TripStatus) => <StatusBadge status={value} />,
      },
    ]);
  }, []);

  const visibleColumns = columnsConfig.filter((column) => column.visible);

  // ==========================================================================
  // FILTERING (type dropdown + status dropdown + search)
  // ==========================================================================
  const filteredData = useMemo(() => {
    return trips.filter((trip) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSource =
        sourceFilter === "All" || trip.source === sourceFilter;

      const matchesStatus =
        statusFilter === "All" || trip.status === statusFilter;

      const matchesSearch =
        keyword === "" ||
        trip.tripId.toLowerCase().includes(keyword) ||
        trip.driver.toLowerCase().includes(keyword) ||
        trip.vehicle.toLowerCase().includes(keyword) ||
        trip.source.toLowerCase().includes(keyword) ||
        trip.destination.toLowerCase().includes(keyword);

      return matchesSource && matchesStatus && matchesSearch;
    });
  }, [trips, sourceFilter, statusFilter, searchTerm]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadVehicles();
    setIsRefreshing(false);
  };

  const handleViewTrip = (trip: Trip) => {
    console.log("View Trip", trip);
  };

  const handleAddTrip = () => {
    setEditingTripId(null);
    setForm(EMPTY_TRIP_FORM);
    setIsFormOpen(true);
  };

  const handleEditSelected = (rows: Trip[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one trip to edit.");
      return;
    }

    setSelectedRows(rows);

    const trip = rows[0];
    const matchedVehicle = VEHICLE_OPTIONS.find(
      (option) => option.label === trip.vehicle
    );
    const matchedDriver = DRIVER_OPTIONS.find(
      (option) => option.label === trip.driver
    );

    // The table row only carries a summarized view of a trip. Populate what
    // we have and leave the rest for the real API response once it's wired
    // up (e.g. GET /trips/:id).
    setForm({
      ...EMPTY_TRIP_FORM,
      tripNumber: trip.tripId,
      vehicleId: matchedVehicle?.value ?? "",
      driverId: matchedDriver?.value ?? "",
      status: trip.status,
      source: trip.source,
      destination: trip.destination,
      cargoWeight: String(trip.cargo),
    });

    setEditingTripId(trip.id);
    setIsFormOpen(true);
  };

  const handleDeleteSelected = (rows: Trip[]) => {
    if (rows.length === 0) {
      toast.warning("Please select trip(s) to delete.");
      return;
    }

    console.log("Delete Selected Trips", rows);

    // TODO:
    // Show confirmation dialog, then call DELETE /trips/:id for each row.
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTripId(null);
    setForm(EMPTY_TRIP_FORM);
  };

  const handleSubmitTrip = async () => {
    if (!form.tripNumber.trim()) {
      toast.warning("Trip number is required.");
      return;
    }

    if (!form.vehicleId || !form.driverId) {
      toast.warning("Please select a vehicle and a driver.");
      return;
    }

    if (!form.source.trim() || !form.destination.trim()) {
      toast.warning("Source and destination are required.");
      return;
    }

    if (!form.cargoWeight.trim()) {
      toast.warning("Cargo weight is required.");
      return;
    }

    try {
      setFormLoading(true);

      // TODO: replace with real API call
      // POST /trips            (create)
      // PATCH /trips/:id       (update)
      await new Promise((resolve) => setTimeout(resolve, 300));

      const vehicleLabel =
        VEHICLE_OPTIONS.find((option) => option.value === form.vehicleId)
          ?.label ?? form.vehicleId;
      const driverLabel =
        DRIVER_OPTIONS.find((option) => option.value === form.driverId)
          ?.label ?? form.driverId;

      if (isEditing && editingTripId !== null) {
        setTrips((prev) =>
          prev.map((trip) =>
            trip.id === editingTripId
              ? {
                  ...trip,
                  tripId: form.tripNumber,
                  source: form.source,
                  destination: form.destination,
                  driver: driverLabel,
                  vehicle: vehicleLabel,
                  cargo: Number(form.cargoWeight) || 0,
                  status: form.status as TripStatus,
                }
              : trip
          )
        );
        toast.success("Trip updated successfully.");
      } else {
        setTrips((prev) => [
          ...prev,
          {
            id: prev.length ? Math.max(...prev.map((t) => t.id)) + 1 : 1,
            tripId: form.tripNumber,
            source: form.source,
            destination: form.destination,
            driver: driverLabel,
            vehicle: vehicleLabel,
            cargo: Number(form.cargoWeight) || 0,
            status: form.status as TripStatus,
          },
        ]);
        toast.success("Trip created successfully.");
      }

      handleCloseForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save trip.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden bg-gray-100">
      {/* Filter / Search / Add Trip Bar */}
      <div className="flex justify-between items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          {/* Source Filter */}
          <div className="w-44">
            <CustomDropdown
              label=""
              value={sourceFilter}
              placeholder="Source"
              options={SOURCE_OPTIONS}
              onChange={(value) => {
                setSourceFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="w-44">
            <CustomDropdown
              label=""
              value={statusFilter}
              placeholder="Status"
              options={TRIP_STATUS_OPTIONS}
              onChange={(value) => {
                setStatusFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Search */}
          <div className="w-72">
            <SearchBar
              value={inputValue}
              loading={isLoading}
              placeholder="Search Trip ID, Driver, Vehicle..."
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
          {/* Add Trip */}
          <button
            onClick={handleAddTrip}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 transition"
          >
            <Plus className="w-4 h-4" />
            Add Trip
          </button>

          {/* Refresh */}
          <RefreshButton loading={isRefreshing} onClick={handleRefresh} />

          {/* Manage Columns */}
          <button
            onClick={() => setIsManageOpen(true)}
            className="p-2 bg-white border rounded-lg hover:bg-gray-100 transition"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trip Table */}
      <ReusableTable
        loading={isLoading}
        tableId="TripManagement-Table"
        columns={visibleColumns}
        data={filteredData}
        striped
        hoverEffect
        showSelection
        emptyMessage="No trips found"
        maxHeight={tableHeight}
        pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        totalPages={Math.ceil(filteredData.length / itemsPerPage) || 1}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        onEditSelected={(ids: (string | number)[]) => {
          const rows = filteredData.filter((trip) =>
            ids.map(Number).includes(trip.id)
          );

          handleEditSelected(rows);
        }}
        onDeleteSelected={(ids: (string | number)[]) => {
          const rows = filteredData.filter((trip) =>
            ids.map(Number).includes(trip.id)
          );

          handleDeleteSelected(rows);
        }}
      />

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

      {/* Add / Edit Trip Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  {isEditing ? "Edit Trip" : "Add Trip"}
                </h2>
                <p className="text-xs text-gray-500">
                  {isEditing
                    ? "Update the details for this trip."
                    : "Fill in the details to create a new trip."}
                </p>
              </div>

              <button
                onClick={handleCloseForm}
                disabled={formLoading}
                className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50">
              <TripFormFields
                tripNumber={form.tripNumber}
                setTripNumber={setField("tripNumber")}
                vehicleId={form.vehicleId}
                setVehicleId={setField("vehicleId")}
                vehicleOptions={VEHICLE_OPTIONS}
                driverId={form.driverId}
                setDriverId={setField("driverId")}
                driverOptions={DRIVER_OPTIONS}
                priority={form.priority}
                setPriority={setField("priority")}
                status={form.status}
                setStatus={setField("status")}
                source={form.source}
                setSource={setField("source")}
                destination={form.destination}
                setDestination={setField("destination")}
                intermediateStop={form.intermediateStop}
                setIntermediateStop={setField("intermediateStop")}
                plannedDistanceKm={form.plannedDistanceKm}
                setPlannedDistanceKm={setField("plannedDistanceKm")}
                actualDistanceKm={form.actualDistanceKm}
                setActualDistanceKm={setField("actualDistanceKm")}
                cargoName={form.cargoName}
                setCargoName={setField("cargoName")}
                cargoDescription={form.cargoDescription}
                setCargoDescription={setField("cargoDescription")}
                cargoWeight={form.cargoWeight}
                setCargoWeight={setField("cargoWeight")}
                cargoUnit={form.cargoUnit}
                setCargoUnit={setField("cargoUnit")}
                customerName={form.customerName}
                setCustomerName={setField("customerName")}
                customerPhone={form.customerPhone}
                setCustomerPhone={setField("customerPhone")}
                customerEmail={form.customerEmail}
                setCustomerEmail={setField("customerEmail")}
                startOdometer={form.startOdometer}
                setStartOdometer={setField("startOdometer")}
                endOdometer={form.endOdometer}
                setEndOdometer={setField("endOdometer")}
                startLatitude={form.startLatitude}
                setStartLatitude={setField("startLatitude")}
                startLongitude={form.startLongitude}
                setStartLongitude={setField("startLongitude")}
                endLatitude={form.endLatitude}
                setEndLatitude={setField("endLatitude")}
                endLongitude={form.endLongitude}
                setEndLongitude={setField("endLongitude")}
                scheduledDate={form.scheduledDate}
                setScheduledDate={setField("scheduledDate")}
                dispatchTime={form.dispatchTime}
                setDispatchTime={setField("dispatchTime")}
                estimatedArrival={form.estimatedArrival}
                setEstimatedArrival={setField("estimatedArrival")}
                completionTime={form.completionTime}
                setCompletionTime={setField("completionTime")}
                estimatedFuel={form.estimatedFuel}
                setEstimatedFuel={setField("estimatedFuel")}
                actualFuel={form.actualFuel}
                setActualFuel={setField("actualFuel")}
                fuelCost={form.fuelCost}
                setFuelCost={setField("fuelCost")}
                tollCost={form.tollCost}
                setTollCost={setField("tollCost")}
                parkingCost={form.parkingCost}
                setParkingCost={setField("parkingCost")}
                otherExpense={form.otherExpense}
                setOtherExpense={setField("otherExpense")}
                dispatchedBy={form.dispatchedBy}
                setDispatchedBy={setField("dispatchedBy")}
                dispatchNotes={form.dispatchNotes}
                setDispatchNotes={setField("dispatchNotes")}
                completionNotes={form.completionNotes}
                setCompletionNotes={setField("completionNotes")}
                cancellationReason={form.cancellationReason}
                setCancellationReason={setField("cancellationReason")}
                isActive={form.isActive}
                setIsActive={setField("isActive")}
                formLoading={formLoading}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleCloseForm}
                disabled={formLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitTrip}
                disabled={formLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {formLoading && (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                {isEditing ? "Save Changes" : "Create Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trip;