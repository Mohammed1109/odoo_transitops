import { useState, useEffect } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import FormLayout from "../../../components/utils/FormLayout";
import ManageColumns, { type ColumnWithState } from "../../../components/utils/ManageColumns";
import { Eye, EyeOff, LayoutGrid, Plus } from "lucide-react";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import WideReusableTable from "../../../components/utils/WideReusableTable";
import { toast } from "sonner";

// NOTE: adjust these two import paths to wherever roles.ts / users.ts actually
// live in your project — I've guessed the same folder pattern used by
// authHeaders.ts ("../../../ts/services/..."). Everything else assumes
// these paths are correct.
import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUsers,
  type UserResponse,
  type UserCreatePayload,
  type UserUpdatePayload,
} from "../../../ts/Administration/admin/users";
import { fetchRoles, type RoleResponse } from "../../../ts/Administration/role/Roleservice";

const SecurityQuestionOptions = () => [
  {
    label: "What is the official name of your department?",
    value: "departmentName",
  },
  {
    label: "In which year did your organisation start operations?",
    value: "organizationStartYear",
  },
  {
    label: "What is the official abbreviation of your organisation?",
    value: "organizationAbbreviation",
  },
  {
    label: "What is the name of your organisation's headquarters?",
    value: "headquartersName",
  },
  {
    label: "What is the name of your organisation's flagship product or service?",
    value: "flagshipProduct",
  },
  {
    label: "Who is the current CEO of your organisation?",
    value: "currentCeo",
  },
  {
    label: "What is your organisation's official website domain?",
    value: "websiteDomain",
  },
  {
    label: "What are the primary colours of your organisation's logo?",
    value: "logoColors",
  },
  {
    label: "What is your organisation's official tagline or motto?",
    value: "tagline",
  },
  {
    label: "What was the name of your first major project at the organisation?",
    value: "firstMajorProject",
  },
  {
    label: "In which month did you join the organisation?",
    value: "joiningMonth",
  },
  {
    label: "What is the name of the building where your department is located?",
    value: "buildingName",
  },
  {
    label: "Who was your department's first manager?",
    value: "firstManager",
  },
  {
    label: "In which industry does your organisation primarily operate?",
    value: "industry",
  },
  {
    label: "What is the name of the training programme you attended upon joining?",
    value: "trainingProgram",
  },
  {
    label: "What was the name of the system used during your onboarding?",
    value: "onboardingSystem",
  },
  {
    label: "What is the name of your organisation's annual flagship event?",
    value: "annualEvent",
  },
  {
    label: "What are the last four digits of your organisation's registration number?",
    value: "registrationDigits",
  },
  {
    label: "What is the name of the internal communication platform your organisation uses?",
    value: "internalPlatform",
  },
  {
    label: "What was the first client your organisation secured?",
    value: "firstClient",
  },
];

const getPasswordRulesStatus = (password: string) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: (password.match(/\d/g) || []).length >= 2,
    special: /[^A-Za-z0-9]/.test(password),
  };
};

const PasswordRequirementsTooltip = ({
  password,
}: {
  password: string;
}) => {
  const rules = getPasswordRulesStatus(password);

  const Item = ({
    ok,
    text,
  }: {
    ok: boolean;
    text: string;
  }) => (
    <li
      className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-gray-500"
        }`}
    >
      <span className="font-bold">{ok ? "✔" : "✖"}</span>
      {text}
    </li>
  );

  return (
    <div className="absolute z-50 top-full mt-2 w-80 bg-white border rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-3 text-sm">
      <p className="font-semibold mb-2 text-gray-800">
        Password Requirements
      </p>

      <ul className="space-y-1">
        <Item ok={rules.length} text="Be at least 8 characters long" />
        <Item ok={rules.special} text="Contain at least 1 special character" />
        <Item ok={rules.lowercase} text="Contain at least 1 lowercase character" />
        <Item ok={rules.uppercase} text="Contain at least 1 uppercase character" />
        <Item ok={rules.number} text="Contain at least 2 numbers" />
      </ul>
    </div>
  );
};

const AdminFormFields = ({
  formData,
  handleInputChange,
  handleFormSubmit,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  editMode,
  securityQuestionOptions,
  roleOptions,
}: any) => {

  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const passwordsMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const filteredSecurityQ1Options = securityQuestionOptions.filter(
    (opt: any) => opt.value !== formData.securityQ2
  );

  const filteredSecurityQ2Options = securityQuestionOptions.filter(
    (opt: any) => opt.value !== formData.securityQ1
  );

  let confirmPasswordBorderClass = "border-gray-300";

  if (passwordsMismatch) {
    confirmPasswordBorderClass =
      "border-red-500 focus:border-red-500 focus:ring-red-500";
  } else if (passwordsMatch) {
    confirmPasswordBorderClass =
      "border-green-500 focus:border-green-500 focus:ring-green-500";
  }



  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">

      {/* Full Name — required by the backend User model */}
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => handleInputChange("fullName", e.target.value)}
        placeholder="Enter Full Name"
        className="w-full border rounded-lg p-2"
        required
      />

      {/* Username */}
      <input
        type="text"
        value={formData.username}
        onChange={(e) => handleInputChange("username", e.target.value)}
        placeholder="Enter Username"
        className="w-full border rounded-lg p-2"
        required={!editMode}

      />

      {/* Email */}
      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        placeholder="Enter Email"
        className="w-full border rounded-lg p-2"
        required={!editMode}
      />

      {/* Role — fetched from roles.ts, sent to backend as role_id */}
      <CustomDropdown
        label="Role"
        required
        value={formData.roleId}
        onChange={(v) => handleInputChange("roleId", v)}
        options={roleOptions}
        placeholder="Select Role"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="country-Code"

            className="block text-sm font-medium text-gray-700 mb-2">
            Country Code
          </label>
          <input
            type="number"
            placeholder="Enter Country Code"
            className="w-full border rounded-lg p-2"
            value={formData.countryCode}
            onChange={(e) => handleInputChange("countryCode", e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="contact-number"


            className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number
          </label>
          <input
            type="number"
            placeholder="Enter Contact Number"
            className="w-full border rounded-lg p-2"
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
          />
        </div>
      </div>

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          onFocus={() => setShowPasswordHint(true)}
          onBlur={() => setShowPasswordHint(false)}
          placeholder="Enter Password"
          className="w-full border rounded-lg p-2 pr-10"
          required={!editMode}
        />

        <button
          type="button"
          className="absolute right-3 top-[13px] text-gray-600"
          onClick={() => setShowPassword((prev: boolean) => !prev)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {showPasswordHint && (
          <PasswordRequirementsTooltip
            password={formData.password}
          />
        )}
      </div>


      {/* Confirm Password */}
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) =>
            handleInputChange("confirmPassword", e.target.value)
          }
          placeholder="Confirm Password"
          className={`w-full border rounded-lg p-2 pr-10 ${confirmPasswordBorderClass}`}
          required={!editMode}
        />


        <button
          type="button"
          className="absolute right-3 top-[13px] text-gray-600"
          onClick={() =>
            setShowConfirmPassword((prev: boolean) => !prev)
          }
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/*
        Security Q&A below is kept for UX continuity, but the backend User
        model has no columns for it yet, so it is NOT sent on submit.
        Once there's a backend table/columns for this, wire it into
        handleFormSubmit's payload.
      */}

      {/* Security Q1 */}
      <CustomDropdown
        label="Security Question 1"
        value={formData.securityQ1}
        onChange={(v) => handleInputChange("securityQ1", v)}
        options={filteredSecurityQ1Options}
      />


      <input
        type="text"
        value={formData.securityA1}
        onChange={(e) => handleInputChange("securityA1", e.target.value)}
        placeholder="Enter Answer 1"
        className="w-full border rounded-lg p-2"

      />

      {/* Security Q2 */}
      <CustomDropdown
        label="Security Question 2"
        value={formData.securityQ2}
        onChange={(v) => handleInputChange("securityQ2", v)}
        options={filteredSecurityQ2Options}
      />


      <input
        type="text"
        value={formData.securityA2}
        onChange={(e) => handleInputChange("securityA2", e.target.value)}
        placeholder="Enter Answer 2"
        className="w-full border rounded-lg p-2"

      />
    </form >
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

function RoleFormFields({
  role,
  setRole,
  permission,
  setPermission,
  handleRoleFormSubmit,
  roleOptions,
}: any) {
  const permissionOptions = [
    { label: "Read", value: "read" },
    { label: "Write", value: "write" },
  ];

  return (
    <form onSubmit={handleRoleFormSubmit} className="space-y-4">

      {/* ROLE — fetched from roles.ts, same list as the create/edit form */}
      <CustomDropdown
        label="Role"
        value={role}
        onChange={(v) => { setRole(v); }}
        options={roleOptions}
        placeholder="Select Role"
        required
      />

      {/*
        Permission has no backend equivalent on the User model yet (there's
        only a single role_id column). Kept in the UI, but not sent on
        submit — see handleRoleFormSubmit.
      */}
      <CustomDropdown
        label="Assign Permission"
        value={permission}
        onChange={setPermission}
        options={permissionOptions}
        placeholder="Select Permission"
      />
    </form>
  );
}


export default function Administration() {

  const securityQuestionOptions = SecurityQuestionOptions();

  /* ------------------------------------------------------
      STATE
  ------------------------------------------------------ */
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editAdminId, setEditAdminId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [tableData, setTableData] = useState<any[]>([]);

  const [showSelection] = useState<boolean>(true); // default true
  const [tableKey] = useState<number>(0);

  /* Roles — fetched once, reused by both the Role dropdown in the
     create/edit form and the "Manage Role" modal. */
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const roleOptions = roles.map((r) => ({ label: r.name, value: r.id }));

  const roleNameById = (roleId: number | undefined) =>
    roles.find((r) => r.id === roleId)?.name ?? "—";

  useEffect(() => {
    loadRoles();
    loadAdmins();
  }, []);

  const loadRoles = async () => {
    const result = await fetchRoles();
    if (result.success) {
      setRoles(result.data);
    }
  };

  const loadAdmins = async () => {
    setIsLoading(true);
    const result = await fetchUsers();
    if (result.success) {
      const rows = result.data.map((u: UserResponse) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        mobile: u.phone ?? "",
        accountType: u.is_active ? "Active" : "Inactive",
        role: roleNameById(u.role_id),
        role_id: u.role_id,
        full_name: u.full_name,
      }));
      setTableData(rows);
    }
    setIsLoading(false);
  };


  const [formData, setFormData] = useState<any>({
    fullName: "",
    username: "",
    email: "",
    roleId: "",
    password: "",
    confirmPassword: "",
    securityQ1: "",
    securityA1: "",
    securityQ2: "",
    securityA2: "",
    countryCode: "",
    mobileNumber: "",
  });

  useEffect(() => {
    if (
      formData.securityQ1 &&
      formData.securityQ2 &&
      formData.securityQ1 === formData.securityQ2
    ) {
      handleInputChange("securityQ2", "");
    }
  }, [formData.securityQ1]);

  /* ------------------------------------------------------
      RESET FORM
  ------------------------------------------------------ */
  const resetForm = () => {
    setFormData({
      fullName: "",
      username: "",
      email: "",
      roleId: "",
      password: "",
      confirmPassword: "",
      securityQ1: "",
      securityA1: "",
      securityQ2: "",
      securityA2: "",
      countryCode: "",
      mobileNumber: "",
    });


    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditMode(false);
    setEditAdminId(null);

  };

  /* ------------------------------------------------------
      EDIT HANDLER
      NOTE: assumes ReusableTable's onEditSelected passes an array of
      selected row ids, matching onDeleteSelected below. Adjust if your
      ReusableTable actually passes full row objects instead.
  ------------------------------------------------------ */
  const handleEditSelected = async (ids: (string | number)[]) => {
    if (!ids || ids.length === 0) return;

    const userId = Number(ids[0]);
    const result = await fetchUserById(userId);

    if (!result.success) return;

    const u = result.data;
    setFormData({
      fullName: u.full_name,
      username: u.username,
      email: u.email,
      roleId: u.role_id,
      password: "",
      confirmPassword: "",
      securityQ1: "",
      securityA1: "",
      securityQ2: "",
      securityA2: "",
      countryCode: "",
      mobileNumber: u.phone ?? "",
    });

    setEditMode(true);
    setEditAdminId(u.id);
    setIsFormOpen(true);
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
  const handleFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();

    if (!formData.roleId) {
      toast.error("Please select a role");
      return;
    }

    if (!editMode && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    if (editMode && editAdminId) {
      const payload: UserUpdatePayload = {
        full_name: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.mobileNumber,
        role_id: Number(formData.roleId),
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const result = await updateUser(editAdminId, payload);
      if (result.success) {
        resetForm();
        setIsFormOpen(false);
        await loadAdmins();
      }
    } else {
      const payload: UserCreatePayload = {
        full_name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.mobileNumber,
        role_id: Number(formData.roleId),
      };

      const result = await createUser(payload);
      if (result.success) {
        resetForm();
        setIsFormOpen(false);
        await loadAdmins();
      }
    }

    setIsLoading(false);
  };

  /* ------------------------------------------------------
     COLUMNS CONFIG
  ------------------------------------------------------ */
  const [columnsConfig, setColumnsConfig] = useState<ColumnWithState[]>([]);

  useEffect(() => {
    setColumnsConfig([
      {
        key: "username",
        header: "Username",
        visible: true,
        locked: true,
        filterable: true,
      },
      {
        key: "role",
        header: "Role",
        visible: true,
        locked: false,
        render: (_, row) => (
          <button
            type="button"
            onClick={() => {
              setSelectedRoleUser(row);
              setRole(row.role_id ?? "");
              setIsRoleFormOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium 
            bg-blue-50 text-blue-700 border border-blue-200 rounded-lg 
            cursor-pointer hover:bg-blue-100 hover:border-blue-300 
            hover:text-blue-800 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{row.role || "Role"}</span>
          </button>
        ),
      },
      {
        key: "permission",
        header: "Permission",
        visible: true,
        locked: false,
        render: (_value, row) => (
          <button
            type="button"
            onClick={() => openPermissionModal(row)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium 
            bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md 
            cursor-pointer hover:bg-indigo-100 hover:border-indigo-300 
            hover:text-indigo-900 transition-all"
          >
            <i className="fas fa-eye text-[10px]" aria-hidden="true"></i>
            <span>View</span>
          </button>
        ),
      },
      {
        key: "email",
        header: "Email",
        visible: true,
        locked: false,
        filterable: true,
      },
      {
        key: "accountType",
        header: "Acount Type",
        visible: true,
        locked: false,
        filterable: true,
      },
      {
        key: "mobile",
        header: "Mobile Number",
        visible: true,
        locked: false,
        filterable: true,
      },

    ]);
  }, [roles]);


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
      row.username?.toLowerCase().includes(term) ||
      row.email?.toLowerCase().includes(term) ||
      row.accountType?.toLowerCase().includes(term) ||
      row.mobile?.toLowerCase().includes(term)
    );
  });



  const handleItemsPerPageChange = (v: number) => {
    setItemsPerPage(v);
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAdmins();
    setCurrentPage(1);

    setIsRefreshing(false);
  };


  /* ------------------------------------------------------
      DELETE HANDLER
      NOTE: same assumption as handleEditSelected — ids array from
      ReusableTable's onDeleteSelected, matching the deleteRoles pattern.
  ------------------------------------------------------ */
  const handleDeleteSelected = async (ids: (string | number)[]) => {
    if (!ids || ids.length === 0) return;
    const result = await deleteUsers(ids);
    if (result.success) {
      await loadAdmins();
    }
  };


  /* ------------------------------------------------------
     Role Start HANDLER
 ------------------------------------------------------ */

  //  State FIRST
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [selectedRoleUser, setSelectedRoleUser] = useState<any>(null);

  const [role, setRole] = useState<string | number>("");
  const [permission, setPermission] = useState("");

  // Reset Role Form
  const resetRoleForm = () => {
    setRole("");
    setPermission("");
  };

  /*
    Persists the role change via updateUser (role_id). Permission has no
    backend column yet, so it isn't sent — see the note on RoleFormFields.
  */
  const handleRoleFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();

    if (!selectedRoleUser || !role) return;

    setIsLoading(true);
    const result = await updateUser(selectedRoleUser.id, {
      role_id: Number(role),
    });

    if (result.success) {
      setIsRoleFormOpen(false);
      resetRoleForm();
      await loadAdmins();
    }
    setIsLoading(false);
  };


  // ===================== PERMISSION VIEW TABLE =====================
  interface AdminUser {
    id: number;
    username: string;
    email: string;
    accountType: string;
    mobile?: string;
    role?: string;
    role_id?: number;
    permission?: string;
  }

  const [selectedPermissionUser, setSelectedPermissionUser] = useState<AdminUser | null>(null);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);

  const permissionColumns = [
    {
      key: "Role",
      header: "Role",
      visible: true,
    },
    {
      key: "Permission",
      header: "Permission",
      visible: true,
    },
  ];


  // FETCHED FROM API (no dummy)
  const [permissionData] = useState<any[]>([]);

  // ===================== OPEN PERMISSION MODAL =====================
  const openPermissionModal = async (user: any) => {
    setSelectedPermissionUser(user);
    setIsPermissionOpen(true);
  };

  const handleEditPermission = () => {
    // No backend endpoint for permission yet — see notes above.
  };

  // permission delete
  const handleDeletePermission = async () => {
    // No backend endpoint for permission yet — see notes above.
  };

  let adminFormTitle = "Add Administrator";

  if (editMode) {
    adminFormTitle = "Edit Administrator";
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

              //  If user clears the input manually
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

          {/* Add Admin */}
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 p-2 bg-white border rounded-xl hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
            Administrator
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
          tableId="AdministrationMain-Table"
          key={tableKey}                    // forces remount when bumped
          columns={visibleColumns}
          data={filteredData}
          striped
          hoverEffect
          showSelection={showSelection}     // controlled visibility
          emptyMessage="No Administration records found"
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
          title={adminFormTitle}

          onClose={() => {
            resetForm();
            setIsFormOpen(false);
          }}

          onSubmit={handleFormSubmit}
          isLoading={isLoading}
        >

          <div className="relative">
            <FormLoaderOverlay loading={isLoading} />
            <AdminFormFields

              formData={formData}
              handleInputChange={handleInputChange}
              handleFormSubmit={handleFormSubmit}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              editMode={editMode}
              securityQuestionOptions={securityQuestionOptions}
              roleOptions={roleOptions}
            />
          </div>
        </FormLayout>

      )}

      {isRoleFormOpen && (
        <FormLayout
          title="Manage Role"
          description={`Assign role for: ${selectedRoleUser?.username ?? ""}`}
          onClose={() => {
            setIsRoleFormOpen(false);
            resetRoleForm();
          }}
          onSubmit={handleRoleFormSubmit}
          isLoading={isLoading}
          size="sm"
        >
          <div className="relative">
            <FormLoaderOverlay loading={isLoading} />
            <RoleFormFields
              role={role}
              setRole={setRole}
              permission={permission}
              setPermission={setPermission}
              handleRoleFormSubmit={handleRoleFormSubmit}
              roleOptions={roleOptions}
            />
          </div>
        </FormLayout>
      )}

      {isPermissionOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[1000px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-800">
                Permissions — {selectedPermissionUser?.username}
              </h3>
              <button
                className="text-gray-600 hover:text-red-500"
                onClick={() => setIsPermissionOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Table Container */}
            <div className="p-4 max-h-80 overflow-auto">
              <WideReusableTable
                tableId="AdministrationRole-Table"
                columns={permissionColumns}
                data={permissionData}
                showSelection={true}
                striped
                hoverEffect
                emptyMessage="No permissions assigned"
                onDeleteSelected={handleDeletePermission}
                onEditSelected={handleEditPermission}
              />
            </div>
          </div>
        </div>
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