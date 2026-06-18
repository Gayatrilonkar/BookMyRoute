import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { FaCheckCircle, FaDownload } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { bookingApi } from '../services/api'
import { motion } from 'framer-motion'

export default function BookingConfirmationPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { ref } = useParams()
  const [downloading, setDownloading] = useState(false)

  // If accessed directly without state, we fallback to just showing the reference 
  // or ideally fetch it from backend. For simplicity, we use the state passed from BookingPage.
  const confirmed = state?.confirmedData

  if (!confirmed) {
    return <Navigate to="/my-bookings" replace />
  }

  const {
    amount,
    emailSent,
    emailMessage,
    paymentId,
    routeInfo,
    busName,
    depTime,
    pickupStopName,
    pickupSubLocationName,
    dropStopName,
    dropSubLocationName,
    seats,
    passengerCount
  } = confirmed

  const handleDownloadTicket = async () => {
    if (!ref) return
    setDownloading(true)
    try {
      const response = await bookingApi.downloadTicket(ref)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `BookMyRoute-${ref}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-shell flex items-center justify-center p-4"
    >
      <div className="card w-full max-w-lg p-8 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success text-white"
        >
          <FaCheckCircle className="text-4xl" />
        </motion.div>
        <h1 className="text-3xl font-bold text-secondary">Booking confirmed</h1>
        <p className="mt-2 text-[15px] text-text-muted">
          {emailSent
            ? `Your ticket has been sent to ${user?.email || 'your email'}.`
            : emailMessage || 'Email notification was not sent. You can still download your ticket PDF.'}
        </p>

        <div className="my-6 rounded-xl bg-secondary p-4 shadow-sm border border-secondary/10">
          <p className="font-mono text-xl font-bold tracking-wider text-warning">{ref}</p>
          <p className="mt-1 text-xs text-text-muted uppercase tracking-wider font-bold">Booking reference</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 text-left">
          {[
            ['Route', routeInfo],
            ['Bus', busName],
            ['Departure', depTime],
            ['Boarding Point', `${pickupStopName || ''} ${pickupSubLocationName ? `(${pickupSubLocationName})` : ''}`.trim() || 'N/A'],
            ['Dropping Point', `${dropStopName || ''} ${dropSubLocationName ? `(${dropSubLocationName})` : ''}`.trim() || 'N/A'],
            ['Seats', seats],
            ['Passengers', passengerCount],
            ['Total', `₹${amount}`],
            ...(paymentId ? [['Payment ID', paymentId]] : []),
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface border border-border-light p-3 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
              <p className="mt-1 text-[15px] font-bold text-secondary">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <button onClick={handleDownloadTicket} disabled={downloading} className="btn-primary justify-center">
            <FaDownload className="mr-2"/> {downloading ? 'Downloading...' : 'Ticket PDF'}
          </button>
          <button onClick={() => navigate('/my-bookings')} className="btn-outline justify-center">My bookings</button>
          <button onClick={() => navigate('/search')} className="btn-outline justify-center">Book another</button>
        </div>
      </div>
    </motion.div>
  )
}
