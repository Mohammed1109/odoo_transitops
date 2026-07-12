import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import ManageColumns from "../../../components/utils/ManageColumns";

export type VehicleType = "Van" | "Truck" | "Mini";

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";

export interface Vehicle {
  id: number;
  regNumber: string; // "REG. NO. (UNIQUE)"
  nameOrMode: string; // "NAME/MODE"
  type: VehicleType; // "TYPE"
  capacity: string; // "CAPACITY" e.g. "500 kg" / "5 Ton"
  odometer: number; // "ODOMETER"
  acquisitionCost: number; // "ACQ. COST"
  status: VehicleStatus; // "STATUS"
}

// ==========================================================================
// MOCK DATA
// Replace this with a call to your vehicles service, e.g.:
//   const data = await getVehiclesService();
//   setVehicles(data);
// ==========================================================================

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 1,
    regNumber: "GJ01AB4521",
    nameOrMode: "VAN-05",
    type: "Van",
    capacity: "500 kg",
    odometer: 74000,
    acquisitionCost: 620000,
    status: "Available",
  },
  {
    id: 2,
    regNumber: "GJ01AB9981",
    nameOrMode: "TRUCK-11",
    type: "Truck",
    capacity: "5 Ton",
    odometer: 182000,
    acquisitionCost: 2450000,
    status: "On Trip",
  },
  {
    id: 3,
    regNumber: "GJ01AB1120",
    nameOrMode: "MINI-03",
    type: "Mini",
    capacity: "1 Ton",
    odometer: 66000,
    acquisitionCost: 410000,
    status: "In Shop",
  },
  {
    id: 4,
    regNumber: "GJ01AB0008",
    nameOrMode: "VAN-09",
    type: "Van",
    capacity: "750 kg",
    odometer: 241900,
    acquisitionCost: 590000,
    status: "Retired",
  },
];

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

  // form state left as a placeholder — wire up a FormLayout + fields the
  // same way StudentFormFields is used in Fleet.tsx once you have the
  // vehicle create/edit form ready.
  const [, setIsFormOpen] = useState(false);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      // TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 200));
      setVehicles(MOCK_VEHICLES);
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
        key: "regNumber",
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
        key: "nameOrMode",
        header: "Name / Model",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "type",
        header: "Type",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "capacity",
        header: "Capacity",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "odometer",
        header: "Odometer",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatOdometer(value),
      },
      {
        key: "acquisitionCost",
        header: "Acq. Cost",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatCurrency(value),
      },
      {
        key: "status",
        header: "Status",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: VehicleStatus) => (
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
    return vehicles.filter((vehicle) => {
      const matchesType = typeFilter === "All" || vehicle.type === typeFilter;
      const matchesStatus =
        statusFilter === "All" || vehicle.status === statusFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        vehicle.regNumber.toLowerCase().includes(searchTerm.toLowerCase());

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

  const handleEditSelected = (rows: Vehicle[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one vehicle to edit.");
      return;
    }
    setSelectedRows(rows);
    setIsFormOpen(true);
    // TODO: populate form fields from rows[0], call updateVehicleService()
    // on submit.
  };

  const handleDeleteSelected = (rows: Vehicle[]) => {
    if (!rows.length) {
      toast.warning("Please select vehicle(s) to delete.");
      return;
    }
    // TODO: confirm with Swal, call deleteVehiclesService(ids), then
    // await loadVehicles().
    console.log("Delete vehicles", rows);
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
              // resetForm();
              // setAdminFlowStep("admin"); // REQUIRED
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