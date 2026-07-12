import { Toaster } from 'sonner'
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './hook/UseGloablProtectedRoute'
import MainLayout from './hook/homeLayout'
import Login from './pages/login/login'
import Home from './pages/home/home'

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
        {/* <Route path="/resetuser" element={<ReseUserPage />} /> */}

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

      </Routes>

    </>
  )
}

export default App
