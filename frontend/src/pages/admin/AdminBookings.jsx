import { useState, useEffect } from 'react'
import { adminApi, bookingApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaSearch, FaTicketAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaUser } from 'react-icons/fa'
import { format } from 'date-fns'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getAllBookings()
      setBookings(res.data.data)
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (ref) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will process a refund.')) return
    try {
      await bookingApi.cancelBooking(ref)
      toast.success(`Booking ${ref} cancelled successfully`)
      fetchBookings()
    } catch (err) {
      toast.error('Failed to cancel booking')
    }
  }

  const handleExportCSV = () => {
    const headers = ['Booking Ref', 'Customer Name', 'Customer Email', 'Origin', 'Destination', 'Travel Date', 'Status', 'Total Amount']
    const csvContent = [
      headers.join(','),
      ...bookings.map(b => [
        b.bookingRef,
        `"${b.customerName}"`,
        `"${b.customerEmail}"`,
        `"${b.origin}"`,
        `"${b.destination}"`,
        b.departureTime,
        b.bookingStatus,
        b.totalAmount
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `bookings_export_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredBookings = bookings.filter(b => 
    b.bookingRef.toLowerCase().includes(search.toLowerCase()) || 
    b.customerName.toLowerCase().includes(search.toLowerCase()) ||
    b.customerEmail.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status) => {
    if (status === 'CONFIRMED') return 'bg-success/10 text-success border border-success/20'
    if (status === 'CANCELLED') return 'bg-danger/10 text-danger border border-danger/20'
    return 'bg-warning/10 text-warning border border-warning/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-secondary">Booking Management</h2>
          <p className="text-gray-500 font-body text-sm mt-1">View all user bookings, issue refunds and export data.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="btn-outline flex items-center gap-2"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      <div className="card p-4 bg-white shadow-sm border border-border-light rounded-2xl flex items-center">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Ref ID, Name or Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden border border-border-light shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-border-light">
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider">Booking Info</th>
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider">Route & Date</th>
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No bookings found.</td>
                </tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking.bookingId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <FaTicketAlt />
                        </div>
                        <div>
                          <p className="font-bold text-secondary text-[15px]">{booking.bookingRef}</p>
                          <p className="text-xs text-gray-500 font-medium text-success">₹{booking.totalAmount}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <div>
                          <p className="text-sm font-bold text-secondary">{booking.customerName}</p>
                          <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-secondary">{booking.origin} → {booking.destination}</p>
                      <p className="text-xs text-gray-500">
                        {booking.departureTime ? format(new Date(booking.departureTime), 'MMM dd, yyyy - hh:mm a') : 'N/A'}
                      </p>
                      <div className="text-xs text-gray-400 mt-1">
                        Boarding: {booking.pickupStopName || 'N/A'} {booking.pickupSubLocationName ? `(${booking.pickupSubLocationName})` : ''}
                        <br/>
                        Dropping: {booking.dropStopName || 'N/A'} {booking.dropSubLocationName ? `(${booking.dropSubLocationName})` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus === 'CONFIRMED' ? <FaCheckCircle /> : booking.bookingStatus === 'CANCELLED' ? <FaTimesCircle /> : null}
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.bookingStatus === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleCancel(booking.bookingRef)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
