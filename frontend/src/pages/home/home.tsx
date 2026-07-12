import {
  Users,
  Clock3,
  Truck,
  Wrench,
  Route,
  Gauge,
} from "lucide-react";


interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition">
      <p className="text-xs text-gray-500">{title}</p>

      <div className={`mt-3 border-l-4 pl-3 ${color}`}>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </div>
  );
}

function RecentActivityTable() {
  const rows = [
    {
      id: "TRP001",
      vehicle: "Van-05",
      driver: "Alex",
      route: "Mumbai → Pune",
      status: "On Trip",
    },
    {
      id: "TRP002",
      vehicle: "Truck-12",
      driver: "John",
      route: "Delhi → Jaipur",
      status: "Completed",
    },
    {
      id: "TRP003",
      vehicle: "Bus-04",
      driver: "Robert",
      route: "Hyderabad → Vijayawada",
      status: "Pending",
    },
    {
      id: "TRP004",
      vehicle: "Mini Truck-08",
      driver: "David",
      route: "Bangalore → Mysore",
      status: "Cancelled",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "On Trip":
        return "bg-orange-500";
      case "Pending":
        return "bg-blue-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Trips
        </h2>

        <button className="text-sm text-blue-600 hover:underline">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b text-gray-600">
              <th className="py-3 px-3 text-left">Trip ID</th>
              <th className="py-3 px-3 text-left">Vehicle</th>
              <th className="py-3 px-3 text-left">Driver</th>
              <th className="py-3 px-3 text-left">Route</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-3 font-medium text-gray-800">
                  {row.id}
                </td>

                <td className="py-4 px-3">
                  {row.vehicle}
                </td>

                <td className="py-4 px-3">
                  {row.driver}
                </td>

                <td className="py-4 px-3">
                  {row.route}
                </td>

                <td className="py-4 px-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${getStatusColor(
                      row.status
                    )}`}
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

export default function Home() {
 
  const stats = [
    {
      title: "Active Vehicles",
      value: "126",
      color: "border-green-500",
      icon: <Truck size={18} />,
    },
    {
      title: "Available Vehicles",
      value: "98",
      color: "border-blue-500",
      icon: <Truck size={18} />,
    },
    {
      title: "Vehicles In Shop",
      value: "12",
      color: "border-orange-500",
      icon: <Wrench size={18} />,
    },
    {
      title: "Active Trips",
      value: "54",
      color: "border-cyan-500",
      icon: <Route size={18} />,
    },
    {
      title: "Pending Trips",
      value: "18",
      color: "border-yellow-500",
      icon: <Clock3 size={18} />,
    },
    {
      title: "Drivers On Duty",
      value: "82",
      color: "border-purple-500",
      icon: <Users size={18} />,
    },
    {
      title: "Fleet Utilization",
      value: "81%",
      color: "border-red-500",
      icon: <Gauge size={18} />,
    },
  ];

  return (
    <div className="bg-slate-100 min-h-screen p-6">


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4 mt-5">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            color={item.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mt-6">
        <div className="xl:col-span-8">
          <RecentActivityTable />
        </div>
      </div>
    </div>
  );
}