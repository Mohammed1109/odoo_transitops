import React from "react";

// ==========================================================================
// TYPES
// ==========================================================================

export interface SelectOption {
  label: string;
  value: string;
}

const VEHICLE_UNIT_OPTIONS: SelectOption[] = [
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Ton", value: "ton" },
  { label: "Pounds (lbs)", value: "lbs" },
  { label: "Litres", value: "ltr" },
  { label: "Pieces", value: "pcs" },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { label: "Low", value: "Low" },
  { label: "Normal", value: "Normal" },
  { label: "High", value: "High" },
  { label: "Urgent", value: "Urgent" },
];

const TRIP_STATUS_OPTIONS: SelectOption[] = [
  { label: "Draft", value: "Draft" },
  { label: "Dispatched", value: "Dispatched" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

interface TripFormFieldsProps {
  // ==========================================================
  // TRIP IDENTIFICATION
  // ==========================================================
  tripNumber: string;
  setTripNumber: React.Dispatch<React.SetStateAction<string>>;

  vehicleId: string;
  setVehicleId: React.Dispatch<React.SetStateAction<string>>;
  vehicleOptions?: SelectOption[];

  driverId: string;
  setDriverId: React.Dispatch<React.SetStateAction<string>>;
  driverOptions?: SelectOption[];

  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;

  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // ROUTE INFORMATION
  // ==========================================================
  source: string;
  setSource: React.Dispatch<React.SetStateAction<string>>;

  destination: string;
  setDestination: React.Dispatch<React.SetStateAction<string>>;

  intermediateStop: string;
  setIntermediateStop: React.Dispatch<React.SetStateAction<string>>;

  plannedDistanceKm: string;
  setPlannedDistanceKm: React.Dispatch<React.SetStateAction<string>>;

  actualDistanceKm: string;
  setActualDistanceKm: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // CARGO
  // ==========================================================
  cargoName: string;
  setCargoName: React.Dispatch<React.SetStateAction<string>>;

  cargoDescription: string;
  setCargoDescription: React.Dispatch<React.SetStateAction<string>>;

  cargoWeight: string;
  setCargoWeight: React.Dispatch<React.SetStateAction<string>>;

  cargoUnit: string;
  setCargoUnit: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // CUSTOMER
  // ==========================================================
  customerName: string;
  setCustomerName: React.Dispatch<React.SetStateAction<string>>;

  customerPhone: string;
  setCustomerPhone: React.Dispatch<React.SetStateAction<string>>;

  customerEmail: string;
  setCustomerEmail: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // ODOMETER & GPS
  // ==========================================================
  startOdometer: string;
  setStartOdometer: React.Dispatch<React.SetStateAction<string>>;

  endOdometer: string;
  setEndOdometer: React.Dispatch<React.SetStateAction<string>>;

  startLatitude: string;
  setStartLatitude: React.Dispatch<React.SetStateAction<string>>;

  startLongitude: string;
  setStartLongitude: React.Dispatch<React.SetStateAction<string>>;

  endLatitude: string;
  setEndLatitude: React.Dispatch<React.SetStateAction<string>>;

  endLongitude: string;
  setEndLongitude: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // TIME / SCHEDULE
  // ==========================================================
  scheduledDate: string;
  setScheduledDate: React.Dispatch<React.SetStateAction<string>>;

  dispatchTime: string;
  setDispatchTime: React.Dispatch<React.SetStateAction<string>>;

  estimatedArrival: string;
  setEstimatedArrival: React.Dispatch<React.SetStateAction<string>>;

  completionTime: string;
  setCompletionTime: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // FUEL
  // ==========================================================
  estimatedFuel: string;
  setEstimatedFuel: React.Dispatch<React.SetStateAction<string>>;

  actualFuel: string;
  setActualFuel: React.Dispatch<React.SetStateAction<string>>;

  fuelCost: string;
  setFuelCost: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // EXPENSES
  // ==========================================================
  tollCost: string;
  setTollCost: React.Dispatch<React.SetStateAction<string>>;

  parkingCost: string;
  setParkingCost: React.Dispatch<React.SetStateAction<string>>;

  otherExpense: string;
  setOtherExpense: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // DISPATCH & NOTES
  // ==========================================================
  dispatchedBy: string;
  setDispatchedBy: React.Dispatch<React.SetStateAction<string>>;

  dispatchNotes: string;
  setDispatchNotes: React.Dispatch<React.SetStateAction<string>>;

  completionNotes: string;
  setCompletionNotes: React.Dispatch<React.SetStateAction<string>>;

  cancellationReason: string;
  setCancellationReason: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // SYSTEM
  // ==========================================================
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;

  // ==========================================================
  // FORM STATE
  // ==========================================================
  formLoading: boolean;
}

// ==========================================================================
// COMPONENT
// ==========================================================================

const TripFormFields = ({
  // TRIP IDENTIFICATION
  tripNumber,
  setTripNumber,

  vehicleId,
  setVehicleId,
  vehicleOptions = [],

  driverId,
  setDriverId,
  driverOptions = [],

  priority,
  setPriority,

  status,
  setStatus,

  // ROUTE INFORMATION
  source,
  setSource,

  destination,
  setDestination,

  intermediateStop,
  setIntermediateStop,

  plannedDistanceKm,
  setPlannedDistanceKm,

  actualDistanceKm,
  setActualDistanceKm,

  // CARGO
  cargoName,
  setCargoName,

  cargoDescription,
  setCargoDescription,

  cargoWeight,
  setCargoWeight,

  cargoUnit,
  setCargoUnit,

  // CUSTOMER
  customerName,
  setCustomerName,

  customerPhone,
  setCustomerPhone,

  customerEmail,
  setCustomerEmail,

  // ODOMETER & GPS
  startOdometer,
  setStartOdometer,

  endOdometer,
  setEndOdometer,

  startLatitude,
  setStartLatitude,

  startLongitude,
  setStartLongitude,

  endLatitude,
  setEndLatitude,

  endLongitude,
  setEndLongitude,

  // TIME / SCHEDULE
  scheduledDate,
  setScheduledDate,

  dispatchTime,
  setDispatchTime,

  estimatedArrival,
  setEstimatedArrival,

  completionTime,
  setCompletionTime,

  // FUEL
  estimatedFuel,
  setEstimatedFuel,

  actualFuel,
  setActualFuel,

  fuelCost,
  setFuelCost,

  // EXPENSES
  tollCost,
  setTollCost,

  parkingCost,
  setParkingCost,

  otherExpense,
  setOtherExpense,

  // DISPATCH & NOTES
  dispatchedBy,
  setDispatchedBy,

  dispatchNotes,
  setDispatchNotes,

  completionNotes,
  setCompletionNotes,

  cancellationReason,
  setCancellationReason,

  // SYSTEM
  isActive,
  setIsActive,

  // FORM STATE
  formLoading,
}: TripFormFieldsProps) => {
  return (
    <div className="space-y-6 relative">
      {/* FORM LOADER */}
      {formLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* LAYER 1 : TRIP IDENTIFICATION */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-route text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Trip Identification
            </h3>

            <p className="text-xs text-gray-500">
              Core trip reference, assigned vehicle/driver, and current
              priority.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Trip Number */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Trip Number
              <span className="text-red-500"> *</span>
            </label>

            <input
              type="text"
              placeholder="e.g. TRP-1001"
              className="w-full border rounded-lg p-2 text-sm"
              value={tripNumber}
              onChange={(e) => setTripNumber(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Vehicle */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Vehicle
              <span className="text-red-500"> *</span>
            </label>

            {vehicleOptions.length > 0 ? (
              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={formLoading}
              >
                <option value="">Select Vehicle</option>
                {vehicleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter Vehicle ID"
                className="w-full border rounded-lg p-2 text-sm"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={formLoading}
              />
            )}
          </div>

          {/* Driver */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Driver
              <span className="text-red-500"> *</span>
            </label>

            {driverOptions.length > 0 ? (
              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                disabled={formLoading}
              >
                <option value="">Select Driver</option>
                {driverOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter Driver ID"
                className="w-full border rounded-lg p-2 text-sm"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                disabled={formLoading}
              />
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Priority
            </label>

            <select
              className="w-full border rounded-lg p-2 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={formLoading}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              className="w-full border rounded-lg p-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={formLoading}
            >
              {TRIP_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Trip Availability
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={formLoading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <span className="text-sm font-medium text-gray-800">
                Active Trip
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* LAYER 2 : ROUTE INFORMATION */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-map-signs text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Route Information
            </h3>

            <p className="text-xs text-gray-500">
              Origin, destination, stopovers, and distance covered on this
              trip.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Source */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Source
              <span className="text-red-500"> *</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Bengaluru"
              className="w-full border rounded-lg p-2 text-sm"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Destination */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Destination
              <span className="text-red-500"> *</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Chennai"
              className="w-full border rounded-lg p-2 text-sm"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Intermediate Stop */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Intermediate Stop(s)
            </label>

            <input
              type="text"
              placeholder="e.g. Krishnagiri, Vellore"
              className="w-full border rounded-lg p-2 text-sm"
              value={intermediateStop}
              onChange={(e) => setIntermediateStop(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Planned Distance */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Planned Distance (km)
            </label>

            <input
              type="number"
              placeholder="Enter Planned Distance"
              className="w-full border rounded-lg p-2 text-sm"
              value={plannedDistanceKm}
              onChange={(e) => setPlannedDistanceKm(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Actual Distance */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Actual Distance (km)
            </label>

            <input
              type="number"
              placeholder="Enter Actual Distance"
              className="w-full border rounded-lg p-2 text-sm"
              value={actualDistanceKm}
              onChange={(e) => setActualDistanceKm(e.target.value)}
              disabled={formLoading}
            />
          </div>
        </div>
      </div>

      {/* LAYER 3 : CARGO & CUSTOMER */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-box text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Cargo & Customer
            </h3>

            <p className="text-xs text-gray-500">
              What is being carried, and who the trip is being carried out
              for.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Cargo */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Cargo Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cargo Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cargo Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Electronics"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={cargoName}
                  onChange={(e) => setCargoName(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Cargo Weight */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cargo Weight
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="number"
                  placeholder="Enter Weight"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Cargo Unit */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cargo Unit
                </label>

                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={cargoUnit}
                  onChange={(e) => setCargoUnit(e.target.value)}
                  disabled={formLoading}
                >
                  {VEHICLE_UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cargo Description */}
              <div className="lg:col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Cargo Description
                </label>

                <input
                  type="text"
                  placeholder="Enter Cargo Description"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Customer Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Customer Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Customer Name
                </label>

                <input
                  type="text"
                  placeholder="Enter Customer Name"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Customer Phone
                </label>

                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Customer Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Customer Email
                </label>

                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 4 : ODOMETER & GPS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-satellite-dish text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Odometer & GPS
            </h3>

            <p className="text-xs text-gray-500">
              Start/end odometer readings and GPS coordinates for the trip.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Odometer */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Odometer Readings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Odometer */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Start Odometer
                </label>

                <input
                  type="number"
                  placeholder="Enter Start Odometer"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={startOdometer}
                  onChange={(e) => setStartOdometer(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* End Odometer */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  End Odometer
                </label>

                <input
                  type="number"
                  placeholder="Enter End Odometer"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>
          </div>

          {/* GPS */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              GPS Coordinates
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Start Latitude */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Start Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 12.9716"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={startLatitude}
                  onChange={(e) => setStartLatitude(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Start Longitude */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Start Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 77.5946"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={startLongitude}
                  onChange={(e) => setStartLongitude(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* End Latitude */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  End Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 13.0827"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={endLatitude}
                  onChange={(e) => setEndLatitude(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* End Longitude */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  End Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 80.2707"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={endLongitude}
                  onChange={(e) => setEndLongitude(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 5 : SCHEDULE & TIMING */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-calendar-alt text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Schedule & Timing
            </h3>

            <p className="text-xs text-gray-500">
              Planned schedule alongside actual dispatch and completion
              timestamps.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Scheduled Date */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Scheduled Date
            </label>

            <input
              type="date"
              className="w-full border rounded-lg p-2 text-sm"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Dispatch Time */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Dispatch Time
            </label>

            <input
              type="datetime-local"
              className="w-full border rounded-lg p-2 text-sm"
              value={dispatchTime}
              onChange={(e) => setDispatchTime(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Estimated Arrival */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Estimated Arrival
            </label>

            <input
              type="datetime-local"
              className="w-full border rounded-lg p-2 text-sm"
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Completion Time */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Completion Time
            </label>

            <input
              type="datetime-local"
              className="w-full border rounded-lg p-2 text-sm"
              value={completionTime}
              onChange={(e) => setCompletionTime(e.target.value)}
              disabled={formLoading}
            />
          </div>
        </div>
      </div>

      {/* LAYER 6 : FUEL & EXPENSES */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-gas-pump text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Fuel & Expenses
            </h3>

            <p className="text-xs text-gray-500">
              Fuel consumption estimates and additional costs incurred during
              the trip.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Fuel */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Fuel
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Estimated Fuel */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Estimated Fuel (L)
                </label>

                <input
                  type="number"
                  placeholder="Enter Estimated Fuel"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={estimatedFuel}
                  onChange={(e) => setEstimatedFuel(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Actual Fuel */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Actual Fuel (L)
                </label>

                <input
                  type="number"
                  placeholder="Enter Actual Fuel"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={actualFuel}
                  onChange={(e) => setActualFuel(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Fuel Cost */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Fuel Cost
                </label>

                <input
                  type="number"
                  placeholder="Enter Fuel Cost"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Other Expenses
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Toll Cost */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Toll Cost
                </label>

                <input
                  type="number"
                  placeholder="Enter Toll Cost"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={tollCost}
                  onChange={(e) => setTollCost(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Parking Cost */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Parking Cost
                </label>

                <input
                  type="number"
                  placeholder="Enter Parking Cost"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={parkingCost}
                  onChange={(e) => setParkingCost(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Other Expense */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Other Expense
                </label>

                <input
                  type="number"
                  placeholder="Enter Other Expense"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={otherExpense}
                  onChange={(e) => setOtherExpense(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 7 : DISPATCH & NOTES */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-clipboard-list text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Dispatch & Notes
            </h3>

            <p className="text-xs text-gray-500">
              Who dispatched the trip, along with dispatch, completion, and
              cancellation remarks.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Dispatched By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Dispatched By
              </label>

              <input
                type="text"
                placeholder="Enter Dispatcher Name"
                className="w-full border rounded-lg p-2 text-sm"
                value={dispatchedBy}
                onChange={(e) => setDispatchedBy(e.target.value)}
                disabled={formLoading}
              />
            </div>
          </div>

          {/* Dispatch Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Dispatch Notes
            </label>

            <textarea
              rows={2}
              placeholder="Enter Dispatch Notes"
              className="w-full border rounded-lg p-2 text-sm"
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Completion Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Completion Notes
            </label>

            <textarea
              rows={2}
              placeholder="Enter Completion Notes"
              className="w-full border rounded-lg p-2 text-sm"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              disabled={formLoading}
            />
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Cancellation Reason
            </label>

            <textarea
              rows={2}
              placeholder="Enter Cancellation Reason (if any)"
              className="w-full border rounded-lg p-2 text-sm"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              disabled={formLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripFormFields;