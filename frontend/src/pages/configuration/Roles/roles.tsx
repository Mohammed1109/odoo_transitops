import { useState, useEffect } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import FormLayout from "../../../components/utils/FormLayout";
import ManageColumns, { type ColumnWithState } from "../../../components/utils/ManageColumns";
import { LayoutGrid, Plus } from "lucide-react";
import CustomDropdown from "../../../components/utils/CustomDropdown";

/* ------------------------------------------------------
    STATUS OPTIONS (maps to Role.is_active)
------------------------------------------------------ */
const StatusOptions = () => [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

/* ------------------------------------------------------
    FORM FIELDS  ->  Role model: name, description, is_active
------------------------------------------------------ */
const RoleFormFields = ({
  formData,
  handleInputChange,
  handleFormSubmit,
  editMode,
  statusOptions,
}: any) => {
  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">

      {/* Name */}
      <input
        type="text"
        value={formData.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
        placeholder="Enter Role Name"
        className="w-full border rounded-lg p-2"
        maxLength={100}
        required
      />

      {/* Description */}
      <textarea
        value={formData.description}
        onChange={(e) => handleInputChange("description", e.target.value)}
        placeholder="Enter Description"
        className="w-full border rounded-lg p-2 resize-none"
        rows={4}
        maxLength={500}
      />

      {/* Status (is_active) */}
      <CustomDropdown
        label="Status"
        required
        value={formData.is_active}
        onChange={(v) => handleInputChange("is_active", v)}
        options={statusOptions}
        placeholder="Select Status"
      />

      {editMode && (
        <p className="text-xs text-gray-400">
          Created and updated timestamps are managed automatically.
        </p>
      )}
    </form>
  );
};

const FormLoaderOverlay = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  return (
    <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm
                    flex items-center justify-center rounded-xl">
      <div className="animate-spin h-10 w-10 border-4
                      border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
};

/* ------------------------------------------------------
    HELPERS
------------------------------------------------------ */
const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Roles() {

  const statusOptions = StatusOptions();

  /* ------------------------------------------------------
      STATE
  ------------------------------------------------------ */
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [, setEditRoleId] = useState<number | null>(null);
  const [isLoading, ] = useState(false);

  const [tableData, ] = useState<any[]>([]);

  const [showSelection, ] = useState<boolean>(true);
  const [tableKey, ] = useState<number>(0);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    // TODO: fetch roles from API (GET /roles)
  };

  /* ------------------------------------------------------
      FORM DATA  ->  maps 1:1 to Role model (editable fields)
  ------------------------------------------------------ */
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    is_active: "true",
  });

  /* ------------------------------------------------------
      RESET FORM
  ------------------------------------------------------ */
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      is_active: "true",
    });

    setEditMode(false);
    setEditRoleId(null);
  };

  const handleEditSelected = async (_ids: (string | number)[]) => {
    // TODO: fetch role by id, populate formData, setEditMode(true), setIsFormOpen(true)
  };

  /* ------------------------------------------------------
      INPUT HANDLER
  ------------------------------------------------------ */
  const handleInputChange = async (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  /* ------------------------------------------------------
     SUBMIT (ADD + EDIT)
  ------------------------------------------------------ */
  const handleFormSubmit = async () => {
    // TODO: POST /roles (create) or PUT /roles/:id (edit)
    // payload: { name: formData.name, description: formData.description, is_active: formData.is_active === "true" }
  };

  /* ------------------------------------------------------
     COLUMNS CONFIG  ->  Role model fields
  ------------------------------------------------------ */
  const [columnsConfig, setColumnsConfig] = useState<ColumnWithState[]>([]);

  useEffect(() => {
    setColumnsConfig([
      {
        key: "name",
        header: "Name",
        visible: true,
        locked: true,
        filterable: true,
      },
      {
        key: "description",
        header: "Description",
        visible: true,
        locked: false,
        filterable: true,
      },
      {
        key: "is_active",
        header: "Status",
        visible: true,
        locked: false,
        render: (value: boolean) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${
              value
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {value ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "created_at",
        header: "Created At",
        visible: true,
        locked: false,
        render: (value: string) => formatDateTime(value),
      },
      {
        key: "updated_at",
        header: "Updated At",
        visible: true,
        locked: false,
        render: (value: string) => formatDateTime(value),
      },
    ]);
  }, []);

  /* computed visible columns */
  const visibleColumns = columnsConfig.filter((c) => c.visible);

  /* ------------------------------------------------------
      PAGINATION + REFRESH
  ------------------------------------------------------ */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const filteredData = tableData.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      row.name?.toLowerCase().includes(term) ||
      row.description?.toLowerCase().includes(term)
    );
  });

  const handleItemsPerPageChange = (v: number) => {
    setItemsPerPage(v);
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRoles();
    setCurrentPage(1);
    setIsRefreshing(false);
  };

  /* ------------------------------------------------------
      DELETE HANDLER
  ------------------------------------------------------ */
  const handleDeleteSelected = async (_ids: (string | number)[]) => {
    // TODO: DELETE /roles/:id for each selected id
  };

  let roleFormTitle = "Add Role";

  if (editMode) {
    roleFormTitle = "Edit Role";
  }

  /* ------------------------------------------------------
      UI RENDER
  ------------------------------------------------------ */
  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden bg-gray-100">

      {/* Search + Actions */}
      <div className="flex justify-between items-center">
        <div className="w-72">
          <SearchBar
            value={inputValue}
            loading={isLoading}
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

        <div className="flex items-center gap-3">

          {/* Add Role */}
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 p-2 bg-white border rounded-xl hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
            Role
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
      <div className="flex-1 overflow-hidden">
        <ReusableTable
          tableId="Roles-Table"
          key={tableKey}
          columns={visibleColumns}
          data={filteredData}
          striped
          hoverEffect
          showSelection={showSelection}
          emptyMessage="No roles found"
          pagination={true}
          currentPage={currentPage}
          totalItems={filteredData.length}
          totalPages={Math.ceil(filteredData.length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onDeleteSelected={handleDeleteSelected}
          onEditSelected={handleEditSelected}
        />
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <FormLayout
          title={roleFormTitle}
          onClose={() => {
            resetForm();
            setIsFormOpen(false);
          }}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
        >
          <div className="relative">
            <FormLoaderOverlay loading={isLoading} />
            <RoleFormFields
              formData={formData}
              handleInputChange={handleInputChange}
              handleFormSubmit={handleFormSubmit}
              editMode={editMode}
              statusOptions={statusOptions}
            />
          </div>
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
}