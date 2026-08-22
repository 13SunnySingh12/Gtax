import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/lib/protectedRoute';
import { AppGate } from '@/bootstrap/AppGate';
import { AppShell } from '@/layouts/AppShell';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Income from '@/pages/Income';
import Expenses from '@/pages/Expenses';
import TaxCalculator from '@/pages/TaxCalculator';
import WhatIfSimulator from '@/pages/WhatIfSimulator';
import DeadlineCalendar from '@/pages/DeadlineCalendar';
import Chatbot from '@/pages/Chatbot';
import Profile from '@/pages/Profile';
import Forbidden from '@/pages/errors/Forbidden';
import NotFound from '@/pages/errors/NotFound';

export default function App() {
  return (
    <Routes>
      {/* ---- Public ---- */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* ---- Authenticated, pre-onboarding (session only, not gated) ---- */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* ---- Gated app: health + session + profile + onboarding must pass ---- */}
      <Route element={<AppGate />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/tax" element={<TaxCalculator />} />
          <Route path="/tax/what-if" element={<WhatIfSimulator />} />
          <Route path="/deadlines" element={<DeadlineCalendar />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ---- Errors / fallback ---- */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
