# ==========================================================
# Vehicle Status
# ==========================================================

class VehicleStatus:

    AVAILABLE = "Available"

    ON_TRIP = "On Trip"

    IN_SHOP = "In Shop"

    RETIRED = "Retired"


# ==========================================================
# Driver Status
# ==========================================================

class DriverStatus:

    AVAILABLE = "Available"

    ON_TRIP = "On Trip"

    OFF_DUTY = "Off Duty"

    SUSPENDED = "Suspended"


# ==========================================================
# Trip Status
# ==========================================================

class TripStatus:

    DRAFT = "Draft"

    DISPATCHED = "Dispatched"

    COMPLETED = "Completed"

    CANCELLED = "Cancelled"


# ==========================================================
# Trip Priority
# ==========================================================

class TripPriority:

    LOW = "Low"

    NORMAL = "Normal"

    HIGH = "High"

    URGENT = "Urgent"