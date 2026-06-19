import { useEffect, useState } from 'react'
import { FaExclamationTriangle, FaTimes, FaSpinner, FaRupeeSign } from 'react-icons/fa'
import { bookingApi } from '../../services/api'
import toast from 'react-hot-toast'

export default function CancelConfirmationModal({ booking, onClose, onConfirm, isCancelling }) {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const fetchQuote = async () => {
      try {
        const { data } = await bookingApi.getCancellationQuote(booking.bookingRef)
        if (mounted) {
          setQuote(data.data)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || 'Failed to fetch cancellation details')
          setLoading(false)
        }
      }
    }
    fetchQuote()
    return () => { mounted = false }
  }, [booking.bookingRef])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/70 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && !isCancelling && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border-medium bg-surface shadow-xl">
        <div className="flex items-center justify-between bg-error px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-xl" />
            <span className="font-bold">Cancel Booking</span>
          </div>
          {!isCancelling && (
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="p-6">
          <p className="text-[15px] text-secondary font-medium mb-4">
            You are about to cancel booking <strong className="font-mono text-primary">{booking.bookingRef}</strong> from {booking.origin} to {booking.destination}.
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FaSpinner className="animate-spin text-3xl text-primary opacity-50 mb-3" />
              <p className="text-sm font-medium text-text-muted">Calculating refund amount...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-error/10 p-4 text-sm text-error font-medium border border-error/20 mb-5">
              {error}
            </div>
          ) : (
            <div className="mb-6 rounded-xl border border-border-medium bg-surface shadow-sm overflow-hidden">
              <div className="bg-secondary/5 px-4 py-2 border-b border-border-light">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Refund breakdown</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted font-medium">Total Paid</span>
                  <span className="font-bold text-secondary">₹{quote.totalFare}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-error">
                  <span className="font-medium">Cancellation Charges</span>
                  <span className="font-bold">- ₹{quote.cancellationCharges}</span>
                </div>
                <hr className="border-border-light my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-secondary">Refund Amount</span>
                  <span className="font-bold text-xl text-success flex items-center">
                    ₹{quote.refundAmount}
                  </span>
                </div>
              </div>
              <div className="bg-primary/5 px-4 py-3 border-t border-border-light">
                <p className="text-xs font-medium text-primary leading-relaxed">
                  <strong>Policy applied:</strong> {quote.refundPolicy}
                </p>
                {quote.isRefundable && (
                  <p className="text-xs font-medium text-text-muted mt-1">
                    Refunds are typically processed to the original payment method within 3-5 business days.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isCancelling}
              className="flex-1 btn-outline h-11 justify-center"
            >
              Keep Booking
            </button>
            <button
              onClick={() => onConfirm(booking.bookingRef)}
              disabled={loading || !!error || isCancelling}
              className="flex-1 btn-primary h-11 justify-center bg-error hover:bg-error-dark border-error hover:border-error-dark text-white"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
