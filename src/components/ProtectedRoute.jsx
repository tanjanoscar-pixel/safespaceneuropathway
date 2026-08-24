import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <div className="platform-loading">Loading…</div>
  if (!session) return <Navigate to="/app/login" replace />

  return children
}
