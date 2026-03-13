import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages (created in Stage 8)
import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import Contacts      from './pages/Contacts'
import CreateTracking from './pages/CreateTracking'
import TrackingLink  from './pages/TrackingLink'
import LiveMap       from './pages/LiveMap'

// Components
import Navbar         from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen  from './components/LoadingScreen'

function App() {
  const { loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />

          {/* Public tracking page — target user opens link */}
          <Route path="/track/:token" element={<TrackingLink />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/contacts"          element={<Contacts />} />
            <Route path="/tracking/create"   element={<CreateTracking />} />
            <Route path="/tracking/map/:token" element={<LiveMap />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
