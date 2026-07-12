import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import ManageColumns from "../../../components/utils/ManageColumns";

export type LicenseCategory = "LMV" | "HMV";

export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";

export interface Driver {
  id: number;
  name: string; // "DRIVER"
  licenseNo: string; // "LICENSE NO."
  category: LicenseCategory; // "CATEGORY"
  licenseExpiry: string; // "EXPIRY" e.g. "12/2028"
  contact: string; // "CONTACT"
  tripCompletionRate: number; // "TRIP COMPL." e.g. 96 -> "96%"
  safety: DriverStatus; // "SAFETY"
  status: DriverStatus; // "STATUS"
}

// ==========================================================================
// MOCK DATA
// Replace this with a call to your drivers service, e.g.:
//   const data = await getDriversService();
//   setDrivers(data);
// ==========================================================================

const MOCK_DRIVERS: Driver[] = [
  {
    id: 1,
    name: "Alex",
    licenseNo: "DL-88213",
    category: "LMV",
    licenseExpiry: "12/2028",
    contact: "98765xxxxx",
    tripCompletionRate: 96,
    safety: "Available",
    status: "Available",
  },
  {
    id: 2,
    name: "John",
    licenseNo: "DL-44120",
    category: "HMV",
    licenseExpiry: "03/2025",
    contact: "98220xxxxx",
    tripCompletionRate: 81,
    safety: "Suspended",
    status: "Suspended",
  },
  {
    id: 3,
    name: "Priya",
    licenseNo: "DL-77031",
    category: "LMV",
    licenseExpiry: "08/2027",
    contact: "99110xxxxx",
    tripCompletionRate: 99,
    safety: "On Trip",
    status: "On Trip",
  },
  {
    id: 4,
    name: "Suresh",
    licenseNo: "DL-90045",
    category: "HMV",
    licenseExpiry: "01/2027",
    contact: "97440xxxxx",
    tripCompletionRate: 88,
    safety: "Available",
    status: "Off Duty",
  },
];

const DRIVER_CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "LMV", value: "LMV" },
  { label: "HMV", value: "HMV" },
];

const DRIVER_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Available", value: "Available" },
  { label: "On Trip", value: "On Trip" },
  { label: "Off Duty", value: "Off Duty" },
  { label: "Suspended", value: "Suspended" },
];

// Badge styling per status, matched to the reference screenshot's colors.
const STATUS_BADGE_STYLES: Record<DriverStatus, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  "On Trip": "bg-blue-100 text-blue-700",
  "Off Duty": "bg-gray-200 text-gray-600",
  Suspended: "bg-amber-100 text-amber-700",
};

const StatusBadge = ({ status }: { status: DriverStatus }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[status]}`}
  >
    {status}
  </span>
);

// Helper — a license is treated as expired once its MM/YYYY has passed.
const isLicenseExpired = (expiry: string) => {
  const [month, year] = expiry.split("/").map(Number);
  if (!month || !year) return false;
  const expiryDate = new Date(year, month, 0); // last day of that month
  return expiryDate.getTime() < Date.now();
};

const ExpiryCell = ({ expiry }: { expiry: string }) => {
  const expired = isLicenseExpired(expiry);
  return (
    <span
      className={expired ? "text-rose-600 font-semibold" : "text-gray-700"}
    >
      {expiry}
      {expired && " (Expired)"}
    </span>
  );
};

const formatTripCompletion = (value: number) => `${value}%`;

// ==========================================================================
// COMPONENT
// ==========================================================================

const DriverRegistry = () => {
  // ---- data state -------------------------------------------------------
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // ---- filter / search state ---------------------------------------------
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ---- table state --------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [tableHeight, setTableHeight] = useState("350px");
  const [, setSelectedRows] = useState<Driver[]>([]);

  // form state left as a placeholder — wire up a FormLayout + fields the
  // same way StudentFormFields is used in Fleet.tsx once you have the
  // driver create/edit form ready.
  const [, setIsFormOpen] = useState(false);

  const loadDrivers = async () => {
    try {
      setIsLoading(true);
      // TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 200));
      setDrivers(MOCK_DRIVERS);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load drivers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
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
        key: "name",
        header: "Driver",
        visible: true,
        locked: true,
        filterable: true,
        align: "left",
        render: (value: string, row: Driver) => (
          <button
            type="button"
            className="text-blue-600 hover:underline bg-transparent p-0 text-left"
            onClick={() => handleViewDriver(row)}
          >
            {value}
          </button>
        ),
      },
      {
        key: "licenseNo",
        header: "License No.",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "category",
        header: "Category",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "licenseExpiry",
        header: "Expiry",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: string) => <ExpiryCell expiry={value} />,
      },
      {
        key: "contact",
        header: "Contact",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "tripCompletionRate",
        header: "Trip Compl.",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatTripCompletion(value),
      },
      {
        key: "safety",
        header: "Safety",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: DriverStatus) => <StatusBadge status={value} />,
      },
      {
        key: "status",
        header: "Status",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: DriverStatus) => <StatusBadge status={value} />,
      },
    ]);
  }, []);

  const visibleColumns = columnsConfig.filter((column) => column.visible);

  // ==========================================================================
  // FILTERING (category dropdown + status dropdown + driver/license search)
  // ==========================================================================
  const filteredData = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesCategory =
        categoryFilter === "All" || driver.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" || driver.status === statusFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.licenseNo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [drivers, categoryFilter, statusFilter, searchTerm]);

  // ==========================================================================
  // HANDLERS — placeholders wired for backend hookup
  // ==========================================================================
  const handleViewDriver = (row: Driver) => {
    // TODO: open a driver detail view / form in edit mode
    console.log("View driver", row);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDrivers();
    setIsRefreshing(false);
  };

  const handleEditSelected = (rows: Driver[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one driver to edit.");
      return;
    }
    setSelectedRows(rows);
    setIsFormOpen(true);
    // TODO: populate form fields from rows[0], call updateDriverService()
    // on submit. Enforce: expired license or Suspended status -> block
    // from trip assignment (same rule shown in the reference design).
  };

  const handleDeleteSelected = (rows: Driver[]) => {
    if (!rows.length) {
      toast.warning("Please select driver(s) to delete.");
      return;
    }
    // TODO: confirm with Swal, call deleteDriversService(ids), then
    // await loadDrivers().
    console.log("Delete drivers", rows);
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden bg-gray-100">
      {/* Filter / Search / Add Driver Bar */}
      <div className="flex justify-between items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <div className="w-40">
            <CustomDropdown
              label=""
              value={categoryFilter}
              placeholder="Category: All"
              options={DRIVER_CATEGORY_OPTIONS}
              onChange={(value) => {
                setCategoryFilter(value || "All");
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
              options={DRIVER_STATUS_OPTIONS}
              onChange={(value) => {
                setStatusFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Driver / License Search */}
          <div className="w-64">
            <SearchBar
              value={inputValue}
              loading={isLoading}
              placeholder="Search driver / license no..."
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
          {/* Add Driver */}
          <button
            onClick={() => {
              // resetForm();
              // setAdminFlowStep("admin"); // REQUIRED
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 p-2 bg-white border rounded-xl hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
            Add Driver
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
        tableId="DriverRegistry-Table"
        columns={visibleColumns}
        data={filteredData}
        striped
        hoverEffect
        showSelection
        emptyMessage="No drivers found"
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

export default DriverRegistry;