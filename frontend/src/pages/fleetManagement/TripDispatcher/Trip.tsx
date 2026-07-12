import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import ManageColumns from "../../../components/utils/ManageColumns";

export type TripStatus =
  | "Dispatched"
  | "Completed"
  | "Draft"
  | "Canceled";

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
  { label: "Canceled", value: "Canceled" },
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
    status: "Canceled",
  },
];

const STATUS_BADGE_STYLES: Record<TripStatus, string> = {
  Dispatched: "bg-pink-100 text-pink-700",
  Completed: "bg-green-100 text-green-700",
  Draft: "bg-blue-100 text-blue-700",
  Canceled: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }: { status: TripStatus }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_STYLES[status]}`}
  >
    {status}
  </span>
);

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

  // form state left as a placeholder — wire up a FormLayout + fields the
  // same way StudentFormFields is used in Fleet.tsx once you have the
  // vehicle create/edit form ready.
  const [, setIsFormOpen] = useState(false);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      // TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 200));
      setTrips(MOCK_TRIPS);
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
        render: (value: TripStatus) => (
          <StatusBadge status={value} />
        ),
      },
    ]);
  }, []);

  const visibleColumns = columnsConfig.filter((column) => column.visible);

  // ==========================================================================
  // FILTERING (type dropdown + status dropdown + reg. no. search)
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
  // HANDLERS — placeholders wired for backend hookup
  // ==========================================================================

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadVehicles();
    setIsRefreshing(false);
  };


  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleViewTrip = (trip: Trip) => {
    console.log("View Trip", trip);
  };

  const handleEditSelected = (rows: Trip[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one trip to edit.");
      return;
    }

    setSelectedRows(rows);
    setIsFormOpen(true);

    console.log("Edit Selected", rows[0]);

    // TODO:
    // Populate form with rows[0]
  };

  const handleDeleteSelected = (rows: Trip[]) => {
    if (rows.length === 0) {
      toast.warning("Please select trip(s) to delete.");
      return;
    }

    console.log("Delete Selected Trips", rows);

    // TODO:
    // Show confirmation dialog
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
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 transition"
          >
            <Plus className="w-4 h-4" />
            Add Trip
          </button>

          {/* Refresh */}
          <RefreshButton
            loading={isRefreshing}
            onClick={handleRefresh}
          />

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

    </div>
  );
};

export default Trip;