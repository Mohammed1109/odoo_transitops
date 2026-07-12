from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

import uvicorn #type: ignore

from database.database import (
    init_db,
    create_tables,
)

from services.auth import create_default_admin
import database.database as database

# -------------------------------
# Initialize Database
# -------------------------------

init_db()

# Create tables during development
create_tables()

# --------------------------------------------------
# Create Default Administrator
# --------------------------------------------------
db = database.SessionLocal()

try:
    create_default_admin(db)
finally:
    db.close()

# -------------------------------
# Create FastAPI Application
# -------------------------------

app = FastAPI(
    title="TransitOps API",
    version="1.0.0",
    description="Smart Transport Operations Platform",
)

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# React Build Path
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

# --------------------------------------------------
# Serve React Build
# --------------------------------------------------

if FRONTEND_DIST.exists():

    assets_dir = FRONTEND_DIST / "assets"

    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=assets_dir),
            name="assets",
        )

# -------------------------------
# Include Routers
# -------------------------------

from routes.auth import auth_router
# from routes.users import router as users_router
from routes.vehicles import vehicles_router
from routes.drivers import drivers_router
from routes.trips import trips_router
# from routes.maintenance import router as maintenance_router
# from routes.fuel import router as fuel_router
# from routes.expenses import router as expenses_router
# from routes.dashboard import router as dashboard_router
# from routes.reports import router as reports_router

app.include_router(auth_router, prefix="/api", tags=["Authentication"])
# app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(vehicles_router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(drivers_router, prefix="/api/drivers", tags=["Drivers"])
app.include_router(trips_router, prefix="/api/trips", tags=["Trips"])
# app.include_router(maintenance_router, prefix="/api/maintenance", tags=["Maintenance"])
# app.include_router(fuel_router, prefix="/api/fuel", tags=["Fuel"])
# app.include_router(expenses_router, prefix="/api/expenses", tags=["Expenses"])
# app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
# app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])

# -------------------------------
# Health Check
# -------------------------------
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# React Connection
# --------------------------------------------------
if FRONTEND_DIST.exists():

    @app.get("/", include_in_schema=False)
    async def react_index():
        return FileResponse(FRONTEND_DIST / "index.html")


    @app.get("/{full_path:path}", include_in_schema=False)
    async def react_app(full_path: str):

        requested_file = FRONTEND_DIST / full_path

        if requested_file.exists() and requested_file.is_file():
            return FileResponse(requested_file)

        return FileResponse(FRONTEND_DIST / "index.html")

else:

    @app.get("/", include_in_schema=False)
    async def root():

        return JSONResponse(
            {
                "message": "Frontend build not found.",
                "hint": "Run 'npm run build' inside the frontend folder.",
            }
        )


# -------------------------------
# Run Server
# -------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )