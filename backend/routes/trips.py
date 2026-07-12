from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from database.database import get_db

# ==========================================================
# Schemas
# ==========================================================

from schemas.trip import (
    TripCreate,
    TripUpdate,
    TripDispatch,
    TripComplete,
    TripCancel,
)

# ==========================================================
# Services
# ==========================================================

from services.trip import (
    create_trip,
    update_trip,
    delete_trip,
    get_trip,
    get_all_trips,
    get_draft_trips,
    get_live_trips,
    trip_statistics,
    dispatch_trip,
    complete_trip,
    cancel_trip,
)

trips_router = APIRouter()


# ==========================================================
# Create Trip (Draft)
# ==========================================================

@trips_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Trip",
)
def create_new_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
):
    return create_trip(
        db=db,
        payload=payload,
    )


# ==========================================================
# Get All Trips
# ==========================================================

@trips_router.get(
    "/",
    summary="Get All Trips",
)
def list_trips(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    return get_all_trips(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        status=status_filter,
    )


# ==========================================================
# Draft Trips
# ==========================================================

@trips_router.get(
    "/draft/list",
    summary="Draft Trips",
)
def draft_trips(
    db: Session = Depends(get_db),
):
    return get_draft_trips(
        db=db,
    )


# ==========================================================
# Live Dispatcher Board
# ==========================================================

@trips_router.get(
    "/live",
    summary="Live Dispatcher Board",
)
def live_trips(
    db: Session = Depends(get_db),
):
    return get_live_trips(
        db=db,
    )


# ==========================================================
# Trip Details
# ==========================================================

@trips_router.get(
    "/{trip_id}",
    summary="Trip Details",
)
def trip_details(
    trip_id: int = Path(...),
    db: Session = Depends(get_db),
):
    return get_trip(
        db=db,
        trip_id=trip_id,
    )


# ==========================================================
# Update Draft Trip
# ==========================================================

@trips_router.put(
    "/{trip_id}",
    summary="Update Trip",
)
def edit_trip(
    trip_id: int,
    payload: TripUpdate,
    db: Session = Depends(get_db),
):
    return update_trip(
        db=db,
        trip_id=trip_id,
        payload=payload,
    )


# ==========================================================
# Delete Draft Trip
# ==========================================================

@trips_router.delete(
    "/{trip_id}",
    summary="Delete Trip",
)
def remove_trip(
    trip_id: int,
    db: Session = Depends(get_db),
):
    return delete_trip(
        db=db,
        trip_id=trip_id,
    )


# ==========================================================
# Dispatch Trip
# ==========================================================

@trips_router.post(
    "/{trip_id}/dispatch",
    summary="Dispatch Trip",
)
def dispatch(
    trip_id: int,
    payload: TripDispatch,
    db: Session = Depends(get_db),
):
    return dispatch_trip(
        db=db,
        trip_id=trip_id,
        payload=payload,
    )


# ==========================================================
# Complete Trip
# ==========================================================

@trips_router.post(
    "/{trip_id}/complete",
    summary="Complete Trip",
)
def complete(
    trip_id: int,
    payload: TripComplete,
    db: Session = Depends(get_db),
):
    return complete_trip(
        db=db,
        trip_id=trip_id,
        payload=payload,
    )


# ==========================================================
# Cancel Trip
# ==========================================================

@trips_router.post(
    "/{trip_id}/cancel",
    summary="Cancel Trip",
)
def cancel(
    trip_id: int,
    payload: TripCancel,
    db: Session = Depends(get_db),
):
    return cancel_trip(
        db=db,
        trip_id=trip_id,
        payload=payload,
    )


# ==========================================================
# Dashboard Statistics
# ==========================================================

@trips_router.get(
    "/statistics/summary",
    summary="Trip Statistics",
)
def statistics(
    db: Session = Depends(get_db),
):
    return trip_statistics(
        db=db,
    )