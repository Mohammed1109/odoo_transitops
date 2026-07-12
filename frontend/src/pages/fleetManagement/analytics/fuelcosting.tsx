import { useRef, useState, type JSX } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface KpiCard {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  accent: string; // tailwind border/bg color token
  icon: JSX.Element;
}

interface MonthlyPoint {
  month: string;
  revenue: number;
  cost: number;
}

interface CostliestVehicle {
  vehicle: string;
  cost: number;
}

interface FuelMaintPoint {
  month: string;
  fuel: number;
  maintenance: number;
}

interface ExpenseSlice {
  name: string;
  value: number;
  color: string;
}

// ─── Icons (inline, no external icon dep required) ─────────────────────────
const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
} as const;

const FuelIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M3 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
    <path d="M3 10h8" />
    <path d="M14 9l3 3v6.5a1.5 1.5 0 0 0 3 0V10c0-.7-.3-1.4-.8-1.9L16 5" />
    <path d="M1 22h14" />
  </svg>
);

const GaugeIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M12 3a9 9 0 0 0-9 9c0 2.3.8 4.4 2.2 6h13.6c1.4-1.6 2.2-3.7 2.2-6a9 9 0 0 0-9-9z" />
    <path d="M12 12l3.5-4" />
  </svg>
);

const WalletIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" />
    <circle cx="16" cy="13" r="1.5" />
  </svg>
);

const TrendUpIcon = () => (
  <svg {...ICON_PROPS}>
    <polyline points="3 17 9 11 13 15 21 6" />
    <polyline points="14 6 21 6 21 13" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── Mock data ───────────────────────────────────────────────────────────────
// Vehicle, Trip and Driver models already carry real columns for this. The
// FuelLog, MaintenanceLog and Expense models are currently empty (id only),
// so everything below is placeholder data until those are fleshed out and
// wired to real endpoints.

const KPI_CARDS: KpiCard[] = [
  {
    id: "fuel-efficiency",
    label: "Fuel Efficiency",
    value: "8.4 km/l",
    delta: "+0.3 vs last month",
    deltaPositive: true,
    accent: "border-l-blue-500",
    icon: <FuelIcon />,
  },
  {
    id: "fleet-utilization",
    label: "Fleet Utilization",
    value: "81%",
    delta: "+4% vs last month",
    deltaPositive: true,
    accent: "border-l-emerald-500",
    icon: <GaugeIcon />,
  },
  {
    id: "operational-cost",
    label: "Operational Cost",
    value: "₹34,070",
    delta: "-2.1% vs last month",
    deltaPositive: true,
    accent: "border-l-amber-500",
    icon: <WalletIcon />,
  },
  {
    id: "vehicle-roi",
    label: "Vehicle ROI",
    value: "14.2%",
    delta: "+1.6% vs last month",
    deltaPositive: true,
    accent: "border-l-emerald-500",
    icon: <TrendUpIcon />,
  },
];

const MONTHLY_REVENUE: MonthlyPoint[] = [
  { month: "Jan", revenue: 42000, cost: 31000 },
  { month: "Feb", revenue: 46500, cost: 32800 },
  { month: "Mar", revenue: 41200, cost: 29900 },
  { month: "Apr", revenue: 51800, cost: 35100 },
  { month: "May", revenue: 48300, cost: 33700 },
  { month: "Jun", revenue: 57600, cost: 38200 },
  { month: "Jul", revenue: 54100, cost: 36400 },
];

const COSTLIEST_VEHICLES: CostliestVehicle[] = [
  { vehicle: "TRUCK-11", cost: 18400 },
  { vehicle: "MINI-03", cost: 11200 },
  { vehicle: "VAN-05", cost: 6100 },
  { vehicle: "TRUCK-07", cost: 4300 },
];

const FUEL_MAINT_TREND: FuelMaintPoint[] = [
  { month: "Jan", fuel: 12400, maintenance: 5200 },
  { month: "Feb", fuel: 13100, maintenance: 4300 },
  { month: "Mar", fuel: 11800, maintenance: 6800 },
  { month: "Apr", fuel: 14500, maintenance: 3900 },
  { month: "May", fuel: 13900, maintenance: 5100 },
  { month: "Jun", fuel: 15700, maintenance: 7200 },
  { month: "Jul", fuel: 14800, maintenance: 4600 },
];

const EXPENSE_BREAKDOWN: ExpenseSlice[] = [
  { name: "Fuel", value: 42, color: "#0891b2" },
  { name: "Maintenance", value: 24, color: "#f59e0b" },
  { name: "Tolls & Parking", value: 14, color: "#6366f1" },
  { name: "Insurance", value: 12, color: "#10b981" },
  { name: "Other", value: 8, color: "#94a3b8" },
];

const MAX_COST = Math.max(...COSTLIEST_VEHICLES.map((v) => v.cost));

// ─── Small building blocks ──────────────────────────────────────────────────
function KpiCardView({ card }: { card: KpiCard }) {
  return (
    <div className={`flex flex-col gap-3 bg-white border border-slate-200 border-l-4 ${card.accent} rounded-xl p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-400">{card.label}</span>
        <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
          {card.icon}
        </span>
      </div>
      <div className="text-2xl font-semibold text-slate-900">{card.value}</div>
      <div className={`text-xs font-medium ${card.deltaPositive ? "text-emerald-600" : "text-red-600"}`}>{card.delta}</div>
    </div>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <div className="font-semibold text-slate-700 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.dataKey}</span>
          <span className="font-medium text-slate-800">₹{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const Analytics = () => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const node = reportRef.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#f8fafc",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const stamp = new Date().toISOString().slice(0, 10);
      pdf.save(`fleet-analytics-report-${stamp}.pdf`);
    } catch (e) {
      console.error(e);
      setDownloadError("Couldn't generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 p-6 md:p-10 w-full">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Reports &amp; Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">
              Fleet performance, cost trends and vehicle profitability at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {downloadError && <span className="text-xs text-red-600">{downloadError}</span>}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              {downloading ? <SpinnerIcon /> : <DownloadIcon />}
              {downloading ? "Preparing PDF…" : "Download Report"}
            </button>
          </div>
        </div>

        {/* Everything inside this ref is what gets captured into the PDF */}
        <div ref={reportRef} className="flex flex-col gap-6 bg-slate-50 pb-2">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {KPI_CARDS.map((card) => (
              <KpiCardView key={card.id} card={card} />
            ))}
          </div>

          {/* Row: Revenue vs Cost + Top Costliest Vehicles */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <PanelHeader title="Monthly Revenue vs Operational Cost" subtitle="Last 7 months" />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_REVENUE} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<CurrencyTooltip />} cursor={{ fill: "#f1f5f9" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#0891b2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cost" name="Cost" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <PanelHeader title="Top Costliest Vehicles" subtitle="By total spend, this quarter" />
              <div className="flex flex-col gap-4">
                {COSTLIEST_VEHICLES.map((v, i) => {
                  const pct = Math.round((v.cost / MAX_COST) * 100);
                  const colors = ["bg-rose-400", "bg-amber-500", "bg-cyan-500", "bg-slate-400"];
                  return (
                    <div key={v.vehicle}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono font-semibold text-slate-700">{v.vehicle}</span>
                        <span className="text-slate-400">₹{v.cost.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[i % colors.length]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row: Fuel & Maintenance trend + Expense breakdown */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <PanelHeader title="Fuel vs Maintenance Cost Trend" subtitle="Pending FuelLog / MaintenanceLog data — mock values shown" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={FUEL_MAINT_TREND}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="fuel" name="Fuel" stroke="#0891b2" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="maintenance" name="Maintenance" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <PanelHeader title="Expense Breakdown" subtitle="Pending Expense model data — mock values shown" />
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={EXPENSE_BREAKDOWN}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {EXPENSE_BREAKDOWN.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, undefined]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
                {EXPENSE_BREAKDOWN.map((slice) => (
                  <span key={slice.name} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2 h-2 rounded-full" style={{ background: slice.color }} />
                    {slice.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footnote for the exported report */}
          <div className="text-[11px] text-slate-400 text-right pt-1">
            Generated {new Date().toLocaleString()} · TransitOps Fleet Management
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;