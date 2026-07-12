import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import ManageColumns from "../../../components/utils/ManageColumns";

export type MaintenanceStatus =
    | "In Progress"
    | "Completed"
    | "Scheduled";

export interface Maintenance {
    id: number;
    maintenanceId: string;
    vehicle: string;
    type: string;
    serviceDate: string;
    nextDue: string;
    status: MaintenanceStatus;
}


const MOCK_MAINTENANCE: Maintenance[] = [
    {
        id: 1,
        maintenanceId: "MTN-2001",
        vehicle: "KA01AB1234",
        type: "Oil Change",
        serviceDate: "10 May 2025",
        nextDue: "10 Aug 2025",
        status: "In Progress",
    },
    {
        id: 2,
        maintenanceId: "MTN-2002",
        vehicle: "KA02CD5678",
        type: "Tyre Replacement",
        serviceDate: "05 May 2025",
        nextDue: "05 Aug 2025",
        status: "Completed",
    },
    {
        id: 3,
        maintenanceId: "MTN-2003",
        vehicle: "KA03EF9012",
        type: "Brake Inspection",
        serviceDate: "20 Apr 2025",
        nextDue: "20 Jul 2025",
        status: "Completed",
    },
    {
        id: 4,
        maintenanceId: "MTN-2004",
        vehicle: "KA04GH3456",
        type: "Engine Service",
        serviceDate: "18 May 2025",
        nextDue: "18 Aug 2025",
        status: "Scheduled",
    },
];

const VEHICLE_OPTIONS = [
    { label: "All", value: "All" },
    { label: "KA01AB1234", value: "KA01AB1234" },
    { label: "KA02CD5678", value: "KA02CD5678" },
    { label: "KA03EF9012", value: "KA03EF9012" },
    { label: "KA04GH3456", value: "KA04GH3456" },
];

const MAINTENANCE_STATUS_OPTIONS = [
    { label: "All", value: "All" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "Scheduled", value: "Scheduled" },
];

const STATUS_BADGE_STYLES: Record<MaintenanceStatus, string> = {
    "In Progress": "bg-pink-100 text-pink-700",
    Completed: "bg-green-100 text-green-700",
    Scheduled: "bg-orange-100 text-orange-700",
};

const StatusBadge = ({ status }: { status: MaintenanceStatus }) => (
    <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_STYLES[status]}`}
    >
        {status}
    </span>
);

// ==========================================================================
// COMPONENT
// ==========================================================================

const Maintenance = () => {
    // ---- data state -------------------------------------------------------
    const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isManageOpen, setIsManageOpen] = useState(false);

    // ---- filter / search state ---------------------------------------------
    const [vehicleFilter, setVehicleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // ---- table state --------------------------------------------------------
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [tableHeight, setTableHeight] = useState("350px");
    const [, setSelectedRows] = useState<Maintenance[]>([]);

    // form state left as a placeholder — wire up a FormLayout + fields the
    // same way StudentFormFields is used in Fleet.tsx once you have the
    // vehicle create/edit form ready.
    const [, setIsFormOpen] = useState(false);

    const loadMaintenance = async () => {
        try {
            setIsLoading(true);

            await new Promise((resolve) => setTimeout(resolve, 200));

            setMaintenance(MOCK_MAINTENANCE);
        } catch (error: any) {
            toast.error(error?.message || "Failed to load maintenance.");
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadMaintenance();
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
                key: "maintenanceId",
                header: "Maintenance ID",
                visible: true,
                locked: true,
                filterable: true,
                render: (value: string, row: Maintenance) => (
                    <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleViewMaintenance(row)}
                    >
                        {value}
                    </button>
                ),
            },
            {
                key: "vehicle",
                header: "Vehicle",
                visible: true,
                filterable: true,
            },
            {
                key: "type",
                header: "Type",
                visible: true,
                filterable: true,
            },
            {
                key: "serviceDate",
                header: "Service Date",
                visible: true,
                filterable: true,
            },
            {
                key: "nextDue",
                header: "Next Due",
                visible: true,
                filterable: true,
            },
            {
                key: "status",
                header: "Status",
                visible: true,
                filterable: true,
                render: (value: MaintenanceStatus) => (
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
        return maintenance.filter((item) => {
            const keyword = searchTerm.trim().toLowerCase();

            const matchesVehicle =
                vehicleFilter === "All" || item.vehicle === vehicleFilter;

            const matchesStatus =
                statusFilter === "All" || item.status === statusFilter;

            const matchesSearch =
                keyword === "" ||
                item.maintenanceId.toLowerCase().includes(keyword) ||
                item.vehicle.toLowerCase().includes(keyword) ||
                item.type.toLowerCase().includes(keyword);

            return matchesVehicle && matchesStatus && matchesSearch;
        });
    }, [maintenance, vehicleFilter, statusFilter, searchTerm]);
    // ==========================================================================
    // HANDLERS — placeholders wired for backend hookup
    // ==========================================================================

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadMaintenance();
        setIsRefreshing(false);
    };


    // ==========================================================================
    // HANDLERS
    // ==========================================================================

    const handleViewMaintenance = (maintenance: Maintenance) => {
        console.log("View Trip", maintenance);
    };

    const handleEditSelected = (rows: Maintenance[]) => {
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

    const handleDeleteSelected = (rows: Maintenance[]) => {
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
                {/* Left Side - Filters & Search */}
                <div className="flex items-center gap-3">
                    {/* Vehicle Filter */}
                    <div className="w-44">
                        <CustomDropdown
                            label=""
                            value={vehicleFilter}
                            placeholder="Vehicle"
                            options={VEHICLE_OPTIONS}
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
                            placeholder="Status"
                            options={MAINTENANCE_STATUS_OPTIONS}
                            onChange={(value) => {
                                setStatusFilter(value || "All");
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Search */}
                    <div className="w-80">
                        <SearchBar
                            value={inputValue}
                            loading={isLoading}
                            placeholder="Search Maintenance ID, Vehicle, Type..."
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

                {/* Right Side - Actions */}
                <div className="flex items-center gap-3">
                    {/* Add Maintenance */}
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Maintenance</span>
                    </button>

                    {/* Refresh */}
                    <RefreshButton
                        loading={isRefreshing}
                        onClick={handleRefresh}
                    />

                    {/* Manage Columns */}
                    <button
                        onClick={() => setIsManageOpen(true)}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        title="Manage Columns"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Trip Table */}
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

export default Maintenance;