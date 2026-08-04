import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { LandingPage } from './pages/LandingPage';
import { RoleSelectPage } from './pages/RoleSelectPage';
import { BillingDashboardPage } from './pages/BillingDashboardPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ClaimDetailsPage } from './pages/ClaimDetailsPage';
import { AIReviewerPage } from './pages/AIReviewerPage';
import { RejectedClaimsPage } from './pages/RejectedClaimsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PatientFeedbackPage } from './pages/PatientFeedbackPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RequireAuth } from './components/RequireAuth';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<RoleSelectPage />} />
      <Route element={<RequireAuth allowedRoles={['Billing Staff Portal']} />}>
        <Route path="/billing" element={<AppShell role="Billing Staff Portal" />}>
          <Route index element={<BillingDashboardPage />} />
          <Route path="claims" element={<ClaimsPage />} />
          <Route path="claims/:claimId" element={<ClaimDetailsPage />} />
          <Route path="ai-reviewer" element={<AIReviewerPage />} />
          <Route path="rejected" element={<RejectedClaimsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route element={<RequireAuth allowedRoles={['Patient Portal']} />}>
        <Route path="/patient" element={<AppShell role="Patient Portal" />}>
          <Route index element={<PatientDashboardPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="feedback" element={<PatientFeedbackPage />} />
        </Route>
      </Route>
      <Route element={<RequireAuth allowedRoles={['Administrator Portal']} />}>
        <Route path="/admin" element={<AppShell role="Administrator Portal" />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
  );
}