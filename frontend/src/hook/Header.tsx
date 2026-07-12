import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type JSX } from "react";
import { Bell, Menu, X } from "lucide-react";
import NotificationDropdown from "../components/header/NotificationDropdown";

/* ======================================================
    TYPES
====================================================== */
type HeaderProps = Readonly<{
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
}>;

type UserDetails = {
  username: string;
  email: string;
};

/* ======================================================
    HELPERS
====================================================== */
function getUserInitial(name?: string | null): string | null {
  if (!name) return null;
  return name.trim().charAt(0).toUpperCase();
}

function renderAvatar(
  userAvatar: string | null,
  userInitial: string | null,
  onError?: () => void
): JSX.Element {
  if (userAvatar) {
    return (
      <img
        src={userAvatar}
        alt="User avatar"
        className="w-10 h-10 rounded-full object-cover"
        onError={onError}
      />
    );
  }

  if (userInitial) {
    return <span className="text-lg">{userInitial}</span>;
  }

  return (
    <img
      src="/default-avatar.png"
      alt="Default avatar"
      className="w-10 h-10 rounded-full object-cover"
    />
  );
}

/* ======================================================
    COMPONENT
====================================================== */
export default function Header({
  sidebarOpen,
  setSidebarOpen,
}: HeaderProps) {
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [openNotifications, setOpenNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  /* ======================================================
      DUMMY USER DATA
  ====================================================== */
  const [userDetails] = useState<UserDetails>({
    username: "Tech Boy",
    email: "techboy@example.com",
  });

  const [userAvatar] = useState<string | null>(null);

  /* ======================================================
      DUMMY NOTIFICATION COUNT
  ====================================================== */
  const [notificationCount, setNotificationCount] = useState(4);

  /* simulate clear event */
  useEffect(() => {
    function handleClear() {
      setNotificationCount(0);
    }
    window.addEventListener("notifications-cleared", handleClear);
    return () =>
      window.removeEventListener("notifications-cleared", handleClear);
  }, []);

  /* close notification dropdown */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setOpenNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* close profile dropdown */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setOpenProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = getUserInitial(userDetails.username);

  return (
    <header
      className={`
        fixed top-0 h-16 flex items-center justify-between px-6 z-40
        backdrop-blur-xl bg-white/40
        border-b border-white/30 shadow-[0_5px_20px_rgba(0,0,0,0.05)]
        transition-all duration-300 ease-out
        ${sidebarOpen ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full"}
      `}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 border border-white/40 shadow-sm hover:shadow-md transition active:scale-95"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/home" className="font-semibold text-lg">
          Netziya
        </Link>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setOpenNotifications((s) => !s)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 border border-white/40 shadow-sm hover:shadow-md transition relative"
          >
            <Bell size={20} />

            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            open={openNotifications}
            onClose={() => setOpenNotifications(false)}
          />
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setOpenProfile((s) => !s)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/40 transition"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-700 text-white font-semibold">
              {renderAvatar(userAvatar, userInitial)}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold">
                {userDetails.username}
              </span>
              <span className="text-xs text-slate-500">
                {userDetails.email}
              </span>
            </div>
          </button>

          {/* Dropdown */}
          <div
            className={`
              absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border
              transition-all duration-200
              ${
                openProfile
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }
            `}
          >
            <div className="px-4 py-3">
              <div className="text-sm font-semibold">
                {userDetails.username}
              </div>
              <div className="text-xs text-gray-500">
                {userDetails.email}
              </div>
            </div>

            <div className="p-3 flex gap-2">
              <Link
                to="/settings"
                className="flex-1 text-xs border rounded-lg py-2 text-center"
              >
                Profile
              </Link>

              <button
                className="flex-1 text-xs bg-red-500 text-white rounded-lg py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}