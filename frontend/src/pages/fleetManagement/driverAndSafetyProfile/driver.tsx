import { useEffect, useMemo, useState } from "react";
import SearchBar from "../../../components/utils/SearchBar";
import RefreshButton from "../../../components/utils/RefreshButton";
import ReusableTable from "../../../components/utils/ReusableTable";
import CustomDropdown from "../../../components/utils/CustomDropdown";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnWithState } from "../../../components/utils/ManageColumns";
import ManageColumns from "../../../components/utils/ManageColumns";
import FormLayout from "../../../components/utils/FormLayout";

export type LicenseCategory = "LMV" | "HMV";

export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";

export interface Driver {
  id: number;
  name: string; // "DRIVER"
  licenseNo: string; // "LICENSE NO."
  category: LicenseCategory; // "CATEGORY"
  licenseExpiry: string; // "EXPIRY" e.g. "12/2028"
  contact: string; // "CONTACT"
  tripCompletionRate: number; // "TRIP COMPL." e.g. 96 -> "96%"
  safety: DriverStatus; // "SAFETY"
  status: DriverStatus; // "STATUS"
}

// ==========================================================================
// MOCK DATA
// Replace this with a call to your drivers service, e.g.:
//   const data = await getDriversService();
//   setDrivers(data);
// ==========================================================================

const MOCK_DRIVERS: Driver[] = [
  {
    id: 1,
    name: "Alex",
    licenseNo: "DL-88213",
    category: "LMV",
    licenseExpiry: "12/2028",
    contact: "98765xxxxx",
    tripCompletionRate: 96,
    safety: "Available",
    status: "Available",
  },
  {
    id: 2,
    name: "John",
    licenseNo: "DL-44120",
    category: "HMV",
    licenseExpiry: "03/2025",
    contact: "98220xxxxx",
    tripCompletionRate: 81,
    safety: "Suspended",
    status: "Suspended",
  },
  {
    id: 3,
    name: "Priya",
    licenseNo: "DL-77031",
    category: "LMV",
    licenseExpiry: "08/2027",
    contact: "99110xxxxx",
    tripCompletionRate: 99,
    safety: "On Trip",
    status: "On Trip",
  },
  {
    id: 4,
    name: "Suresh",
    licenseNo: "DL-90045",
    category: "HMV",
    licenseExpiry: "01/2027",
    contact: "97440xxxxx",
    tripCompletionRate: 88,
    safety: "Available",
    status: "Off Duty",
  },
];

const DRIVER_CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "LMV", value: "LMV" },
  { label: "HMV", value: "HMV" },
];

const DRIVER_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Available", value: "Available" },
  { label: "On Trip", value: "On Trip" },
  { label: "Off Duty", value: "Off Duty" },
  { label: "Suspended", value: "Suspended" },
];

// Badge styling per status, matched to the reference screenshot's colors.
const STATUS_BADGE_STYLES: Record<DriverStatus, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  "On Trip": "bg-blue-100 text-blue-700",
  "Off Duty": "bg-gray-200 text-gray-600",
  Suspended: "bg-amber-100 text-amber-700",
};

const StatusBadge = ({ status }: { status: DriverStatus }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[status]}`}
  >
    {status}
  </span>
);

// Helper — a license is treated as expired once its MM/YYYY has passed.
const isLicenseExpired = (expiry: string) => {
  const [month, year] = expiry.split("/").map(Number);
  if (!month || !year) return false;
  const expiryDate = new Date(year, month, 0); // last day of that month
  return expiryDate.getTime() < Date.now();
};

const ExpiryCell = ({ expiry }: { expiry: string }) => {
  const expired = isLicenseExpired(expiry);
  return (
    <span
      className={expired ? "text-rose-600 font-semibold" : "text-gray-700"}
    >
      {expiry}
      {expired && " (Expired)"}
    </span>
  );
};

const formatTripCompletion = (value: number) => `${value}%`;

// ==========================================================================
// COMPONENT
// ==========================================================================

interface DriverFormFieldsProps {
  // ==========================================================
  // PERSONAL INFORMATION
  // ==========================================================
  firstName: string;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;

  lastName: string;
  setLastName: React.Dispatch<React.SetStateAction<string>>;

  employeeId: string;
  setEmployeeId: React.Dispatch<React.SetStateAction<string>>;

  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;

  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;

  emergencyContact: string;
  setEmergencyContact: React.Dispatch<React.SetStateAction<string>>;

  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;

  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;

  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;

  country: string;
  setCountry: React.Dispatch<React.SetStateAction<string>>;

  postalCode: string;
  setPostalCode: React.Dispatch<React.SetStateAction<string>>;

  dateOfBirth: string;
  setDateOfBirth: React.Dispatch<React.SetStateAction<string>>;

  gender: string;
  setGender: React.Dispatch<React.SetStateAction<string>>;

  bloodGroup: string;
  setBloodGroup: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // EMPLOYMENT DETAILS
  // ==========================================================
  joiningDate: string;
  setJoiningDate: React.Dispatch<React.SetStateAction<string>>;

  designation: string;
  setDesignation: React.Dispatch<React.SetStateAction<string>>;

  department: string;
  setDepartment: React.Dispatch<React.SetStateAction<string>>;

  experienceYears: string;
  setExperienceYears: React.Dispatch<React.SetStateAction<string>>;

  employeeType: string;
  setEmployeeType: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // DRIVING LICENSE
  // ==========================================================
  licenseNumber: string;
  setLicenseNumber: React.Dispatch<React.SetStateAction<string>>;

  licenseCategory: string;
  setLicenseCategory: React.Dispatch<React.SetStateAction<string>>;

  licenseIssueDate: string;
  setLicenseIssueDate: React.Dispatch<React.SetStateAction<string>>;

  licenseExpiryDate: string;
  setLicenseExpiryDate: React.Dispatch<React.SetStateAction<string>>;

  issuingAuthority: string;
  setIssuingAuthority: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // SAFETY & COMPLIANCE
  // ==========================================================
  safetyScore: string;
  setSafetyScore: React.Dispatch<React.SetStateAction<string>>;

  accidentCount: string;
  setAccidentCount: React.Dispatch<React.SetStateAction<string>>;

  violationCount: string;
  setViolationCount: React.Dispatch<React.SetStateAction<string>>;

  suspensionReason: string;
  setSuspensionReason: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // DRIVER PERFORMANCE
  // ==========================================================
  totalCompletedTrips: string;
  setTotalCompletedTrips: React.Dispatch<React.SetStateAction<string>>;

  totalDistanceKm: string;
  setTotalDistanceKm: React.Dispatch<React.SetStateAction<string>>;

  totalDrivingHours: string;
  setTotalDrivingHours: React.Dispatch<React.SetStateAction<string>>;

  averageRating: string;
  setAverageRating: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // DRIVER AVAILABILITY
  // ==========================================================
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;

  currentVehicleId: string;
  setCurrentVehicleId: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // GPS / MOBILE
  // ==========================================================
  deviceId: string;
  setDeviceId: React.Dispatch<React.SetStateAction<string>>;

  lastKnownLatitude: string;
  setLastKnownLatitude: React.Dispatch<React.SetStateAction<string>>;

  lastKnownLongitude: string;
  setLastKnownLongitude: React.Dispatch<React.SetStateAction<string>>;

  lastLocationUpdate: string;
  setLastLocationUpdate: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // REMARKS
  // ==========================================================
  remarks: string;
  setRemarks: React.Dispatch<React.SetStateAction<string>>;

  // ==========================================================
  // STATUS
  // ==========================================================
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;

  // ==========================================================
  // FORM STATE
  // ==========================================================
  formLoading: boolean;
}

const DriverFormFields = ({

  // ==========================================================
  // PERSONAL INFORMATION
  // ==========================================================
  firstName,
  setFirstName,

  lastName,
  setLastName,

  employeeId,
  setEmployeeId,

  email,
  setEmail,

  phoneNumber,
  setPhoneNumber,

  emergencyContact,
  setEmergencyContact,

  address,
  setAddress,

  city,
  setCity,

  state,
  setState,

  country,
  setCountry,

  postalCode,
  setPostalCode,

  dateOfBirth,
  setDateOfBirth,

  gender,
  setGender,

  bloodGroup,
  setBloodGroup,

  // ==========================================================
  // EMPLOYMENT DETAILS
  // ==========================================================
  joiningDate,
  setJoiningDate,

  designation,
  setDesignation,

  department,
  setDepartment,

  experienceYears,
  setExperienceYears,

  employeeType,
  setEmployeeType,

  // ==========================================================
  // DRIVING LICENSE
  // ==========================================================
  licenseNumber,
  setLicenseNumber,

  licenseCategory,
  setLicenseCategory,

  licenseIssueDate,
  setLicenseIssueDate,

  licenseExpiryDate,
  setLicenseExpiryDate,

  issuingAuthority,
  setIssuingAuthority,

  // ==========================================================
  // SAFETY & COMPLIANCE
  // ==========================================================
  safetyScore,
  setSafetyScore,

  accidentCount,
  setAccidentCount,

  violationCount,
  setViolationCount,

  suspensionReason,
  setSuspensionReason,

  // ==========================================================
  // DRIVER PERFORMANCE
  // ==========================================================
  totalCompletedTrips,
  setTotalCompletedTrips,

  totalDistanceKm,
  setTotalDistanceKm,

  totalDrivingHours,
  setTotalDrivingHours,

  averageRating,
  setAverageRating,

  // ==========================================================
  // DRIVER AVAILABILITY
  // ==========================================================
  status,
  setStatus,

  currentVehicleId,
  setCurrentVehicleId,

  // ==========================================================
  // GPS / MOBILE
  // ==========================================================
  deviceId,
  setDeviceId,

  lastKnownLatitude,
  setLastKnownLatitude,

  lastKnownLongitude,
  setLastKnownLongitude,

  lastLocationUpdate,
  setLastLocationUpdate,

  // ==========================================================
  // REMARKS
  // ==========================================================
  remarks,
  setRemarks,

  // ==========================================================
  // SYSTEM
  // ==========================================================
  isActive,
  setIsActive,

  // ==========================================================
  // FORM STATE
  // ==========================================================
  formLoading,
}: DriverFormFieldsProps) => {

  return (
    <div className="space-y-6 relative">
      {/* FORM LOADER */}
      {formLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* LAYER 1 : */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-id-card text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Personal Information
            </h3>

            <p className="text-xs text-gray-500">
              Enter the driver's personal identification and contact details.
            </p>
          </div>
        </div>

        <div className="space-y-6">

          {/* =======================================================
        PERSONAL INFORMATION
    ======================================================= */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* First Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  First Name
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter First Name"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Name
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter Last Name"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Employee ID
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. EMP001"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="driver@example.com"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter Phone Number"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Emergency Contact
                </label>

                <input
                  type="text"
                  placeholder="Emergency Contact Number"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Address */}
              <div className="lg:col-span-3">
                <label className="text-sm font-medium text-gray-700">
                  Address
                </label>

                <textarea
                  rows={3}
                  placeholder="Enter Full Address"
                  className="w-full border rounded-lg p-2 text-sm resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* City */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  City
                </label>

                <input
                  type="text"
                  placeholder="Enter City"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* State */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  State
                </label>

                <input
                  type="text"
                  placeholder="Enter State"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Country
                </label>

                <input
                  type="text"
                  placeholder="Enter Country"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Postal Code
                </label>

                <input
                  type="text"
                  placeholder="Enter Postal Code"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Date of Birth
                </label>

                <input
                  type="date"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Gender
                </label>

                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={formLoading}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Blood Group
                </label>

                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  disabled={formLoading}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/*  LAYER 2 : */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-briefcase text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Employment & Driving License
            </h3>

            <p className="text-xs text-gray-500">
              Configure employment information and driving license details for the
              driver.
            </p>
          </div>
        </div>

        {/* =======================================================
      EMPLOYMENT DETAILS
  ======================================================= */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Employment Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Joining Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Joining Date
              </label>

              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* Designation */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Designation
              </label>

              <input
                type="text"
                placeholder="e.g. Senior Driver"
                className="w-full border rounded-lg p-2 text-sm"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>

              <input
                type="text"
                placeholder="e.g. Logistics"
                className="w-full border rounded-lg p-2 text-sm"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Experience (Years)
              </label>

              <input
                type="number"
                min={0}
                placeholder="Enter Experience"
                className="w-full border rounded-lg p-2 text-sm"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* Employee Type */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Employee Type
              </label>

              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={employeeType}
                onChange={(e) => setEmployeeType(e.target.value)}
                disabled={formLoading}
              >
                <option value="">Select Employee Type</option>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Part Time">Part Time</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

          </div>
        </div>

        {/* =======================================================
      DRIVING LICENSE
  ======================================================= */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Driving License Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

            {/* License Number */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                License Number
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="text"
                placeholder="Enter License Number"
                className="w-full border rounded-lg p-2 text-sm"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* License Category */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                License Category
                <span className="text-red-500"> *</span>
              </label>

              <select
                className="w-full border rounded-lg p-2 text-sm"
                value={licenseCategory}
                onChange={(e) => setLicenseCategory(e.target.value)}
                disabled={formLoading}
              >
                <option value="">Select License Category</option>
                <option value="LMV">LMV</option>
                <option value="HMV">HMV</option>
                <option value="MCWG">MCWG</option>
                <option value="Transport">Transport</option>
                <option value="Commercial">Commercial</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* License Issue Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                License Issue Date
              </label>

              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm"
                value={licenseIssueDate}
                onChange={(e) => setLicenseIssueDate(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* License Expiry Date */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                License Expiry Date
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm"
                value={licenseExpiryDate}
                onChange={(e) => setLicenseExpiryDate(e.target.value)}
                disabled={formLoading}
              />
            </div>

            {/* Issuing Authority */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Issuing Authority
              </label>

              <input
                type="text"
                placeholder="e.g. Regional Transport Office (RTO)"
                className="w-full border rounded-lg p-2 text-sm"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                disabled={formLoading}
              />
            </div>

          </div>
        </div>

      </div>

      {/* LAYER 3: */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-shield-alt text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Safety & Driver Performance
            </h3>

            <p className="text-xs text-gray-500">
              Configure driver safety metrics, compliance information, and performance
              statistics.
            </p>
          </div>
        </div>

        <div className="space-y-8">

          {/* =======================================================
        SAFETY & COMPLIANCE
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Safety & Compliance
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

              {/* Safety Score */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Safety Score
                </label>

                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0 - 100"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={safetyScore}
                  onChange={(e) => setSafetyScore(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Accident Count */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Accident Count
                </label>

                <input
                  type="number"
                  min={0}
                  placeholder="Enter Accident Count"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={accidentCount}
                  onChange={(e) => setAccidentCount(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Violation Count */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Violation Count
                </label>

                <input
                  type="number"
                  min={0}
                  placeholder="Enter Violation Count"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={violationCount}
                  onChange={(e) => setViolationCount(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Suspension Reason */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Suspension Reason
                </label>

                <input
                  type="text"
                  placeholder="Enter Suspension Reason"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

          {/* =======================================================
        DRIVER PERFORMANCE
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Driver Performance
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Total Completed Trips */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Completed Trips
                </label>

                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={totalCompletedTrips}
                  onChange={(e) => setTotalCompletedTrips(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Total Distance */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Total Distance (km)
                </label>

                <input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="0"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={totalDistanceKm}
                  onChange={(e) => setTotalDistanceKm(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Total Driving Hours */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Driving Hours
                </label>

                <input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="0"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={totalDrivingHours}
                  onChange={(e) => setTotalDrivingHours(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Average Rating */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Average Rating
                </label>

                <input
                  type="number"
                  min={0}
                  max={5}
                  step="0.1"
                  placeholder="0 - 5"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={averageRating}
                  onChange={(e) => setAverageRating(e.target.value)}
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* LAYER 4 :  */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-map-marker-alt text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Vehicle Assignment & GPS Information
            </h3>

            <p className="text-xs text-gray-500">
              Configure assigned vehicle, GPS device information, current location and
              additional driver remarks.
            </p>
          </div>
        </div>

        <div className="space-y-8">

          {/* =======================================================
        VEHICLE ASSIGNMENT
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Vehicle Assignment
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Current Vehicle */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Current Vehicle ID
                </label>

                <input
                  type="number"
                  placeholder="Enter Assigned Vehicle ID"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={currentVehicleId}
                  onChange={(e) => setCurrentVehicleId(e.target.value)}
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

          {/* =======================================================
        GPS / MOBILE
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              GPS / Mobile Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

              {/* Device ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Device ID
                </label>

                <input
                  type="text"
                  placeholder="Enter GPS Device ID"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Last Location Update */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Location Update
                </label>

                <input
                  type="datetime-local"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={lastLocationUpdate}
                  onChange={(e) => setLastLocationUpdate(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Latitude */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Known Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 19.0760"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={lastKnownLatitude}
                  onChange={(e) => setLastKnownLatitude(e.target.value)}
                  disabled={formLoading}
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Known Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 72.8777"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={lastKnownLongitude}
                  onChange={(e) => setLastKnownLongitude(e.target.value)}
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

          {/* =======================================================
        REMARKS
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Additional Remarks
            </h4>

            <div className="grid grid-cols-1 gap-4">

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Remarks
                </label>

                <textarea
                  rows={4}
                  placeholder="Enter any notes or remarks about the driver..."
                  className="w-full border rounded-lg p-2 text-sm resize-none"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={formLoading}
                />
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* LAYER 5 :  */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-user-check text-sm"></i>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Driver Availability & System
            </h3>

            <p className="text-xs text-gray-500">
              Configure the driver's current availability status and system settings.
            </p>
          </div>
        </div>

        <div className="space-y-8">

          {/* =======================================================
        DRIVER AVAILABILITY
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Driver Availability
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Current Status
                </label>

                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={formLoading}
                >
                  <option value="">Select Status</option>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>
          </div>

          {/* =======================================================
        SYSTEM
    ======================================================= */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              System Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Active */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Driver Status
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">

                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={formLoading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      Active Driver
                    </span>

                    <p className="text-xs text-gray-500">
                      Disable this if the driver is no longer employed or should not
                      appear in operational assignments.
                    </p>
                  </div>

                </label>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const DriverRegistry = () => {
  // ---- data state -------------------------------------------------------
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);

  // ---- filter / search state ---------------------------------------------
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ---- table state --------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [tableHeight, setTableHeight] = useState("350px");
  const [, setSelectedRows] = useState<Driver[]>([]);


  // ==========================================================
  // PERSONAL INFORMATION
  // ==========================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  // ==========================================================
  // EMPLOYMENT DETAILS
  // ==========================================================
  const [joiningDate, setJoiningDate] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [employeeType, setEmployeeType] = useState("Permanent");

  // ==========================================================
  // DRIVING LICENSE
  // ==========================================================
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [licenseIssueDate, setLicenseIssueDate] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");

  // ==========================================================
  // SAFETY & COMPLIANCE
  // ==========================================================
  const [safetyScore, setSafetyScore] = useState("100");
  const [accidentCount, setAccidentCount] = useState("0");
  const [violationCount, setViolationCount] = useState("0");
  const [suspensionReason, setSuspensionReason] = useState("");

  // ==========================================================
  // DRIVER PERFORMANCE
  // ==========================================================
  const [totalCompletedTrips, setTotalCompletedTrips] = useState("0");
  const [totalDistanceKm, setTotalDistanceKm] = useState("0");
  const [totalDrivingHours, setTotalDrivingHours] = useState("0");
  const [averageRating, setAverageRating] = useState("5");

  // ==========================================================
  // DRIVER AVAILABILITY
  // ==========================================================
  const [status, setStatus] = useState("Available");
  const [currentVehicleId, setCurrentVehicleId] = useState("");

  // ==========================================================
  // GPS / MOBILE
  // ==========================================================
  const [deviceId, setDeviceId] = useState("");
  const [lastKnownLatitude, setLastKnownLatitude] = useState("");
  const [lastKnownLongitude, setLastKnownLongitude] = useState("");
  const [lastLocationUpdate, setLastLocationUpdate] = useState("");

  // ==========================================================
  // REMARKS
  // ==========================================================
  const [remarks, setRemarks] = useState("");

  // ==========================================================
  // SYSTEM
  // ==========================================================
  const [isActive, setIsActive] = useState(true);

  // ==========================================================
  // FORM STATE
  // ==========================================================
  const [formLoading] = useState(false);

  


  // form state left as a placeholder — wire up a FormLayout + fields the
  // same way StudentFormFields is used in Fleet.tsx once you have the
  // driver create/edit form ready.
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadDrivers = async () => {
    try {
      setIsLoading(true);
      // TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 200));
      setDrivers(MOCK_DRIVERS);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load drivers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const resetForm = () => {
    // ==========================================================
    // PERSONAL INFORMATION
    // ==========================================================
    setFirstName("");
    setLastName("");
    setEmployeeId("");
    setEmail("");
    setPhoneNumber("");
    setEmergencyContact("");
    setAddress("");
    setCity("");
    setState("");
    setCountry("");
    setPostalCode("");
    setDateOfBirth("");
    setGender("");
    setBloodGroup("");

    // ==========================================================
    // EMPLOYMENT DETAILS
    // ==========================================================
    setJoiningDate("");
    setDesignation("");
    setDepartment("");
    setExperienceYears("");
    setEmployeeType("Permanent");

    // ==========================================================
    // DRIVING LICENSE
    // ==========================================================
    setLicenseNumber("");
    setLicenseCategory("");
    setLicenseIssueDate("");
    setLicenseExpiryDate("");
    setIssuingAuthority("");

    // ==========================================================
    // SAFETY & COMPLIANCE
    // ==========================================================
    setSafetyScore("100");
    setAccidentCount("0");
    setViolationCount("0");
    setSuspensionReason("");

    // ==========================================================
    // DRIVER PERFORMANCE
    // ==========================================================
    setTotalCompletedTrips("0");
    setTotalDistanceKm("0");
    setTotalDrivingHours("0");
    setAverageRating("5");

    // ==========================================================
    // DRIVER AVAILABILITY
    // ==========================================================
    setStatus("Available");
    setCurrentVehicleId("");

    // ==========================================================
    // GPS / MOBILE
    // ==========================================================
    setDeviceId("");
    setLastKnownLatitude("");
    setLastKnownLongitude("");
    setLastLocationUpdate("");

    // ==========================================================
    // REMARKS
    // ==========================================================
    setRemarks("");

    // ==========================================================
    // SYSTEM
    // ==========================================================
    setIsActive(true);
  };

  // ---- responsive table height, same approach as Fleet.tsx ---------------
  useEffect(() => {
    const calculateHeight = () => {
      const header = 220;
      const pagination = 96;
      const footer = 56;
      const gap = 12;

      const available = window.innerHeight - header - pagination - footer - gap;
      setTableHeight(`${Math.max(available, 300)}px`);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // ==========================================================================
  // TABLE COLUMNS
  // ==========================================================================
  const [columnsConfig, setColumnsConfig] = useState<ColumnWithState[]>([]);

  useEffect(() => {
    setColumnsConfig([
      {
        key: "name",
        header: "Driver",
        visible: true,
        locked: true,
        filterable: true,
        align: "left",
        render: (value: string, row: Driver) => (
          <button
            type="button"
            className="text-blue-600 hover:underline bg-transparent p-0 text-left"
            onClick={() => handleViewDriver(row)}
          >
            {value}
          </button>
        ),
      },
      {
        key: "licenseNo",
        header: "License No.",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "category",
        header: "Category",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "licenseExpiry",
        header: "Expiry",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: string) => <ExpiryCell expiry={value} />,
      },
      {
        key: "contact",
        header: "Contact",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
      },
      {
        key: "tripCompletionRate",
        header: "Trip Compl.",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: number) => formatTripCompletion(value),
      },
      {
        key: "safety",
        header: "Safety",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: DriverStatus) => <StatusBadge status={value} />,
      },
      {
        key: "status",
        header: "Status",
        visible: true,
        locked: false,
        filterable: true,
        align: "left",
        render: (value: DriverStatus) => <StatusBadge status={value} />,
      },
    ]);
  }, []);

  const visibleColumns = columnsConfig.filter((column) => column.visible);

  // ==========================================================================
  // FILTERING (category dropdown + status dropdown + driver/license search)
  // ==========================================================================
  const filteredData = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesCategory =
        categoryFilter === "All" || driver.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" || driver.status === statusFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.licenseNo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [drivers, categoryFilter, statusFilter, searchTerm]);

  // ==========================================================================
  // HANDLERS — placeholders wired for backend hookup
  // ==========================================================================
  const handleViewDriver = (row: Driver) => {
    // TODO: open a driver detail view / form in edit mode
    console.log("View driver", row);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDrivers();
    setIsRefreshing(false);
  };

  const handleEditSelected = (rows: Driver[]) => {
    if (rows.length !== 1) {
      toast.warning("Please select exactly one driver to edit.");
      return;
    }
    setSelectedRows(rows);
    setIsFormOpen(true);
    // TODO: populate form fields from rows[0], call updateDriverService()
    // on submit. Enforce: expired license or Suspended status -> block
    // from trip assignment (same rule shown in the reference design).
  };

  const handleDeleteSelected = (rows: Driver[]) => {
    if (!rows.length) {
      toast.warning("Please select driver(s) to delete.");
      return;
    }
    // TODO: confirm with Swal, call deleteDriversService(ids), then
    // await loadDrivers().
    console.log("Delete drivers", rows);
  };

  const handleFormSubmit = async () => {

  }
  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden bg-gray-100">
      {/* Filter / Search / Add Driver Bar */}
      <div className="flex justify-between items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <div className="w-40">
            <CustomDropdown
              label=""
              value={categoryFilter}
              placeholder="Category: All"
              options={DRIVER_CATEGORY_OPTIONS}
              onChange={(value) => {
                setCategoryFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="w-44">
            <CustomDropdown
              label=""
              value={statusFilter}
              placeholder="Status: All"
              options={DRIVER_STATUS_OPTIONS}
              onChange={(value) => {
                setStatusFilter(value || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Driver / License Search */}
          <div className="w-64">
            <SearchBar
              value={inputValue}
              loading={isLoading}
              placeholder="Search driver / license no..."
              onChange={(val) => {
                setInputValue(val);
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
        </div>

        <div className="flex items-center gap-3">
          {/* Add Driver */}
          <button
            onClick={() => {
              // resetForm();
              // setAdminFlowStep("admin"); // REQUIRED
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 p-2 bg-white border rounded-xl hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </button>

          <RefreshButton loading={isRefreshing} onClick={handleRefresh} />

          {/* Manage Columns */}
          <button
            className="p-2 bg-white border rounded-lg hover:bg-gray-100"
            onClick={() => setIsManageOpen(true)}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        loading={isLoading}
        tableId="DriverRegistry-Table"
        columns={visibleColumns}
        data={filteredData}
        striped
        hoverEffect
        showSelection
        emptyMessage="No drivers found"
        maxHeight={tableHeight}
        pagination={true}
        currentPage={currentPage}
        totalItems={filteredData.length}
        totalPages={Math.ceil(filteredData.length / itemsPerPage) || 1}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
        onEditSelected={(ids: (string | number)[]) => {
          const rows = filteredData.filter((row) =>
            ids.map(Number).includes(row.id)
          );
          handleEditSelected(rows);
        }}
        onDeleteSelected={(ids: (string | number)[]) => {
          const rows = filteredData.filter((row) =>
            ids.map(Number).includes(row.id)
          );
          handleDeleteSelected(rows);
        }}
      />

      {isFormOpen && (
        <FormLayout
          title="Add Driver"
          onClose={() => {
            resetForm();
            setSelectedRows([]);
            setIsFormOpen(false);
          }}
          onSubmit={handleFormSubmit}
        >
          <DriverFormFields
            // ==========================================================
            // PERSONAL INFORMATION
            // ==========================================================
            firstName={firstName}
            setFirstName={setFirstName}

            lastName={lastName}
            setLastName={setLastName}

            employeeId={employeeId}
            setEmployeeId={setEmployeeId}

            email={email}
            setEmail={setEmail}

            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}

            emergencyContact={emergencyContact}
            setEmergencyContact={setEmergencyContact}

            address={address}
            setAddress={setAddress}

            city={city}
            setCity={setCity}

            state={state}
            setState={setState}

            country={country}
            setCountry={setCountry}

            postalCode={postalCode}
            setPostalCode={setPostalCode}

            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}

            gender={gender}
            setGender={setGender}

            bloodGroup={bloodGroup}
            setBloodGroup={setBloodGroup}

            // ==========================================================
            // EMPLOYMENT DETAILS
            // ==========================================================
            joiningDate={joiningDate}
            setJoiningDate={setJoiningDate}

            designation={designation}
            setDesignation={setDesignation}

            department={department}
            setDepartment={setDepartment}

            experienceYears={experienceYears}
            setExperienceYears={setExperienceYears}

            employeeType={employeeType}
            setEmployeeType={setEmployeeType}

            // ==========================================================
            // DRIVING LICENSE
            // ==========================================================
            licenseNumber={licenseNumber}
            setLicenseNumber={setLicenseNumber}

            licenseCategory={licenseCategory}
            setLicenseCategory={setLicenseCategory}

            licenseIssueDate={licenseIssueDate}
            setLicenseIssueDate={setLicenseIssueDate}

            licenseExpiryDate={licenseExpiryDate}
            setLicenseExpiryDate={setLicenseExpiryDate}

            issuingAuthority={issuingAuthority}
            setIssuingAuthority={setIssuingAuthority}

            // ==========================================================
            // SAFETY & COMPLIANCE
            // ==========================================================
            safetyScore={safetyScore}
            setSafetyScore={setSafetyScore}

            accidentCount={accidentCount}
            setAccidentCount={setAccidentCount}

            violationCount={violationCount}
            setViolationCount={setViolationCount}

            suspensionReason={suspensionReason}
            setSuspensionReason={setSuspensionReason}

            // ==========================================================
            // DRIVER PERFORMANCE
            // ==========================================================
            totalCompletedTrips={totalCompletedTrips}
            setTotalCompletedTrips={setTotalCompletedTrips}

            totalDistanceKm={totalDistanceKm}
            setTotalDistanceKm={setTotalDistanceKm}

            totalDrivingHours={totalDrivingHours}
            setTotalDrivingHours={setTotalDrivingHours}

            averageRating={averageRating}
            setAverageRating={setAverageRating}

            // ==========================================================
            // DRIVER AVAILABILITY
            // ==========================================================
            status={status}
            setStatus={setStatus}

            currentVehicleId={currentVehicleId}
            setCurrentVehicleId={setCurrentVehicleId}

            // ==========================================================
            // GPS / MOBILE
            // ==========================================================
            deviceId={deviceId}
            setDeviceId={setDeviceId}

            lastKnownLatitude={lastKnownLatitude}
            setLastKnownLatitude={setLastKnownLatitude}

            lastKnownLongitude={lastKnownLongitude}
            setLastKnownLongitude={setLastKnownLongitude}

            lastLocationUpdate={lastLocationUpdate}
            setLastLocationUpdate={setLastLocationUpdate}

            // ==========================================================
            // REMARKS
            // ==========================================================
            remarks={remarks}
            setRemarks={setRemarks}

            // ==========================================================
            // SYSTEM
            // ==========================================================
            isActive={isActive}
            setIsActive={setIsActive}

            // ==========================================================
            // FORM STATE
            // ==========================================================
            formLoading={formLoading}
          />
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
    </div>
  );
};

export default DriverRegistry;