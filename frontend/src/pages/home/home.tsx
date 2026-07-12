import {
  Car,
  ShieldCheck,
  Wrench,
  Route,
  Clock3,
  Users,
  Gauge,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { ReactNode } from "react";
import FleetLiveMap from "../../components/map/Fleetlivemap";

/* ----------------------------- Stat Card ----------------------------- */

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  change: string;
  changeDirection: "up" | "down";
  changeColor: string;
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  change,
  changeDirection,
  changeColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-bold text-gray-900">{value}</h2>

      <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${changeColor}`}>
        {changeDirection === "up" ? (
          <ArrowUp size={12} strokeWidth={3} />
        ) : (
          <ArrowDown size={12} strokeWidth={3} />
        )}
        <span>{change} from last week</span>
      </div>
    </div>
  );
}

/* --------------------------- Chart Card Shell --------------------------- */

function ChartCard({ title, legend, children }: { title: string; legend?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {legend}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------ Line Chart ------------------------------ */

function FleetUtilizationChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [32, 58, 38, 76, 80, 55, 84];

  const plotLeft = 10;
  const plotRight = 310;
  const baseline = 130;
  const top = 10;

  const points = values.map((v, i) => {
    const x = plotLeft + (i * (plotRight - plotLeft)) / (values.length - 1);
    const y = baseline - (v / 100) * (baseline - top);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;

  return (
    <ChartCard
      title="Fleet Utilization"
      legend={
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          % Utilization
        </div>
      }
    >
      <svg viewBox="0 0 320 160" className="w-full h-40">
        <defs>
          <linearGradient id="fleetGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#fleetGradient)" />
        <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8b5cf6" />
        ))}

        {days.map((d, i) => (
          <text
            key={d}
            x={plotLeft + (i * (plotRight - plotLeft)) / (days.length - 1)}
            y={150}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize="10"
          >
            {d}
          </text>
        ))}
      </svg>
    </ChartCard>
  );
}

/* ------------------------------ Donut Chart ------------------------------ */

function VehiclesByStatusChart() {
  const segments = [
    { label: "Available", value: 75, color: "#14b8a6" },
    { label: "On Trip", value: 18, color: "#7c3aed" },
    { label: "In Shop", value: 12, color: "#f59e0b" },
    { label: "Retired", value: 15, color: "#ef4444" },
  ];

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <ChartCard title="Vehicles by Status">
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 200 200" className="w-32 h-32 shrink-0 -rotate-90">
          {segments.map((s) => {
            const length = (s.value / total) * circumference;
            const offset = (cumulative / total) * circumference;
            cumulative += s.value;
            return (
              <circle
                key={s.label}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="26"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
          })}
        </svg>

        <ul className="flex-1 space-y-2.5">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold text-gray-800">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}

/* ------------------------------- Bar Chart ------------------------------- */

function TripsOverviewChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const completed = [40, 65, 25, 70, 85, 92, 55];
  const cancelled = [10, 8, 5, 10, 12, 10, 8];

  const plotLeft = 14;
  const plotRight = 306;
  const baseline = 130;
  const top = 10;
  const groupWidth = (plotRight - plotLeft) / days.length;
  const barWidth = 8;

  const scale = (v: number) => (v / 100) * (baseline - top);

  return (
    <ChartCard
      title="Trips Overview"
      legend={
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Cancelled
          </span>
        </div>
      }
    >
      <svg viewBox="0 0 320 160" className="w-full h-40">
        {days.map((d, i) => {
          const groupX = plotLeft + i * groupWidth + groupWidth / 2;
          const hComp = scale(completed[i]);
          const hCanc = scale(cancelled[i]);
          return (
            <g key={d}>
              <rect
                x={groupX - barWidth - 2}
                y={baseline - hComp}
                width={barWidth}
                height={hComp}
                rx="2"
                fill="#14b8a6"
              />
              <rect
                x={groupX + 2}
                y={baseline - hCanc}
                width={barWidth}
                height={hCanc}
                rx="2"
                fill="#f43f5e"
              />
              <text x={groupX} y={150} textAnchor="middle" className="fill-gray-400" fontSize="10">
                {d}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
}

/* --------------------------- Recent Activity Table --------------------------- */

function RecentActivityTable() {
  const rows = [
    { id: "TRP001", vehicle: "Van-05", driver: "Alex", route: "Mumbai → Pune", status: "On Trip" },
    { id: "TRP002", vehicle: "Truck-12", driver: "John", route: "Delhi → Jaipur", status: "Completed" },
    { id: "TRP003", vehicle: "Bus-04", driver: "Robert", route: "Hyderabad → Vijayawada", status: "Pending" },
    { id: "TRP004", vehicle: "Mini Truck-08", driver: "David", route: "Bangalore → Mysore", status: "Cancelled" },
  ];

  const statusStyles: Record<string, string> = {
    Completed: "bg-teal-50 text-teal-600",
    "On Trip": "bg-violet-50 text-violet-600",
    Pending: "bg-amber-50 text-amber-600",
    Cancelled: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-800">Recent Trips</h2>
        <button className="text-sm text-violet-600 hover:underline">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400">
              <th className="py-3 px-3 text-left font-medium">Trip ID</th>
              <th className="py-3 px-3 text-left font-medium">Vehicle</th>
              <th className="py-3 px-3 text-left font-medium">Driver</th>
              <th className="py-3 px-3 text-left font-medium">Route</th>
              <th className="py-3 px-3 text-center font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-3 font-medium text-gray-800">{row.id}</td>
                <td className="py-4 px-3 text-gray-600">{row.vehicle}</td>
                <td className="py-4 px-3 text-gray-600">{row.driver}</td>
                <td className="py-4 px-3 text-gray-600">{row.route}</td>
                <td className="py-4 px-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------- Home ---------------------------------- */

export default function Home() {
  const primaryStats: StatCardProps[] = [
    {
      title: "Total Vehicles",
      value: "126",
      icon: <Car size={16} />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      change: "12%",
      changeDirection: "up",
      changeColor: "text-emerald-600",
    },
    {
      title: "Available Vehicles",
      value: "98",
      icon: <ShieldCheck size={16} />,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      change: "8%",
      changeDirection: "up",
      changeColor: "text-emerald-600",
    },
    {
      title: "Vehicles In Shop",
      value: "12",
      icon: <Wrench size={16} />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      change: "3%",
      changeDirection: "up",
      changeColor: "text-emerald-600",
    },
    {
      title: "Active Trips",
      value: "54",
      icon: <Route size={16} />,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
      change: "5%",
      changeDirection: "up",
      changeColor: "text-emerald-600",
    },
  ];

  const secondaryStats: StatCardProps[] = [
    {
      title: "Pending Trips",
      value: "18",
      icon: <Clock3 size={16} />,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      change: "2%",
      changeDirection: "down",
      changeColor: "text-rose-500",
    },
    {
      title: "Drivers On Duty",
      value: "82",
      icon: <Users size={16} />,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      change: "6%",
      changeDirection: "up",
      changeColor: "text-emerald-600",
    },
    {
      title: "Fleet Utilization",
      value: "81%",
      icon: <Gauge size={16} />,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      change: "7%",
      changeDirection: "down",
      changeColor: "text-rose-500",
    },
  ];

  return (
    <div className="bg-slate-100 min-h-screen p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {primaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {secondaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        <FleetUtilizationChart />
        <VehiclesByStatusChart />
        <TripsOverviewChart />
      </div>

      <div className="mt-6">
        <RecentActivityTable />
      </div>
      <div className="mt-6">
        <FleetLiveMap />
      </div>
    </div>
  );
}