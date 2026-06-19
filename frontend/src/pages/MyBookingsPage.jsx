import { useEffect, useState } from 'react'
import { format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns'
import toast from 'react-hot-toast'
import { FaBus, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaDownload, FaFilter, FaMoneyBillWave, FaRegStar, FaRoute, FaSearch, FaStar, FaTimes, FaTicketAlt, FaTrash, FaUndo, FaUserFriends } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { bookingApi, reviewApi } from '../services/api'
import { useNavigate } from 'react-router-dom'
import CancelConfirmationModal from '../components/booking/CancelConfirmationModal'

function ReviewPromptCard({ booking, onRate }) {
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (booking.reviewed && booking.bookingId) {
      setLoading(true)
      reviewApi.getBookingReview(booking.bookingId)
        .then(({ data }) => setReview(data?.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setReview(null)
    }
  }, [booking.reviewed, booking.bookingId])

  if (loading) {
    return (
      <div className="rounded-xl border border-border-light bg-surface shadow-sm p-4 animate-pulse mt-5">
        <div className="h-3 bg-border-medium rounded w-1/3 mb-2"></div>
        <div className="h-5 bg-border-medium rounded w-1/4"></div>
      </div>
    )
  }

  if (review) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-4 mt-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-success mb-1">Review Submitted</p>
            <div className="flex gap-1 text-warning">
              {[1, 2, 3, 4, 5].map(v => (
                <span key={v}>{v <= review.rating ? <FaStar /> : <FaRegStar />}</span>
              ))}
            </div>
          </div>
          <button onClick={() => onRate(booking)} className="text-[13px] font-bold text-success hover:underline">
            Edit Review
          </button>
        </div>
        {review.comment && (
          <p className="text-[13px] text-secondary/80 italic mt-2">"{review.comment}"</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 mt-5 flex flex-wrap justify-between items-center gap-4">
      <div>
        <p className="font-bold text-secondary text-[15px]">How was your trip?</p>
        <p className="text-[13px] text-text-muted mt-0.5">Share your experience to help others.</p>
      </div>
      <button onClick={() => onRate(booking)} className="flex items-center gap-2 rounded-lg bg-warning px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-warning/90 shadow-sm">
        <FaStar /> Rate Trip
      </button>
    </div>
  )
}

const STATUS_STYLE = {
  CONFIRMED: { bg: 'var(--color-success)', label: 'Confirmed' },
  PENDING: { bg: 'var(--color-warning)', label: 'Pending' },
  CANCELLED: { bg: 'var(--color-error)', label: 'Cancelled' },
  COMPLETED: { bg: 'var(--color-secondary)', label: 'Completed' },
}

function fmtDT(dt) {
  if (!dt) return '--'
  try { return format(parseISO(dt), 'dd MMM yyyy, HH:mm') } catch { return dt }
}

function statusFor(status) {
  return STATUS_STYLE[status] || STATUS_STYLE.PENDING
}

function isJourneyUpcoming(booking) {
  if (!booking?.departureTime) return false
  try {
    return isAfter(parseISO(booking.departureTime), new Date())
  } catch {
    return false
  }
}

function canCancelBooking(booking) {
  return (booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'PENDING')
    && isJourneyUpcoming(booking)
}

const DEFAULT_FILTERS = {
  status: 'ALL',
  fromDate: '',
  toDate: '',
}

const DEFAULT_PAGE = {
  content: [],
  page: 0,
  size: 8,
  totalElements: 0,
  totalPages: 0,
  last: true,
}

function TicketModal({ booking, onClose, onCancel, onDownload, onRate, downloading }) {
  const style = statusFor(booking.bookingStatus)
  const canCancel = canCancelBooking(booking)
  const [cancelling, setCancelling] = useState(false)

  const handleCancelClick = () => {
    onCancel(booking)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/70 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-border-medium bg-surface shadow-xl">
        <div className="flex items-center justify-between bg-secondary px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <FaBus className="text-warning" />
            <span className="font-bold">BookMyRoute ticket</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close ticket"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-text-muted tracking-wider">Booking ref</p>
              <p className="mt-1 font-mono text-[15px] font-bold text-secondary">{booking.bookingRef}</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm" style={{ background: style.bg }}>
              {style.label}
            </span>
          </div>

          <div className="mb-5 rounded-xl border border-border-light bg-surface shadow-sm p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">From</p>
                <p className="truncate text-xl font-bold text-secondary">{booking.origin}</p>
              </div>
              <FaBus className="text-xl text-primary opacity-80" />
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">To</p>
                <p className="truncate text-xl font-bold text-secondary">{booking.destination}</p>
              </div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            {[
              ['Bus', booking.busName],
              ['Departure', fmtDT(booking.departureTime)],
              ['Boarding', `${booking.pickupStopName || ''} ${booking.pickupSubLocationName ? `(${booking.pickupSubLocationName})` : ''}`.trim() || '--'],
              ['Dropping', `${booking.dropStopName || ''} ${booking.dropSubLocationName ? `(${booking.dropSubLocationName})` : ''}`.trim() || '--'],
              ['Seats', booking.seats?.map(seat => seat.seatNumber).join(', ') || '--'],
              ['Passengers', booking.seats?.length || '--'],
              ['Payment', booking.paymentMethod || '--'],
              ['Pay status', booking.paymentStatus || '--'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-surface border border-border-light shadow-sm p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
                <p className="mt-1 text-[13px] font-bold text-secondary">{value}</p>
              </div>
            ))}
          </div>

          <div className="mb-5 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <span className="font-bold text-secondary">Total amount</span>
            <span className="text-2xl font-bold font-mono text-primary">₹{booking.totalAmount}</span>
          </div>

          {booking.bookingStatus === 'COMPLETED' && (
            <div className="mb-6">
              <ReviewPromptCard booking={booking} onRate={onRate} />
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => onDownload(booking.bookingRef)}
              disabled={downloading}
              className="btn-primary flex-1 justify-center py-3"
            >
              <FaDownload className="mr-2"/>
              {downloading ? 'Downloading...' : 'Download ticket'}
            </button>

            {booking.bookingStatus === 'CANCELLED' && booking.refundStatus && (
              <div className="rounded-xl border border-border-medium bg-surface/50 p-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Refund Status</p>
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${booking.refundStatus === 'REFUNDED' ? 'text-success' : booking.refundStatus === 'FAILED' ? 'text-error' : 'text-warning'}`}>
                    {booking.refundStatus}
                  </span>
                  {booking.refundAmount != null && (
                    <span className="font-bold text-secondary">₹{booking.refundAmount}</span>
                  )}
                </div>
              </div>
            )}

            {canCancel && (
              <button
                onClick={handleCancelClick}
                disabled={cancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-600 py-3 text-sm font-800 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                <FaTimes />
                {cancelling ? 'Cancelling...' : 'Cancel booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RatingModal({ booking, onClose, onSaved }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewId, setReviewId] = useState(booking.reviewId || null)
  const [loading, setLoading] = useState(Boolean(booking.reviewed))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!booking.reviewed || !booking.bookingId) return
    reviewApi.getBookingReview(booking.bookingId)
      .then(({ data }) => {
        const review = data?.data
        setReviewId(review?.reviewId || booking.reviewId)
        setRating(review?.rating || 0)
        setComment(review?.comment || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [booking])

  const validate = () => {
    if (!rating) return 'Please select a star rating.'
    if (comment.length > 1000) return 'Comment must be 1000 characters or less.'
    return ''
  }

  const handleSave = async () => {
    const message = validate()
    if (message) {
      setError(message)
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = { rating, comment: comment.trim() }
      if (reviewId) {
        await reviewApi.updateReview(reviewId, payload)
        toast.success('Review updated')
      } else {
        const { data } = await reviewApi.submitReview({ ...payload, bookingId: booking.bookingId })
        setReviewId(data?.data?.reviewId || null)
        toast.success('Thanks for reviewing your journey')
      }
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your review.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!reviewId) return
    setDeleting(true)
    setError('')
    try {
      await reviewApi.deleteReview(reviewId)
      toast.success('Review deleted')
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete your review.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/70 p-4 backdrop-blur-sm"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border-medium bg-surface shadow-xl">
        <div className="flex items-center justify-between bg-secondary px-5 py-4 text-white">
          <div>
            <p className="font-bold text-lg">Rate your journey</p>
            <p className="text-xs text-white/70 font-medium mt-0.5">{booking.origin} to {booking.destination}</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Close rating">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="rounded-xl border border-dashed border-border-medium bg-surface/50 p-8 text-center text-[15px] font-medium text-text-muted">
              Loading your review...
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mb-2 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(value => {
                    const active = value <= (hovered || rating)
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        onMouseEnter={() => setHovered(value)}
                        onMouseLeave={() => setHovered(0)}
                        className={`text-3xl transition-all hover:scale-110 ${active ? 'text-warning drop-shadow-sm' : 'text-border-medium hover:text-warning/50'}`}
                        aria-label={`${value} star${value > 1 ? 's' : ''}`}
                      >
                        {active ? <FaStar /> : <FaRegStar />}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[13px] font-medium text-text-muted">
                  {rating ? `${rating} out of 5 stars` : 'Select your rating'}
                </p>
              </div>

              <label className="block mb-6">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted">Comment</span>
                <textarea
                  value={comment}
                  onChange={event => setComment(event.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="What stood out about this trip?"
                  className="input-field resize-none"
                />
                <div className="mt-1.5 flex justify-between text-xs text-text-muted font-medium">
                  <span className={error ? "text-error" : ""}>{error || 'Your review helps other passengers choose confidently.'}</span>
                  <span>{comment.length}/1000</span>
                </div>
              </label>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button onClick={handleSave} disabled={saving || deleting} className="btn-primary justify-center">
                  {saving ? 'Saving...' : reviewId ? 'Update review' : 'Submit review'}
                </button>
                {reviewId && (
                  <button onClick={handleDelete} disabled={saving || deleting} className="btn-outline border-error text-error hover:bg-error hover:text-white justify-center">
                    <FaTrash className="mr-2"/> {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingCard({ booking, onClick, onCancel, onDownload, onRate, onBookAgain, downloading, cancelling }) {
  const style = statusFor(booking.bookingStatus)
  const seats = booking.seats?.length || 0
  const canCancel = canCancelBooking(booking)
  const canBookAgain = booking.bookingStatus === 'COMPLETED' || booking.bookingStatus === 'CANCELLED' || !isJourneyUpcoming(booking)

  return (
    <div className="card-hover w-full p-5 lg:p-6 bg-surface border border-border-light rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <button className="flex min-w-0 items-center gap-4 text-left group" onClick={onClick}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105" style={{ background: style.bg }}>
            <FaTicketAlt className="text-xl" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[13px] font-bold text-text-muted">{booking.bookingRef}</p>
            <p className="truncate text-lg font-bold text-secondary group-hover:text-primary transition-colors">{booking.origin} to {booking.destination}</p>
            <p className="truncate text-[13px] font-medium text-text-muted">{booking.busName} • {fmtDT(booking.departureTime)}</p>
          </div>
        </button>

        <div className="flex flex-wrap gap-2 text-[13px] font-medium text-text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/5 px-3 py-1"><FaUserFriends className="text-secondary/50"/> {seats} seat{seats !== 1 ? 's' : ''}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/5 px-3 py-1"><FaMoneyBillWave className="text-secondary/50"/> ₹{booking.totalAmount}</span>
        </div>

        <div className="flex flex-col items-end gap-2 lg:justify-self-end">
          <span className="w-fit rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm tracking-wide uppercase" style={{ background: style.bg }}>
            {style.label}
          </span>
          {booking.bookingStatus === 'CANCELLED' && booking.refundStatus === 'REFUNDED' && booking.refundAmount && (
            <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded uppercase tracking-wider">
              Refunded ₹{booking.refundAmount}
            </span>
          )}
        </div>
      </div>

      {booking.bookingStatus === 'COMPLETED' && (
        <ReviewPromptCard booking={booking} onRate={onRate} />
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-dashed border-border-medium pt-5">
        <button
          onClick={() => onDownload(booking.bookingRef)}
          disabled={downloading}
          className="btn-primary px-4 py-2 text-sm h-10"
        >
          <FaDownload className="mr-2"/>
          {downloading ? 'Downloading...' : 'Ticket PDF'}
        </button>

        {canBookAgain && (
          <button
            onClick={() => onBookAgain(booking)}
            className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white h-10"
          >
            <FaSearch />
            Book again
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => onCancel(booking)}
            disabled={cancelling}
            className="btn-outline border-error text-error hover:bg-error hover:text-white px-4 py-2 text-sm h-10"
          >
            <FaTimes className="mr-2"/>
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [summaryBookings, setSummaryBookings] = useState([])
  const [pageInfo, setPageInfo] = useState(DEFAULT_PAGE)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [ratingBooking, setRatingBooking] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)
  const [validationError, setValidationError] = useState('')
  const [listError, setListError] = useState('')
  const [downloadingRef, setDownloadingRef] = useState(null)
  const [cancellingRef, setCancellingRef] = useState(null)
  const [cancelModalBooking, setCancelModalBooking] = useState(null)

  const buildParams = (filterState, page = 0) => {
    const params = {
      page,
      size: DEFAULT_PAGE.size,
      sortBy: 'bookedAt',
      sortDir: 'desc',
    }
    if (filterState.status && filterState.status !== 'ALL') params.status = filterState.status
    if (filterState.fromDate) params.fromDate = filterState.fromDate
    if (filterState.toDate) params.toDate = filterState.toDate
    return params
  }

  const fetchSummary = async () => {
    setSummaryLoading(true)
    try {
      const { data } = await bookingApi.getMyBookings()
      setSummaryBookings(data?.data ?? [])
    } catch {
      setSummaryBookings([])
    } finally {
      setSummaryLoading(false)
    }
  }

  const fetchBookings = async (page = 0, filterState = appliedFilters) => {
    setLoading(true)
    setListError('')
    try {
      const { data } = await bookingApi.searchMyBookings(buildParams(filterState, page))
      const result = data?.data ?? DEFAULT_PAGE
      setBookings(result.content ?? [])
      setPageInfo({ ...DEFAULT_PAGE, ...result })
    } catch (err) {
      setBookings([])
      setPageInfo(DEFAULT_PAGE)
      setListError(err.response?.data?.message || 'Could not load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
    fetchBookings(0, DEFAULT_FILTERS)
  }, [])

  const validateFilters = () => {
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
      return 'From date cannot be after to date.'
    }
    return ''
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    const message = validateFilters()
    if (message) {
      setValidationError(message)
      return
    }
    setValidationError('')
    setAppliedFilters(filters)
    await fetchBookings(0, filters)
  }

  const handleResetFilters = async () => {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setValidationError('')
    await fetchBookings(0, DEFAULT_FILTERS)
  }

  const handlePageChange = async (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return
    await fetchBookings(nextPage, appliedFilters)
  }

  const handleCancelConfirm = async (ref) => {
    setCancellingRef(ref)
    try {
      await bookingApi.cancelBooking(ref)
      toast.success('Booking cancelled successfully.')
      setCancelModalBooking(null)
      setSelected(null) // Close ticket modal if open
      await Promise.all([fetchSummary(), fetchBookings(pageInfo.page, appliedFilters)])
    } finally {
      setCancellingRef(null)
    }
  }

  const handleCancelRequest = (booking) => {
    setCancelModalBooking(booking)
  }

  const handleDownloadTicket = async (ref) => {
    setDownloadingRef(ref)
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
      setDownloadingRef(null)
    }
  }

  const handleBookAgain = (booking) => {
    let travelDate = parseISO(booking.departureTime)
    const today = startOfDay(new Date())
    
    if (isBefore(travelDate, today)) {
      travelDate = today
    }

    navigate('/search', {
      state: {
        searchParams: {
          from: booking.origin,
          to: booking.destination,
          date: format(travelDate, 'yyyy-MM-dd')
        },
        autoSearch: true
      }
    })
  }

  const hasActiveFilters = appliedFilters.status !== 'ALL' || appliedFilters.fromDate || appliedFilters.toDate

  return (
    <div className="page-shell">
      <div className="border-b border-border-light bg-surface shadow-sm">
        <div className="section-wrap py-8">
          <h1 className="text-3xl font-display font-bold text-secondary">My bookings</h1>
          <p className="mt-2 text-[15px] text-text-muted">Manage upcoming and past trips{user?.name ? ` for ${user.name.split(' ')[0]}` : ''}.</p>
        </div>
      </div>

      <div className="section-wrap max-w-5xl py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="card p-5 border-t-4 border-t-primary">
            <FaTicketAlt className="mb-4 text-3xl text-primary opacity-80" />
            <p className="text-3xl font-bold font-display text-secondary">{summaryLoading ? '--' : summaryBookings.length}</p>
            <p className="text-[13px] font-bold uppercase tracking-wider text-text-muted mt-1">Total bookings</p>
          </div>
          <div className="card p-5 border-t-4 border-t-success">
            <FaCalendarAlt className="mb-4 text-3xl text-success opacity-80" />
            <p className="text-3xl font-bold font-display text-secondary">{summaryLoading ? '--' : summaryBookings.filter(b => b.bookingStatus === 'CONFIRMED').length}</p>
            <p className="text-[13px] font-bold uppercase tracking-wider text-text-muted mt-1">Confirmed trips</p>
          </div>
          <div className="card p-5 border-t-4 border-t-warning">
            <FaRoute className="mb-4 text-3xl text-warning opacity-80" />
            <p className="text-3xl font-bold font-display text-secondary">{summaryLoading ? '--' : new Set(summaryBookings.map(b => `${b.origin}-${b.destination}`)).size}</p>
            <p className="text-[13px] font-bold uppercase tracking-wider text-text-muted mt-1">Routes booked</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-8 rounded-2xl border border-border-light bg-surface p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FaFilter className="text-lg"/>
              </span>
              <div>
                <h2 className="text-lg font-bold text-secondary">Search bookings</h2>
                <p className="text-sm text-text-muted mt-0.5">{pageInfo.totalElements} booking{pageInfo.totalElements === 1 ? '' : 's'} match current filters</p>
              </div>
            </div>
            {loading && <span className="text-[11px] font-bold uppercase tracking-wider text-primary animate-pulse">Loading...</span>}
          </div>

          <div className="grid gap-4 md:grid-cols-[1.1fr_1fr_1fr_auto_auto] md:items-end">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted">Booking status</span>
              <select
                value={filters.status}
                onChange={event => setFilters(current => ({ ...current, status: event.target.value }))}
                className="input-field"
              >
                <option value="ALL">All statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted">From date</span>
              <input
                type="date"
                value={filters.fromDate}
                onChange={event => setFilters(current => ({ ...current, fromDate: event.target.value }))}
                className="input-field"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-muted">To date</span>
              <input
                type="date"
                value={filters.toDate}
                onChange={event => setFilters(current => ({ ...current, toDate: event.target.value }))}
                className="input-field"
              />
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto justify-center h-11">
              <FaSearch className="mr-2"/>
              Search
            </button>

            <button type="button" onClick={handleResetFilters} disabled={loading} className="btn-outline w-full md:w-auto justify-center h-11">
              <FaUndo className="mr-2"/>
              Reset
            </button>
          </div>

          {(validationError || listError) && (
            <p className="mt-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
              {validationError || listError}
            </p>
          )}
        </form>

        {loading ? (
          <div className="card p-12 text-center border-dashed">
            <FaTicketAlt className="mx-auto mb-4 animate-pulse text-5xl text-primary opacity-50" />
            <p className="text-[15px] font-medium text-text-muted">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-medium bg-surface/50 p-16 text-center">
            <FaBus className="mx-auto mb-5 text-6xl text-text-muted opacity-30" />
            <h2 className="text-xl font-bold text-secondary">
              {hasActiveFilters ? 'No bookings found for selected filters.' : 'No bookings yet'}
            </h2>
            <p className="mt-2 text-[15px] text-text-muted">
              {hasActiveFilters ? 'Try changing the status or booking date range.' : 'Search for a route to start your next trip.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {bookings.map(booking => (
                <BookingCard
                  key={booking.bookingRef}
                  booking={booking}
                  onClick={() => setSelected(booking)}
                  onCancel={handleCancelRequest}
                  onDownload={handleDownloadTicket}
                  onRate={setRatingBooking}
                  onBookAgain={handleBookAgain}
                  downloading={downloadingRef === booking.bookingRef}
                  cancelling={cancellingRef === booking.bookingRef}
                />
              ))}
            </div>

            {pageInfo.totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-border-light bg-surface px-5 py-4 shadow-sm sm:flex-row">
                <p className="text-sm font-bold text-text-muted">
                  Page {pageInfo.page + 1} of {pageInfo.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pageInfo.page - 1)}
                    disabled={loading || pageInfo.page === 0}
                    className="btn-outline px-4 py-2"
                  >
                    <FaChevronLeft className="mr-1"/>
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pageInfo.page + 1)}
                    disabled={loading || pageInfo.last}
                    className="btn-outline px-4 py-2"
                  >
                    Next
                    <FaChevronRight className="ml-1"/>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <TicketModal
          booking={selected}
          onClose={() => setSelected(null)}
          onCancel={handleCancelRequest}
          onDownload={handleDownloadTicket}
          onRate={setRatingBooking}
          downloading={downloadingRef === selected.bookingRef}
        />
      )}

      {cancelModalBooking && (
        <CancelConfirmationModal
          booking={cancelModalBooking}
          onClose={() => setCancelModalBooking(null)}
          onConfirm={handleCancelConfirm}
          isCancelling={cancellingRef === cancelModalBooking.bookingRef}
        />
      )}

      {ratingBooking && (
        <RatingModal
          booking={ratingBooking}
          onClose={() => setRatingBooking(null)}
          onSaved={() => fetchBookings(pageInfo.page, appliedFilters)}
        />
      )}
    </div>
  )
}
