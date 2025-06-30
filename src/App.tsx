import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import SearchPage from './pages/SearchPage'
import PipelinePage from './pages/PipelinePage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import MyStatsPage from './pages/MyStatsPage'
import LoadingSpinner from './components/common/LoadingSpinner'
import LoginManager from './components/auth/LoginManager'

function App() {
  const { isLoading, user, session, isAuthenticated } = useAuth()

  // Debug logs to trace authentication/loading flow
  console.log('[App] Render', { isLoading, isAuthenticated, user, session })

  console.log("[App] Render", { isLoading })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary">Initializing ReelHunter...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/my-stats" element={<MyStatsPage />} />
          {/* Removed scorecards route */}
        </Routes>
      </Router>
      <LoginManager />
    </>
  )
}

export default App