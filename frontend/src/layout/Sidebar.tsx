import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NetworkCanvasBackground from "../components/sidebar/NetworkCanvasBackground";

export default function Sidebar({
  onToggle,
  externalToggle,
}: {
  onToggle: (o: boolean) => void;
  externalToggle: boolean;
}) {

  const [open, setOpen] = useState(externalToggle);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  /* ======================================================
      DUMMY DATA
  ====================================================== */

  useEffect(() => setOpen(externalToggle), [externalToggle]);
  useEffect(() => onToggle(open), [open, onToggle]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");



  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full
          bg-[#0f1720] text-gray-200
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          w-64
          z-50
        `}
      >
        <div className="relative h-full">

          {/* Background */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <NetworkCanvasBackground />

            {/* Glass blur overlay */}
            <div className="absolute inset-0 bg-[#0f1720]/60 backdrop-blur-0" />
          </div>

          {/* Content */}
          <div className={`relative z-10 flex flex-col h-full
                ${open ? "opacity-100" : "opacity-0"}
                transition-opacity duration-200 delay-75
              `}>

            {/*  HEADER  */}
            <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-1 w-full">
                {/* Logo only */}
               
                <div className="text-lg font-semibold">TransitOps</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="sm:hidden ml-2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* MENU */}
            <nav className="flex-1 overflow-y-auto px-2 py-4">

              <SidebarItem
                label="Dashboard"
                icon={<i className="fas fa-home" />}
                active={isActive("/home")}
                onNavigate={() => navigate("/home")}
              />


              <Section title="Fleet Management" />

              <SidebarItem
                label="Fleet"
                icon={<i className="fas fa-truck" />}
                active={isActive("/fleet")}
                onNavigate={() => navigate("/fleet")}
              />

              <SidebarItem
                label="Drivers"
                icon={<i className="fas fa-id-card" />}
                active={isActive("/drivers")}
                onNavigate={() => navigate("/drivers")}
              />

              <SidebarItem
                label="Trips"
                icon={<i className="fas fa-route" />}
                active={isActive("/trips")}
                onNavigate={() => navigate("/trips")}
              />

              <SidebarItem
                label="Maintenance"
                icon={<i className="fas fa-tools" />}
                active={isActive("/maintenance")}
                onNavigate={() => navigate("/maintenance")}
              />

              <SidebarItem
                label="Fuel & Expenses"
                icon={<i className="fas fa-gas-pump" />}
                active={isActive("/fuel-expenses")}
                onNavigate={() => navigate("/fuel-expenses")}
              />

              <SidebarItem
                label="Analytics"
                icon={<i className="fas fa-chart-line" />}
                active={isActive("/analytics")}
                onNavigate={() => navigate("/analytics")}
              />

              <Section title="Confrigution Layer" />

              <SidebarItem
                label="System Settings"
                icon={<i className="fas fa-sliders-h" />}
                active={isActive("/admin-panel")}
                onNavigate={() => navigate("/admin-panel")}
              />

            </nav>

            {/* FOOTER */}
            <div className="px-3 py-2 border-t border-gray-800 flex-shrink-0">
              <FooterLink
                to="/help"
                icon="fas fa-question-circle"
                label="Help"
              />

              <FooterLink
                to="/settings"
                icon="fas fa-cog"
                label="Setting"
              />

              <FooterLink
                to="#"
                icon="fas fa-sign-out-alt"
                label="Logout"
                danger
                onClick={() => {
                  sessionStorage.clear(); // 🔥 important
                  fetch("/logout").finally(() => {
                    window.location.href = "/login";
                  });
                }}
              />
            </div>

          </div>
        </div>
      </aside>
    </>
  );
}


/* ===== Helpers ===== */
type sidebarProps = Readonly<{
  title: string;
}>;
function Section({ title }: sidebarProps) {
  return (
    <div className="px-3 py-3 text-[11px] tracking-wider font-semibold text-gray-400 uppercase">
      {title}
    </div>
  );
}
type SidebarItemProps = Readonly<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}>;

function SidebarItem({ icon, label, active, onNavigate }: SidebarItemProps) {
  return (
    <button
      onClick={onNavigate}
      className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
        ${active
          ? "bg-blue-600/20 text-white"
          : "text-gray-300 hover:bg-gray-800/30"
        }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-blue-400" />
      )}

      <div className={`w-7 text-center ${active ? "text-blue-400" : ""}`}>
        {icon}
      </div>

      <div className="text-sm font-medium">{label}</div>
    </button>
  );
}
type FooterLinkProps = Readonly<{
  to: string;
  icon: string;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}>;
function FooterLink({ to, icon, label, danger, onClick }: FooterLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-1 rounded-md transition
        ${danger
          ? "text-red-400 hover:bg-red-600/10"
          : "text-gray-300 hover:bg-gray-800/40"
        }`}
    >
      <div className="w-5 text-center">
        <i className={`${icon} text-sm`} />
      </div>
      <div className="text-xs font-medium">{label}</div>
    </Link>
  );
}
