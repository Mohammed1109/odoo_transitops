# 🚛 TransitOps

> Smart Transport Operations Platform

TransitOps is a modern fleet and transport management platform built during an **8-hour Hackathon**. The platform is designed to digitize transport operations by managing vehicles, drivers, trips, maintenance, authentication, and operational workflows through a centralized web application.

The project follows a scalable full-stack architecture with a FastAPI backend, PostgreSQL database, and React frontend.

---

# 📌 Features

## 🔐 Authentication & Authorization

- JWT Authentication
- Secure Login
- Login using **Username or Email**
- Password Hashing (bcrypt)
- Role-Based Access Control (RBAC)
- Protected APIs

---

## 👥 User & Role Management

- User Management
- Role Management
- Admin Protected Routes
- Active / Inactive Users
- First Login Support

---

## 🚚 Vehicle Management

- Vehicle Registration
- Vehicle CRUD Operations
- Vehicle Status Management
- Vehicle Location Tracking
- Vehicle Availability
- Vehicle Statistics
- Vehicle Dropdown APIs
- Soft Delete

Vehicle Statuses

- Available
- On Trip
- In Shop
- Retired

---

## 👨‍✈️ Driver Management

Frontend and Backend structure completed.

Driver Statuses

- Available
- On Trip
- Off Duty
- Suspended

Additional Driver Tracking Support

- Driver Location Tracking
- Safety Information
- License Details
- Driver Availability

---

## 🛣 Trip Management

Backend architecture prepared with support for:

- Trip Creation
- Vehicle Assignment
- Driver Assignment
- Cargo Validation
- Priority Management

Trip Statuses

- Draft
- Dispatched
- Completed
- Cancelled

Trip Priorities

- Low
- Normal
- High
- Urgent

---

## 🔧 Maintenance Management

Backend implementation includes:

- Create Maintenance
- Update Maintenance
- Delete Maintenance
- Start Maintenance
- Complete Maintenance
- Cancel Maintenance
- Maintenance Dashboard Statistics

Automatic Vehicle Status Handling

- Available → In Shop
- In Shop → Available

Maintenance Statuses

- Pending
- In Progress
- Completed
- Cancelled

Maintenance Priorities

- Low
- Normal
- High
- Critical

---

## 📊 Dashboard

Frontend dashboard has been designed with support for:

- Vehicle Statistics
- Driver Statistics
- Trip Statistics
- Maintenance Statistics
- Fleet Overview

Backend APIs are partially integrated.

---

# 🏗 Project Architecture

## Backend

- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- JWT Authentication
- Passlib (bcrypt)
- Pydantic
- Alembic Ready Structure

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Axios

---

# 📁 Project Structure

```
backend/
    database/
    middleware/
    routes/
    schemas/
    services/
    utils/
    constants/
    ---

frontend/
    src/
        components/
        pages/
        services/

    ---
```

---

# ⚙ Business Rules Implemented

- Unique Vehicle Registration Number
- JWT Protected APIs
- Role Based Authorization
- Soft Delete Support
- Vehicle Status Management
- Maintenance Status Workflow
- Automatic Vehicle Status Transition during Maintenance
- Username or Email Login
- Validation for Duplicate Records

---

# 🚧 Current Project Status

### Completed

- Authentication
- JWT
- RBAC
- Role Management
- Vehicle Module Backend
- Driver Module Structure
- Trip Module Structure
- Maintenance Module Backend
- Frontend Screens
- Dashboard UI
- API Structure
- Database Models

### In Progress

- Frontend ↔ Backend API Integration
- Driver CRUD Integration
- Trip Workflow Integration
- Dashboard Live Data
- Reports & Analytics

---

# 🛠 Installation

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 2. Navigate to Backend

```bash
cd backend
```

---

## 3. Create Virtual Environment

Windows

```bash
python -m venv .venv
```

Activate

```bash
.venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv .venv

source .venv/bin/activate
```

---

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 5. Configure Environment

Create a `.env` file inside the backend folder.

Example

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=transitops
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Update the values according to your PostgreSQL installation.

---

## 6. Create PostgreSQL Database

Open PostgreSQL and manually create a database.

Example

```sql
CREATE DATABASE transitops;
```

---

## 7. Run Backend

```bash
python main.py
```

or

```bash
uvicorn main:app --reload
```

---

## 8. Start Frontend

Open another terminal.

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Default Admin

```
Username : admin

Password : Admin@123
```

or login using

```
Email : admin@transitops.local

Password : Admin@123
```

---

# 📈 Future Enhancements

- Fuel Management
- Expense Tracking
- PDF Reports
- CSV Export
- Email Notifications
- Driver License Expiry Alerts
- Live GPS Tracking
- Fleet Analytics
- Revenue & ROI Dashboard
- Dark Mode

---

# 👨‍💻 Team

Developed as part of the TransitOps Hackathon Project.

---

# 📄 License

This project was developed for educational and hackathon purposes.