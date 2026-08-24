import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Journey from './Journey.jsx'
import './App.css'
import './platform.css'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PlatformLayout } from './components/PlatformLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ChildWorkspacePage } from './pages/ChildWorkspacePage'
import { ObservationsPage } from './pages/ObservationsPage'
import { NewObservationPage } from './pages/NewObservationPage'
import { PatternsPage } from './pages/PatternsPage'
import { SupportPlanPage } from './pages/SupportPlanPage'
import { EvidenceSummaryPage } from './pages/EvidenceSummaryPage'
import { TeamAccessPage } from './pages/TeamAccessPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Journey />} />
          <Route path="/app/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <PlatformLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="children/:childId" element={<ChildWorkspacePage />}>
              <Route index element={<ObservationsPage />} />
              <Route path="observations/new" element={<NewObservationPage />} />
              <Route path="patterns" element={<PatternsPage />} />
              <Route path="support-plan" element={<SupportPlanPage />} />
              <Route path="evidence-summary" element={<EvidenceSummaryPage />} />
              <Route path="team-access" element={<TeamAccessPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
