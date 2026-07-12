import { useState, useEffect } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import FormLayout from "../../../components/utils/FormLayout";
import ManageColumns, { type ColumnWithState } from "../../../components/utils/ManageColumns";
import { Eye, EyeOff, LayoutGrid, Plus } from "lucide-react";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import WideReusableTable from "../../../components/utils/WideReusableTable";


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

      {/* Security Q1 */}
      <CustomDropdown
        label="Security Question 1"
        required={!editMode}
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
        required={!editMode}

      />

      {/* Security Q2 */}
      <CustomDropdown
        label="Security Question 2"
        required={!editMode}
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
        required={!editMode}

      />
    </form >
  );
};

// type AdminFlowStep = "admin" | null;

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
}: any) {
  const roleOptions = [
    { label: "Office Admin", value: "superAdmin" },
  ];

  const permissionOptions = [
    { label: "Read", value: "read" },
    { label: "Write", value: "write" },
  ];

  return (
    <form onSubmit={handleRoleFormSubmit} className="space-y-4">

      {/* ROLE */}
      <CustomDropdown
        label="Role"
        value={role}
        onChange={(v) => { setRole(v); }}
        options={roleOptions}
        placeholder="Select Role"
        required
      />

      <CustomDropdown
        label="Assign Permission"
        value={permission}
        onChange={setPermission}
        options={permissionOptions}
        placeholder="Select Permission"
        required
      />
    </form>
  );
}


export default function Administration() {

  const securityQuestionOptions = SecurityQuestionOptions();
  // const [adminFlowStep, setAdminFlowStep] = useState<AdminFlowStep>(null);
  // const [forceAdminCreation, setForceAdminCreation] = useState(false);
  // const isFirstAdminFlow = forceAdminCreation === true;
  // const [gateResolved, setGateResolved] = useState(false);

  // useEffect(() => {
  //   let mounted = true;

  //   async function runAdminGate() {
  //     if (gateResolved) return;

  //     const { hasAdmin } = await getBootstrapStatus();

  //     if (!mounted) return;

  //     resetForm();
  //     setEditMode(false);
  //     setEditAdminId(null);


  //     if (!hasAdmin) {
  //       setForceAdminCreation(true);
  //       setAdminFlowStep("admin");
  //       setIsFormOpen(true);
  //       return;
  //     }

  //     setForceAdminCreation(false);
  //     setAdminFlowStep(null);
  //     setGateResolved(true);
  //   }

  //   runAdminGate();

  //   return () => {
  //     mounted = false;
  //   };
  // }, [gateResolved]);


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

  // near top of Administration()
  const [showSelection, setShowSelection] = useState<boolean>(true); // default true
  const [tableKey, setTableKey] = useState<number>(0);


  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    
  };




  const [formData, setFormData] = useState<any>({
    accountType: "local",
    ssoServer: "",
    ssoUserId: "",
    ldapServer: "",
    ldapGroup: "",
    username: "",
    email: "",
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
      accountType: "local",
      ssoServer: "",
      ssoUserId: "",
      ldapServer: "",
      ldapGroup: "",
      username: "",
      email: "",
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

  const handleEditSelected = async () => {
    
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
              setIsRoleFormOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium 
            bg-blue-50 text-blue-700 border border-blue-200 rounded-lg 
            cursor-pointer hover:bg-blue-100 hover:border-blue-300 
            hover:text-blue-800 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Role</span>
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
  ------------------------------------------------------ */
  const handleDeleteSelected = async () => {
    
  };


  /* ------------------------------------------------------
     Role Start HANDLER
 ------------------------------------------------------ */

  //  State FIRST
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [selectedRoleUser, setSelectedRoleUser] = useState<any>(null);

  const [role, setRole] = useState<string>("");
  const [permission, setPermission] = useState("");

  // Reset Role Form
  const resetRoleForm = () => {
    setRole("");
    setPermission("");
  };

  const handleRoleFormSubmit = async () => {
    
  };


  // ===================== PERMISSION VIEW TABLE =====================
  interface AdminUser {
    id: number;
    username: string;
    email: string;
    accountType: string;
    mobile?: string;
    ldapServer?: string;
    ldapGroup?: string;
    role?: string;
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
  const [permissionData, ] = useState<any[]>([]);

  // ===================== FETCH ROLE PERMISSIONS =====================
  // async function loadUserPermissions() {
 
  // }

  // ===================== OPEN PERMISSION MODAL =====================
  const openPermissionModal = async (user: any) => {
    setSelectedPermissionUser(user);
    setIsPermissionOpen(true);

    //  Load permissions from API
    // loadUserPermissions(user.id);
  };

  const handleEditPermission = () => {
    // const assignmentId = Number(ids[0]);

    // // 2. BLOCK editing for Software Admin role
    // const selectedRow = permissionData.find((row) => row.id === assignmentId);
    // if (selectedRow?.Role === "Software Admin") {
    //   toast.error("Principal role cannot be edited");
    //   return;
    // }

    // // CLOSE PERMISSION MODAL
    // setIsPermissionOpen(false);
    // if (!selectedPermissionUser) {
    //   toast.error("No user selected");
    //   return;
    // }

    // const userId = selectedPermissionUser.id;

    // loadRoleAssignmentForEdit(
    //   assignmentId,
    //   userId,
    //   setIsRoleFormOpen,
    //   setSelectedRoleUser,
    //   setRole,
    //   setPermission,
    // );
  };

  // permission delete
  const handleDeletePermission = async () => {
    // 
  };
  // ------------------------------------------------------
  // ROOT USER PASSWORD UPDATED 
  // ------------------------------------------------------

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
              // setAdminFlowStep("admin"); // REQUIRED
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
          data={filteredData}   // ⬅ FIXED HERE
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
            // if (forceAdminCreation) return;
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
              // forceAdminCreation={forceAdminCreation}
              securityQuestionOptions={securityQuestionOptions}
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
