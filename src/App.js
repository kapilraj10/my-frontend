import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'
import LoginScreen from './Home/LoginScreen'
import ProjectReporting from './pages/ProjectReporting'
import FinancialAnalytics from './pages/FinancialAnalytics'
import TaskTracking from './pages/TaskTracking'
import Clients from './pages/Clients'
import Team from './pages/Team'
import Dashboard from './pages/Dashboard'
import SidebarNav from './components/SidebarNav'
import DashboardHeader from './components/DashboardHeader'
import { useAuth } from './state/AuthContext'

const App = () => {
  const [active, setActive] = useState('dashboard')
  const navigate = useNavigate()
  const { isAuthed } = useAuth()
  const location = useLocation()

  // keep sidebar selection in sync with URL
  useEffect(() => {
    const path = location.pathname
    const key =
      path.startsWith('/dashboard') ? 'dashboard' :
      path.startsWith('/projects') ? 'projects' :
      path.startsWith('/finance') ? 'finance' :
      path.startsWith('/tasks') ? 'tasks' :
      path.startsWith('/clients') ? 'clients' :
      path.startsWith('/team') ? 'team' : 'dashboard'
    setActive(key)
  }, [location.pathname])

  const handleNav = (key) => {
    setActive(key)
    const path =
      key === 'dashboard' ? '/dashboard' :
      key === 'projects' ? '/projects' :
      key === 'finance' ? '/finance' :
      key === 'tasks' ? '/tasks' :
      key === 'clients' ? '/clients' :
      key === 'team' ? '/team' : '/'
    navigate(path)
  }

  // Layout only for authenticated routes
  const AuthLayout = ({ children }) => (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav active={active} onChange={handleNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <DashboardHeader />
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )

  return (
    <Routes>
      {/* Public route: Login */}
  <Route path="/" element={!isAuthed ? <LoginScreen /> : <Navigate to="/dashboard" replace />} />

      {/* Dashboard / protected routes */}
      {isAuthed && (
        <>
          <Route
            path="/dashboard"
            element={
              <AuthLayout>
                <Dashboard />
              </AuthLayout>
            }
          />
          <Route
            path="/projects"
            element={
              <AuthLayout>
                <ProjectReporting />
              </AuthLayout>
            }
          />
          <Route
            path="/clients"
            element={
              <AuthLayout>
                <Clients />
              </AuthLayout>
            }
          />
          <Route
            path="/team"
            element={
              <AuthLayout>
                <Team />
              </AuthLayout>
            }
          />
          <Route
            path="/finance"
            element={
              <AuthLayout>
                <FinancialAnalytics />
              </AuthLayout>
            }
          />
          <Route
            path="/tasks"
            element={
              <AuthLayout>
                <TaskTracking />
              </AuthLayout>
            }
          />
        </>
      )}

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={isAuthed ? "/dashboard" : "/"} replace />} />
    </Routes>
  )
}

export default App
