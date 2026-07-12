import { Toaster } from 'sonner'
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/login/login'
import Home from './pages/home/home'
import FirstTimeSetup from './pages/firsttimelogin/Firsttimelogin'
import MainLayout from './layout/homeLayout'
import SystemSettingsLayout from './layout/SystemSettingsLayout'
import Administration from './pages/configuration/administrator/Administration'
import SMTP from './pages/configuration/smtp/SMTP'
import VehicleRegistry from './pages/fleetManagement/Fleet/fleet'
import DriverRegistry from './pages/fleetManagement/driverAndSafetyProfile/driver'
import Trip from './pages/fleetManagement/TripDispatcher/Trip'
import FuelExpenseManagement from './pages/fleetManagement/fuelAndExpense/Fuelexpensemanagement'
import Maintenance from './pages/fleetManagement/maintenance/maintenance'
import ReportLayout from './layout/ReportLayout'
import Fuelcosting from './pages/fleetManagement/analytics/fuelcosting'

function App() {

  return (
    <>
      {/* Toaster must be outside Routes */}
      <Toaster
        position="top-right"
        richColors
        expand
        closeButton
        toastOptions={{
          style: {
            fontSize: "15px",
            padding: "16px",
            minWidth: "380px"
          }
        }}
      />

      <Routes>
        {/* Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resetuser" element={<FirstTimeSetup />} />

        {/* Home */}
        <Route
          path="/home"
          element={
              <MainLayout>
                <Home />
              </MainLayout>
          }
        />

        <Route
          path="/admin-panel"
          element={
              <SystemSettingsLayout />
          }
        >
          <Route index element={<Navigate to="administration" replace />} />
          <Route path="administration" element={<Administration />} />
          <Route path="smtp" element={<SMTP />} />
        </Route>


        {/*Fleet */}
        <Route path="/fleet"
          element={
              <MainLayout>
                <VehicleRegistry />
              </MainLayout>
            }
        />

        <Route path="/drivers"
          element={
              <MainLayout>
                <DriverRegistry />
              </MainLayout>
          }
        />

        <Route path="/trips"
          element={
              <MainLayout>
                <Trip />
              </MainLayout>
          }
        />

        <Route path="/fuel-expenses"
          element={
              <MainLayout>
                <FuelExpenseManagement />
              </MainLayout>
          }
        />

        <Route path="/maintenance"
          element={
              <MainLayout>
                <Maintenance />
              </MainLayout>
           }
        />


        {/* Reports (EVT Report) */}
        <Route
          path="/analytics"
          element={
              <ReportLayout />
          }
        >

          <Route path="fuelCost" element={<Fuelcosting />} />

        </Route>


      </Routes>

    </>
  )
}

export default App
