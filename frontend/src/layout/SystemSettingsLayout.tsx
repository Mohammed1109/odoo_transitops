import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { UserCog, Mail } from "lucide-react";

export default function SystemSettingsLayout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setReady(true);
      setLoading(false);
    }, 400); // small delay for skeleton feel
  }, []);


  const menuItems = [
    { path: "administration", label: "Add Administrators", icon: UserCog },
    { path: "smtp", label: "Add SMTP Confrigution", icon: Mail },
  
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Global Sidebar */}
      <Sidebar onToggle={setSidebarOpen} externalToggle={sidebarOpen} />

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* SUB LAYOUT */}
        <div
          className={`
    flex flex-1 pt-16
    ${ready ? "transition-all duration-300" : ""}
    ${sidebarOpen ? "ml-64" : "ml-0"}
    overflow-hidden
  `}
        >
          {/* System Settings Sub-Sidebar */}
          <aside className="w-64 bg-white border-r p-4 overflow-y-auto flex-shrink-0">
            {loading ? (
              <div className="space-y-4 animate-pulse">

                {/* Title */}
                <div className="h-5 w-32 bg-gray-300 rounded" />

                {/* Menu items */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  >
                    <div className="w-4 h-4 bg-gray-300 rounded" />
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-gray-700 mb-4">
                  Admin Panel
                </h2>

                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-hidden bg-gray-100 min-h-0">
            {loading ? (
              <div className="space-y-6 animate-pulse">

                {/* Title */}
                <div className="h-6 w-48 bg-gray-300 rounded" />

                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 bg-white border rounded-xl" />
                  ))}
                </div>

                {/* Table / form */}
                <div className="bg-white border rounded-xl p-4 space-y-3">
                  <div className="h-4 w-32 bg-gray-300 rounded" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-3 w-full bg-gray-200 rounded" />
                  ))}
                </div>

              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer sidebarOpen={sidebarOpen} />
      </div>
    </div>
  );
}
