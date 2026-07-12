import { useEffect, useState } from "react";
import { LayoutGrid, Eye, EyeOff, Plus, Send } from "lucide-react";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import { toast } from "sonner";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import FormLayout from "../../../components/utils/FormLayout";
import ManageColumns from "../../../components/utils/ManageColumns";
import { checkEmailConfiguration, saveSMTPConfiguration } from "../../../ts/SMTP/AddSmtpConfrigution";
import { fetchSmtpConfigurations } from "../../../ts/SMTP/FetchSmtpConfigution";
import { updateSMTPConfiguration } from "../../../ts/SMTP/EditSmtpConfrigution";
import { getSingleSmtpConfiguration } from "../../../ts/SMTP/GetSmtpConfigution";
import { deleteSmtpConfigurations } from "../../../ts/SMTP/DeleteSmtpCofrigution";
import { testSmtpEmail } from "../../../ts/SMTP/sendtestEmail";


/* ======================================================
    FORM COMPONENT OUTSIDE MAIN COMPONENT
   ====================================================== */
const SMTPFormFields = ({
  provider,
  setProvider,
  smtpServer,
  setSmtpServer,
  smtpPort,
  setSmtpPort,
  smtpUsername,
  setSmtpUsername,
  smtpPassword,
  setSmtpPassword,
  setEnableInternalAuth,
}: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      {" "}
      {/* NO <form> here */}
      <CustomDropdown
        label="Provider"
        required
        value={provider}
        onChange={(v) => {
          setProvider(v);
          setEnableInternalAuth(false);
        }}
        options={[
          { label: "Office365 / External SMTP", value: "SMTP" },
        ]}
      />
      <input
        type="text"
        placeholder="SMTP Server"
        value={smtpServer}
        onChange={(e) => setSmtpServer(e.target.value)}
        className="w-full border rounded-lg p-2"
      />

      <input
        type="text"
        placeholder="SMTP Port"
        value={smtpPort}
        onChange={(e) => setSmtpPort(e.target.value)}
        className="w-full border rounded-lg p-2"
      />

      <input
        type="text"
        placeholder="SMTP Username"
        value={smtpUsername}
        onChange={(e) => setSmtpUsername(e.target.value)}
        className="w-full border rounded-lg p-2"
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="SMTP Password"
          value={smtpPassword}
          onChange={(e) => setSmtpPassword(e.target.value)}
          className="w-full border rounded-lg p-2 pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-[10px]"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  );
};

const SMTP = () => {

  const [inputValue, setInputValue] = useState(""); // typing
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // FORM STATES MOVED TO PARENT
  const [provider, setProvider] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [sendgridApiKey, setSendgridApiKey] = useState("");
  const [enableInternalAuth, setEnableInternalAuth] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [smtpData, setSmtpData] = useState<any[]>([]);
  const [smtpExists, setSmtpExists] = useState(false);

  // For Closing And resting slected layout after edit and delete
  const [showSelection, setShowSelection] = useState<boolean>(true); // default true
  const [tableKey, setTableKey] = useState<number>(0);
  const [isTestPopupOpen, setIsTestPopupOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testConfigId, setTestConfigId] = useState<number | null>(null);
  const [testLoading, setTestLoading] = useState(false);


  useEffect(() => {
    (async () => {
      const result = await checkEmailConfiguration();

      if (result === "has-config") {
        setSmtpExists(true); // SMTP already exists
      } else {
        setSmtpExists(false); // No SMTP
      }
    })();
  }, []);

  async function loadSMTP() {
    try {


      //  2. Fetch API
      const list = await fetchSmtpConfigurations();

      const formatted = list.map((item) => ({
        id: item.id,
        provider: item.provider,
        email: item.from_email,
        server: item.smtp_server || "-",
        port: item.smtp_port || "-",
        username: item.smtp_username || "-",
        createdAt: item.created_at,
        selected: false,
      }));

      setSmtpData(formatted);

    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadSMTP();
  }, []);

  /* ------------------------------------------------------
   SMTP TABLE COLUMNS
------------------------------------------------------ */
  const [columnsConfig, setColumnsConfig] = useState<ColumnWithState[]>([]);

  useEffect(() => {
    setColumnsConfig([
      {
        key: "provider",
        header: "Provider",
        visible: true,
        locked: true,
        filterable: true,
      },
      {
        key: "email",
        header: "Email",
        visible: true,
        locked: false,
        filterable: true,
      },
      {
        key: "server",
        header: "SMTP Server",
        visible: true,
        locked: false,
        filterable: true,
      },
      {
        key: "port",
        header: "Port",
        visible: true,
        locked: false,
        filterable: true,
      },
      {
        key: "username",
        header: "Username",
        visible: true,
        locked: false,
        filterable: true,
      },
      {
        key: "createdAt",
        header: "Created At",
        visible: true,
        locked: false,
        filterable: true,
      },
      {
        key: "testEmail",
        header: "Test Email",
        visible: true,
        locked: false,
        filterable: false,
        render: (_value: any, row: any) => (
          <button
            type="button"
            onClick={() => {
              setTestConfigId(row.id);
              setIsTestPopupOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium 
            bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md 
            hover:bg-indigo-100 hover:border-indigo-300 transition-all"
          >
            <span>Test Email</span>
            <Send size={14} />
          </button>
        ),
      },
    ]);
  }, []);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const visibleColumns = columnsConfig.filter((c) => c.visible);

  //  Filter First
  const filteredData = smtpData.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLoading) return;
    setFormLoading(true);
    const payload = {
      provider,
      from_email: fromEmail,
      smtp_server: smtpServer,
      smtp_port: smtpPort,
      smtp_username: smtpUsername,
      smtp_password: smtpPassword || null,
      sendgrid_api_key: sendgridApiKey,
    };

    let res;

    // ------------------------------------
    //  If editing, update SMTP config
    // ------------------------------------
    if (editingId) {
      res = await updateSMTPConfiguration(editingId, payload);
    }

    // ------------------------------------
    //  Else create new SMTP entry
    // ------------------------------------
    else {
      res = await saveSMTPConfiguration(payload);
    }

    if (res.success) {
      setIsFormOpen(false);
      loadSMTP();
      setEditingId(null);
    }
    // show selection again AND remount table to ensure internal selection cleared
    setShowSelection(true);
    setTableKey((k) => k + 1);
    setFormLoading(false);
  };

  const handleEditSelected = async (ids: (string | number)[]) => {
    if (ids.length !== 1) return;
    setFormLoading(true);
    const configId = Number(ids[0]);
    setEditingId(configId);

    const res = await getSingleSmtpConfiguration(configId);
    if (!res.success || !res.config) {
      toast.info("Please fill required fields");
      setShowSelection(true);

      return;
    }

    const cfg = res.config;

    // Prefill
    setProvider(cfg.provider);
    setFromEmail(cfg.from_email);
    setSmtpServer(cfg.smtp_server || "");
    setSmtpPort(cfg.smtp_port || "");
    setSmtpUsername(cfg.smtp_username || "");
    setSmtpPassword("");
    setSendgridApiKey("");

    setEnableInternalAuth(cfg.provider === "INTERNAL_SMTP");

    setIsFormOpen(true);
    setFormLoading(false);
  };

  const handleDeleteSelected = async (ids: (string | number)[]) => {
    const finalIds = ids.map(Number);

    const res = await deleteSmtpConfigurations(finalIds);
    if (res.success) {
      setShowSelection(false);
      loadSMTP();

      setTableKey((k) => k + 1);

      setSmtpData((prev) =>
        prev.filter((row) => !finalIds.includes(row.id))
      );


      setTimeout(() => {
        setShowSelection(true);
        setTableKey((k) => k + 1);
      }, 300);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsRefreshing(false);
  };

  const handleSendtestEmail = async () => {
    if (!testConfigId) {
      toast.error("SMTP configuration not selected");
      return;
    }

    setTestLoading(true);

    const res = await testSmtpEmail({
      config_id: testConfigId,
      to_email: testEmail,
    });

    setTestLoading(false);

    if (res.success) {
      toast.success(res.message);
      setIsTestPopupOpen(false);
      setTestEmail("");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      {/* ================= POPUP (ABOVE BLUR, SIDEBAR NOT AFFECTED) ================= */}

      {/* ================= MAIN PAGE CONTENT (BLUR ONLY THIS) ================= */}
      <div className="flex flex-col gap-3 h-full overflow-hidden bg-gray-100">
        {/* Page Title */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            SMTP
          </h2>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="w-72">
            <SearchBar
              value={inputValue}
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
            <button
              disabled={smtpExists}
              onClick={() => {
                if (smtpExists) return;
                setEditingId(null);
                setIsFormOpen(true);
              }}
              className="
                flex items-center gap-2 p-2 rounded-xl border transition"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">
                Configure SMTP
              </span>
            </button>

            <RefreshButton loading={isRefreshing} onClick={handleRefresh} />

            <button
              className="p-2 bg-white border rounded-lg hover:bg-gray-100 flex justify-center items-center"
              onClick={() => setIsManageOpen(true)}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <ReusableTable
            tableId="SmtpPage-Table"
            key={tableKey}
            columns={visibleColumns}
            data={filteredData}
            pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            totalPages={Math.ceil(filteredData.length / itemsPerPage)}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value: number) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            striped
            hoverEffect
            showSelection={showSelection}
            emptyMessage="No SMTP settings found"
            onDeleteSelected={handleDeleteSelected}
            onEditSelected={handleEditSelected}
          />
        </div>

        {/* Form */}
        {isFormOpen && (
          <FormLayout
            title="Add SMTP Server"
            onClose={() => {
              if (formLoading) return;
              setIsFormOpen(false);
            }}
            onSubmit={handleFormSubmit}
          >
            <div className="relative">
              {formLoading && (
                <div
                  className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm
                  flex items-center justify-center rounded-lg"
                >
                  <div
                    className="animate-spin h-10 w-10 border-4
                    border-blue-500 border-t-transparent rounded-full"
                  />
                </div>
              )}

              <SMTPFormFields
                provider={provider}
                setProvider={setProvider}
                fromEmail={fromEmail}
                setFromEmail={setFromEmail}
                smtpServer={smtpServer}
                setSmtpServer={setSmtpServer}
                smtpPort={smtpPort}
                setSmtpPort={setSmtpPort}
                smtpUsername={smtpUsername}
                setSmtpUsername={setSmtpUsername}
                smtpPassword={smtpPassword}
                setSmtpPassword={setSmtpPassword}
                sendgridApiKey={sendgridApiKey}
                setSendgridApiKey={setSendgridApiKey}
                enableInternalAuth={enableInternalAuth}
                setEnableInternalAuth={setEnableInternalAuth}
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
        {/* Test Email Popup */}
        {isTestPopupOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => !testLoading && setIsTestPopupOpen(false)}
              aria-label="Close popup"
            />

            {/* Popup */}
            <div className="relative bg-white rounded-xl shadow-xl w-[420px] p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Send Test Email
              </h3>

              <input
                type="email"
                placeholder="Recipient email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full border rounded-lg p-2 mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsTestPopupOpen(false)}
                  disabled={testLoading}
                  className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  disabled={!testEmail || testLoading}
                  onClick={handleSendtestEmail}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {testLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SMTP;
