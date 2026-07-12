"use client";

/**
 * Live Fleet Map — real India map powered by Leaflet + OpenStreetMap tiles.
 *
 * Setup required in your project:
 *   npm install leaflet react-leaflet
 *
 * Next.js note: Leaflet touches `window` on import, so this component must
 * only render on the client. If you're on the App Router this file's
 * "use client" directive is enough. If you're on the Pages Router, import
 * it with next/dynamic instead:
 *
 *   const FleetLiveMap = dynamic(() => import("./FleetLiveMap"), { ssr: false });
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, CircleMarker, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import {
  Search,
  X,
  Navigation,
  Wifi,
  WifiOff,
  AlertCircle,
  Car,
  Truck,
  Fuel,
  Gauge,
  User,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
type VehicleKind = "car" | "truck";
type LatLng = [number, number];

interface Vehicle {
  id: string;
  number: string;
  kind: VehicleKind;
  driver: string;
  status: VehicleStatus;
  speedKph: number;
  fuelPct: number;
  routeLabel: string;
  waypoints: LatLng[]; // key stops; a single point means the vehicle is parked
}

/* ------------------------------------------------------------------ */
/*  Reference geography                                                */
/* ------------------------------------------------------------------ */

const INDIA_CENTER: LatLng = [22.9734, 78.6569];

const CITY_LABELS: { name: string; position: LatLng }[] = [
  { name: "Delhi", position: [28.7041, 77.1025] },
  { name: "Jaipur", position: [26.9124, 75.7873] },
  { name: "Mumbai", position: [19.076, 72.8777] },
  { name: "Pune", position: [18.5204, 73.8567] },
  { name: "Bangalore", position: [12.9716, 77.5946] },
  { name: "Hyderabad", position: [17.385, 78.4867] },
  { name: "Chennai", position: [13.0827, 80.2707] },
  { name: "Vellore", position: [12.9165, 79.1325] },
];

/* ------------------------------------------------------------------ */
/*  Mock fleet data — real routes across India                         */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<
  VehicleStatus,
  { text: string; bg: string; hex: string }
> = {
  Available: { text: "text-teal-600", bg: "bg-teal-50", hex: "#14b8a6" },
  "On Trip": { text: "text-violet-600", bg: "bg-violet-50", hex: "#7c3aed" },
  "In Shop": { text: "text-amber-600", bg: "bg-amber-50", hex: "#f59e0b" },
  Retired: { text: "text-rose-600", bg: "bg-rose-50", hex: "#ef4444" },
};

const KIND_ICON: Record<VehicleKind, typeof Car> = {
  car: Car,
  truck: Truck,
};

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    number: "TRK-12",
    kind: "truck",
    driver: "John Carter",
    status: "On Trip",
    speedKph: 58,
    fuelPct: 41,
    routeLabel: "Jaipur → Delhi",
    waypoints: [
      [26.9124, 75.7873], // Jaipur
      [27.89, 76.28], // via Behror
      [28.7041, 77.1025], // Delhi
    ],
  },
  {
    id: "v2",
    number: "VAN-05",
    kind: "car",
    driver: "Alex Mehta",
    status: "On Trip",
    speedKph: 46,
    fuelPct: 62,
    routeLabel: "Pune → Mumbai",
    waypoints: [
      [18.5204, 73.8567], // Pune
      [18.75, 73.4], // via Lonavala
      [19.076, 72.8777], // Mumbai
    ],
  },
  {
    id: "v3",
    number: "VAN-19",
    kind: "car",
    driver: "Sara Khan",
    status: "On Trip",
    speedKph: 52,
    fuelPct: 33,
    routeLabel: "Vellore → Chennai",
    waypoints: [
      [12.9165, 79.1325], // Vellore
      [12.83, 79.7], // via Kanchipuram
      [13.0827, 80.2707], // Chennai
    ],
  },
  {
    id: "v4",
    number: "MIT-08",
    kind: "truck",
    driver: "David Lee",
    status: "Available",
    speedKph: 0,
    fuelPct: 95,
    routeLabel: "Idle — Bangalore Depot",
    waypoints: [[12.9716, 77.5946]],
  },
  {
    id: "v5",
    number: "CAB-21",
    kind: "car",
    driver: "Priya Nair",
    status: "Available",
    speedKph: 0,
    fuelPct: 88,
    routeLabel: "Idle — Andheri Stand, Mumbai",
    waypoints: [[19.1197, 72.8468]],
  },
  {
    id: "v6",
    number: "TRK-33",
    kind: "truck",
    driver: "Manoj Rao",
    status: "In Shop",
    speedKph: 0,
    fuelPct: 20,
    routeLabel: "Service Bay 2 — Pune Yard",
    waypoints: [[18.55, 73.93]],
  },
  {
    id: "v7",
    number: "TRK-27",
    kind: "truck",
    driver: "Kavita Rao",
    status: "Retired",
    speedKph: 0,
    fuelPct: 0,
    routeLabel: "Decommissioned — Delhi Storage Yard",
    waypoints: [[28.55, 77.35]],
  },
];

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const VEHICLE_NUMBER_PATTERN = /^[A-Za-z0-9-]{0,15}$/;

function validateQuery(raw: string): { clean: string; error: string | null } {
  if (raw.length > 15) {
    return { clean: raw.slice(0, 15), error: "Vehicle number can be at most 15 characters." };
  }
  if (!VEHICLE_NUMBER_PATTERN.test(raw)) {
    return {
      clean: raw.replace(/[^A-Za-z0-9-]/g, ""),
      error: "Only letters, numbers, and hyphens are allowed.",
    };
  }
  return { clean: raw, error: null };
}

/* ------------------------------------------------------------------ */
/*  Route interpolation                                                */
/* ------------------------------------------------------------------ */

function densifyPath(points: LatLng[], stepsPerSegment = 30): LatLng[] {
  if (points.length < 2) return points;
  const path: LatLng[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[i + 1];
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      path.push([lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t]);
    }
  }
  path.push(points[points.length - 1]);
  return path;
}

/* ------------------------------------------------------------------ */
/*  Custom marker icon                                                 */
/* ------------------------------------------------------------------ */

function buildVehicleIcon(kind: VehicleKind, status: VehicleStatus, isSelected: boolean) {
  const Icon = KIND_ICON[kind];
  const color = STATUS_STYLES[status].hex;
  const html = renderToStaticMarkup(
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: color,
        border: isSelected ? "3px solid #111827" : "2px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.28)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon color="white" size={14} strokeWidth={2.4} />
    </div>
  );
  return L.divIcon({
    html,
    className: "fleet-vehicle-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function FleetLiveMap() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  // dense, animatable path per vehicle, computed once
  const densePaths = useMemo(() => {
    const map = new Map<string, LatLng[]>();
    for (const v of MOCK_VEHICLES) map.set(v.id, densifyPath(v.waypoints));
    return map;
  }, []);

  // advance the animation clock to simulate real-time GPS pings
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setLastSync(new Date());
    }, 350);
    return () => clearInterval(interval);
  }, [isLive]);

  // occasional mock connection blip, purely cosmetic, self-heals
  useEffect(() => {
    const blip = setInterval(() => {
      setIsLive(false);
      setTimeout(() => setIsLive(true), 1800);
    }, 30000);
    return () => clearInterval(blip);
  }, []);

  function handleQueryChange(raw: string) {
    const { clean, error } = validateQuery(raw.toUpperCase());
    setQuery(clean);
    setError(error);
  }

  const filteredVehicles = useMemo(() => {
    return MOCK_VEHICLES.filter((v) => {
      const matchesQuery = query.length === 0 || v.number.includes(query);
      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const selectedVehicle = MOCK_VEHICLES.find((v) => v.id === selectedId) ?? null;
  const highlightActive = query.length > 0 || statusFilter !== "All";
  const visibleIds = new Set(filteredVehicles.map((v) => v.id));

  const statusCounts = useMemo(() => {
    const counts: Record<VehicleStatus, number> = {
      Available: 0,
      "On Trip": 0,
      "In Shop": 0,
      Retired: 0,
    };
    for (const v of MOCK_VEHICLES) counts[v.status]++;
    return counts;
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* header */}
      <div className="flex flex-col gap-3 p-5 pb-4 border-b border-gray-100 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-800">Live Fleet Map</h2>
          <span
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isLive ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
            {isLive ? "Live" : "Reconnecting…"}
          </span>
        </div>

        {/* search */}
        <div className="w-full lg:w-80">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 transition ${
              error ? "border-rose-300 focus-within:ring-rose-200" : "border-gray-200 focus-within:ring-violet-200"
            }`}
          >
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search vehicle number, e.g. VAN-05"
              aria-label="Search vehicle by number"
              aria-invalid={!!error}
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              maxLength={15}
            />
            {query.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setError(null);
                  inputRef.current?.focus();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {error && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>
      </div>

      {/* status filter chips */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100">
        <button
          onClick={() => setStatusFilter("All")}
          className={`text-xs font-medium px-3 py-1 rounded-full border transition ${
            statusFilter === "All"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
          }`}
        >
          All ({MOCK_VEHICLES.length})
        </button>
        {(Object.keys(STATUS_STYLES) as VehicleStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition ${
              statusFilter === s
                ? `${STATUS_STYLES[s].bg} ${STATUS_STYLES[s].text} border-transparent`
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_STYLES[s].hex }} />
            {s} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {/* body: map + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px]">
        {/* map */}
        <div className="relative h-[440px] xl:h-[560px] border-b xl:border-b-0 xl:border-r border-gray-100">
          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            minZoom={4}
            maxZoom={10}
            scrollWheelZoom
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />

            {/* reference city labels */}
            {CITY_LABELS.map((c) => (
              <CircleMarker
                key={c.name}
                center={c.position}
                radius={3}
                pathOptions={{ color: "#9ca3af", fillColor: "#9ca3af", fillOpacity: 1, weight: 1 }}
              >
                <Tooltip permanent direction="top" offset={[0, -4]} className="fleet-city-label">
                  {c.name}
                </Tooltip>
              </CircleMarker>
            ))}

            {/* routes */}
            {MOCK_VEHICLES.filter((v) => v.status === "On Trip").map((v) => {
              const dense = densePaths.get(v.id)!;
              const dimmed = highlightActive && !visibleIds.has(v.id);
              const idx = tick % dense.length;
              const traveled = dense.slice(0, idx + 1);
              return (
                <div key={v.id}>
                  <Polyline
                    positions={v.waypoints}
                    pathOptions={{
                      color: STATUS_STYLES[v.status].hex,
                      weight: 2,
                      opacity: dimmed ? 0.15 : 0.35,
                      dashArray: "1 8",
                    }}
                  />
                  <Polyline
                    positions={traveled}
                    pathOptions={{
                      color: STATUS_STYLES[v.status].hex,
                      weight: 3,
                      opacity: dimmed ? 0.1 : 0.85,
                    }}
                  />
                </div>
              );
            })}

            {/* vehicle markers */}
            {MOCK_VEHICLES.map((v) => {
              const dense = densePaths.get(v.id)!;
              const moving = v.status === "On Trip";
              const idx = moving ? tick % dense.length : 0;
              const position = dense[idx];
              const dimmed = highlightActive && !visibleIds.has(v.id);
              return (
                <Marker
                  key={v.id}
                  position={position}
                  icon={buildVehicleIcon(v.kind, v.status, v.id === selectedId)}
                  opacity={dimmed ? 0.25 : 1}
                  zIndexOffset={v.id === selectedId ? 1000 : 0}
                  eventHandlers={{
                    click: () => setSelectedId(v.id === selectedId ? null : v.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -16]}>
                    {v.number}
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>

          <div className="absolute left-3 bottom-3 z-[500] flex items-center gap-1.5 text-[10px] text-gray-500 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm">
            <Clock size={10} />
            Synced {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>

          {/* selected vehicle popup */}
          {selectedVehicle && (
            <div className="absolute left-3 top-3 z-[500] w-64 bg-white rounded-xl border border-gray-100 shadow-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedVehicle.number}</p>
                  <span
                    className={`inline-flex items-center mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      STATUS_STYLES[selectedVehicle.status].bg
                    } ${STATUS_STYLES[selectedVehicle.status].text}`}
                  >
                    {selectedVehicle.status}
                  </span>
                </div>
                <button
                  aria-label="Close vehicle details"
                  onClick={() => setSelectedId(null)}
                  className="text-gray-300 hover:text-gray-500"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={12} className="text-gray-400" /> {selectedVehicle.driver}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-gray-400" /> {selectedVehicle.routeLabel}
                </div>
                <div className="flex items-center gap-2">
                  <Gauge size={12} className="text-gray-400" /> {selectedVehicle.speedKph} km/h
                </div>
                <div className="flex items-center gap-2">
                  <Fuel size={12} className="text-gray-400" /> {selectedVehicle.fuelPct}% fuel
                </div>
              </div>
            </div>
          )}
        </div>

        {/* sidebar list */}
        <div className="max-h-[440px] xl:max-h-[560px] overflow-y-auto">
          {filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 h-full py-16 px-4 text-center">
              <Search size={18} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-600">No vehicles found</p>
              <p className="text-xs text-gray-400">
                Check the vehicle number or clear filters and try again.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filteredVehicles.map((v) => {
                const Icon = KIND_ICON[v.kind];
                const style = STATUS_STYLES[v.status];
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => setSelectedId(v.id === selectedId ? null : v.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/70 transition ${
                        v.id === selectedId ? "bg-violet-50/50" : ""
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}
                      >
                        <Icon size={14} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-gray-800">{v.number}</span>
                          {v.status === "On Trip" && <Navigation size={10} className="text-violet-400" />}
                        </span>
                        <span className="block text-xs text-gray-400 truncate">
                          {v.driver} · {v.routeLabel}
                        </span>
                      </span>
                      <ChevronRight size={14} className="text-gray-300 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* minimal styling for the OSM city-name tooltips */}
      <style>{`
        .fleet-city-label {
          background: rgba(255,255,255,0.9) !important;
          border: none !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15) !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          color: #4b5563 !important;
          padding: 1px 6px !important;
        }
        .fleet-city-label::before { display: none !important; }
        .fleet-vehicle-marker { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
}