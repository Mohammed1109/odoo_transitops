import { Toaster } from 'sonner'
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './hook/UseGloablProtectedRoute'
import Login from './pages/login/login'
import Home from './pages/home/home'
import FirstTimeSetup from './pages/firsttimelogin/Firsttimelogin'
import MainLayout from './layout/homeLayout'
import SystemSettingsLayout from './layout/SystemSettingsLayout'
import Administration from './pages/configuration/administrator/Administration'
import SMTP from './pages/configuration/smtp/SMTP'

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
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute>
              <SystemSettingsLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="administration" replace />} />
          <Route path="administration" element={<Administration />} />
          <Route path="smtp" element={<SMTP />} />
        </Route>

      </Routes>

    </>
  )
}

export default App
