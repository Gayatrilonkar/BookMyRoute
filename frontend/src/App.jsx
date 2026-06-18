import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import MainLayout from './components/common/MainLayout'
import AdminLayout from './components/admin/AdminLayout'

import HomePage           from './pages/HomePage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import SearchPage         from './pages/SearchPage'
import BookingPage        from './pages/BookingPage'
import MyBookingsPage     from './pages/MyBookingsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminBuses     from './pages/admin/AdminBuses'
import AdminRoutes    from './pages/admin/AdminRoutes'
import AdminSchedules from './pages/admin/AdminSchedules'
import AdminBookings  from './pages/admin/AdminBookings'
import AdminPayments  from './pages/admin/AdminPayments'
import AdminSupport   from './pages/admin/AdminSupport'
import AdminSettings  from './pages/admin/AdminSettings'
import ProfilePage        from './pages/ProfilePage'
import HelpDeskPage       from './pages/HelpDeskPage'
import RouteDetailsPage   from './pages/RouteDetailsPage'
import BookingConfirmationPage from './pages/BookingConfirmationPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public App with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/help"     element={<HelpDeskPage />} />

          {/* Passenger-protected */}
          <Route path="/search" element={
            <ProtectedRoute><SearchPage /></ProtectedRoute>
          } />
          <Route path="/routes/:routeId" element={
            <ProtectedRoute><RouteDetailsPage /></ProtectedRoute>
          } />
          <Route path="/book" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
          } />
          <Route path="/booking-confirmation/:ref" element={
            <ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Admin Portal with Admin Layout */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="buses" element={<AdminBuses />} />
          <Route path="routes" element={<AdminRoutes />} />
          <Route path="schedules" element={<AdminSchedules />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
