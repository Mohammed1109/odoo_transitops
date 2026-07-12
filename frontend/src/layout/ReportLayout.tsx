import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

import {
  Activity,
} from "lucide-react";

export default function ReportLayout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Primary visible reports (first 8)
  const primaryReports = [
    { path: "fuelCost", label: "Fuel Costing", icon: Activity },
  ];

  // Combine all reports for navigation
  const allReports = [...primaryReports];
  // ==========================================================================
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="flex flex-1 flex-col bg-slate-100">
      {/* ---------------- SIDEBAR ---------------- */}
      <Sidebar onToggle={setSidebarOpen} externalToggle={sidebarOpen} />

      {/* ---------------- RIGHT CONTENT ---------------- */}
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        {/* HEADER */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* CONTENT WRAPPER */}
        <div
          className={`
    flex-1 flex flex-col pt-16 overflow-hidden
    transition-all duration-300 ease-out
    ${sidebarOpen ? "ml-64" : "ml-0"}
  `}
        >
          {/* ---------------- TOP BAR ---------------- */}
          <div className="border-b border-slate-200 bg-white/80 backdrop-blur-lg px-6 py-3 flex flex-col gap-3 shadow-sm">
            {/* Title */}
            <div className="grid grid-cols-3 items-center gap-3">
              <div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-72 bg-slate-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-lg font-semibold text-slate-900">
                      Analytics & Reports
                    </h1>

                    <p className="text-xs text-slate-500">
                      Monitor fleet performance, fuel consumption, maintenance trends, trip analytics, and operational insights from a centralized reporting workspace.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Tabs Navigation - Scrollable with dropdown for additional reports */}
            {/* Tabs Navigation - UPDATED with better overflow handling */}
            <nav className="mt-1 -mx-1">
              <div className="flex items-center gap-2 px-1 pb-1 min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-32 rounded-full bg-slate-200 animate-pulse"
                      />
                    ))
                    : primaryReports.map(({ path, label, icon: Icon }) => (
                      <NavLink
                        key={path}
                        to={`./${path}`}
                        className={({ isActive }) =>
                          `inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200
                ${isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                </div>
              </div>
            </nav>

            {/* Quick Stats Bar - Optional enhancement */}
            <div className="flex items-center gap-4 mt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">
                  {allReports.length} Total Reports
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- MAIN CONTENT ---------------- */}
          <main className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-slate-100 px-6 pb-20 pt-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-slate-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>

        {/* FOOTER */}
        <Footer sidebarOpen={sidebarOpen} />
      </div>
    </div>
  );
}
