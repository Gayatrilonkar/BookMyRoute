import axios from 'axios'
import toast from 'react-hot-toast'

const TOKEN_KEY = 'bmr_token'
const USER_KEY = 'bmr_user'
const SESSION_EXPIRES_KEY = 'bmr_session_expires_at'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor — attach JWT ──────────────────────────
api.interceptors.request.use(config => {
  const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_KEY) || 0)
  if (!config.skipAuth && expiresAt && Date.now() > expiresAt) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(SESSION_EXPIRES_KEY)
    window.location.href = '/login'
    return Promise.reject(new axios.CanceledError('Session expired'))
  }

  const token = config.skipAuth ? null : localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — global error handling ──────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err)
    const msg = err.response?.data?.message || 'Something went wrong'
    if (err.response?.status === 401) {
      if (err.config?.allowAnonymousFallback && !err.config?._anonymousRetry) {
        const retryConfig = {
          ...err.config,
          _anonymousRetry: true,
          skipAuth: true,
          headers: { ...err.config.headers },
        }
        delete retryConfig.headers.Authorization
        return api.request(retryConfig)
      }
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(SESSION_EXPIRES_KEY)
      window.location.href = '/login'
    } else if (err.response?.status !== 404 && !err.config?.silentError) {
      toast.error(msg)
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
// POST /api/auth/register  → { name, email, password, phone }
// POST /api/auth/login     → { email, password }
// GET  /api/auth/me        → current user (JWT required)
// PUT  /api/auth/profile   → { name, phone }
// PUT  /api/auth/change-password → { currentPassword, newPassword }
export const authApi = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  me:             ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// ── Search / Schedules ────────────────────────────────────────
// GET /api/schedules/search?origin=&destination=&travelDate=&seats=
//   → ApiResponse<List<ScheduleResponse.Search>>
//     fields: scheduleId, origin, destination, departureTime, arrivalTime,
//             baseFare, availableSeats, busName, busType, amenities, durationMins
// GET /api/schedules/:id     → ApiResponse<Schedule>
// GET /api/schedules/:id/seats → ApiResponse<List<SeatInfo>>
//   SeatInfo fields: seatId, seatNumber, seatType
export const searchApi = {
  searchBuses: (params) => api.get('/schedules/search', { params }),
  getSchedule: (id)     => api.get(`/schedules/${id}`),
  getCities:   ()       => api.get('/routes/cities'),
}

export const routeApi = {
  getRoute: (id) => api.get(`/routes/${id}`),
  getRouteStops: (id) => api.get(`/routes/${id}/stops`),
}

// ── Seats ─────────────────────────────────────────────────────
// GET  /api/schedules/:scheduleId/seats  → available seats for a trip
// POST /api/schedules/:scheduleId/seats/check → { seatIds: [] }
export const seatApi = {
  getSeats: (scheduleId) => api.get(`/schedules/${scheduleId}/seats`),
}

// ── Bookings ──────────────────────────────────────────────────
// POST  /api/bookings         → BookingRequest
//   { scheduleId, paymentMethod, passengers: [{seatId, passengerName, passengerAge}] }
//   → ApiResponse<BookingResponse>
//     fields: bookingId, bookingRef, origin, destination, departureTime, arrivalTime,
//             busName, totalAmount, bookingStatus, paymentStatus, paymentMethod, bookedAt,
//             seats:[{seatNumber, seatType, passengerName, passengerAge, fare}]
// GET   /api/bookings/my      → List<BookingResponse>
// GET   /api/bookings/:ref    → BookingResponse
// GET   /api/bookings/:ref/pdf → PDF blob
// PATCH /api/bookings/:ref/cancel
export const bookingApi = {
  createBooking: (data)   => api.post('/bookings', data),
  getMyBookings: ()       => api.get('/bookings/my'),
  searchMyBookings: (params) => api.get('/bookings/my/search', { params }),
  getBooking:    (ref)    => api.get(`/bookings/${ref}`),
  downloadTicket: (ref)   => api.get(`/bookings/${ref}/pdf`, { responseType: 'blob' }),
  cancelBooking: (ref)    => api.patch(`/bookings/${ref}/cancel`),
}

// Payment Gateway API (Razorpay integration)
// POST /api/payments/create-order  → { orderId, amount, currency, keyId, ... }
// POST /api/payments/verify        → BookingResponse (booking confirmed after payment)
export const paymentApi = {
  createOrder: (data)       => api.post('/payments/create-order', data),
  verifyPayment: (data)     => api.post('/payments/verify', data),
}

export const reviewApi = {
  submitReview: (data) => api.post('/bookings/reviews', data),
  updateReview: (reviewId, data) => api.put(`/bookings/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/bookings/reviews/${reviewId}`),
  getBookingReview: (bookingId) => api.get(`/bookings/reviews/booking/${bookingId}`, { silentError: true }),
  getRouteReviews: (routeId, params) => api.get(`/reviews/routes/${routeId}`, { params, skipAuth: true }),
  getRouteSummary: (routeId) => api.get(`/reviews/routes/${routeId}/summary`, { skipAuth: true }),
}

export const chatbotApi = {
  sendMessage: (data) => api.post('/chatbot/message', data, {
    allowAnonymousFallback: true,
    silentError: true,
  }),
}

export const supportApi = {
  createRequest: (data) => api.post('/support/requests', data, {
    allowAnonymousFallback: true,
    silentError: true,
  }),
  getMyRequests: () => api.get('/support/requests/my'),
}

// ── Admin ─────────────────────────────────────────────────────
// GET  /api/admin/stats
// CRUD /api/buses, /api/routes, /api/schedules (ADMIN role required)
// GET  /api/bookings (ADMIN) → all bookings
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  getUsers:       (params)   => api.get('/admin/users', { params }),
  updateUser:     (id, data) => api.put(`/admin/users/${id}`, data),

  getBuses:       (params)   => api.get('/admin/buses', { params }),
  createBus:      (data)     => api.post('/admin/buses', data),
  updateBus:      (id, data) => api.put(`/admin/buses/${id}`, data),
  toggleBus:      (id)       => api.patch(`/admin/buses/${id}/toggle`),

  getRoutes:      (params)   => api.get('/admin/routes', { params }),
  createRoute:    (data)     => api.post('/admin/routes', data),
  updateRoute:    (id, data) => api.put(`/admin/routes/${id}`, data),
  deleteRoute:    (id)       => api.delete(`/admin/routes/${id}`),

  getSchedules:   (params)   => api.get('/admin/schedules', { params }),
  createSchedule: (data)     => api.post('/admin/schedules', data),
  updateSchedule: (id, data) => api.put(`/admin/schedules/${id}`, data),
  deactivateSchedule: (id)   => api.delete(`/schedules/${id}`),

  getAllBookings:  (params)   => api.get('/admin/bookings', { params }),
  getSupportRequests: ()      => api.get('/support/requests'),
  replySupportRequest: (ticketRef, reply) => api.post(`/support/requests/${ticketRef}/reply`, { reply }),

  requestOtp:     (data)     => api.post('/admin/otp/request', data),
  verifyOtp:      (data)     => api.post('/admin/otp/verify', data),

  getSettings:    ()         => api.get('/admin/settings'),
  updateSettings: (data)     => api.put('/admin/settings', data),
  getLogs:        ()         => api.get('/admin/logs'),
}

export default api