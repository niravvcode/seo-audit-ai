import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { NewAuditPage } from './pages/NewAuditPage'
import { AuditReportPage } from './pages/AuditReportPage'
import { AuditHistoryPage } from './pages/AuditHistoryPage'
import { MethodologyPage } from './pages/MethodologyPage'
import { CompetitorComparePage } from './pages/CompetitorComparePage'
import { ScheduledAuditsPage } from './pages/ScheduledAuditsPage'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="audits/new" element={<NewAuditPage />} />
            <Route path="audits/:id" element={<AuditReportPage />} />
            <Route path="audits" element={<AuditHistoryPage />} />
            <Route path="compare" element={<CompetitorComparePage />} />
            <Route path="schedules" element={<ScheduledAuditsPage />} />
            <Route path="methodology" element={<MethodologyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
