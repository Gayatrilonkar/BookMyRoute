import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaSearch, FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle, FaClock, FaDownload, FaMoneyCheckAlt } from 'react-icons/fa'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export default function AdminPayments() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      // Since payments are tightly coupled with bookings, we fetch all bookings
      const res = await adminApi.getAllBookings()
      setBookings(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load payment transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (paymentStatus, bookingStatus) => {
    if (bookingStatus === 'CANCELLED') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/20 flex items-center gap-1.5 w-fit"><FaTimesCircle /> REFUNDED / CANCELLED</span>
    }
    switch (paymentStatus) {
      case 'SUCCESS':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20 flex items-center gap-1.5 w-fit"><FaCheckCircle /> SUCCESS</span>
      case 'FAILED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/20 flex items-center gap-1.5 w-fit"><FaTimesCircle /> FAILED</span>
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning border border-warning/20 flex items-center gap-1.5 w-fit"><FaClock /> PENDING</span>
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1.5 w-fit"><FaClock /> UNKNOWN</span>
    }
  }

  // Filter transactions
  const filteredTransactions = bookings.filter(b => {
    const matchesSearch = 
      b.bookingRef?.toLowerCase().includes(search.toLowerCase()) || 
      b.customerName?.toLowerCase().includes(search.toLowerCase()) || 
      b.customerEmail?.toLowerCase().includes(search.toLowerCase())
    
    if (statusFilter === 'ALL') return matchesSearch
    if (statusFilter === 'SUCCESS') return matchesSearch && b.paymentStatus === 'SUCCESS' && b.bookingStatus !== 'CANCELLED'
    if (statusFilter === 'REFUNDED') return matchesSearch && b.bookingStatus === 'CANCELLED'
    if (statusFilter === 'PENDING') return matchesSearch && b.paymentStatus === 'PENDING' && b.bookingStatus !== 'CANCELLED'
    return matchesSearch
  })

  // Sort by date DESC
  filteredTransactions.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-secondary">Payment Transactions</h2>
          <p className="text-gray-500 font-body text-sm mt-1">View and monitor all booking payments and refunds.</p>
        </div>
      </div>

      <div className="card p-4 bg-white shadow-sm border border-border-light rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Transaction ID, Name, or Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {['ALL', 'SUCCESS', 'PENDING', 'REFUNDED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="card bg-white shadow-sm border border-border-light rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Transaction Info</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Customer</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Amount</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Method</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <motion.tr initial={{opacity:0}} animate={{opacity:1}} key={tx.bookingId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FaFileInvoiceDollar size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-secondary text-sm">{tx.bookingRef}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{format(new Date(tx.bookedAt), 'MMM dd, yyyy - hh:mm a')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-secondary text-sm">{tx.customerName}</div>
                      <div className="text-xs text-gray-400">{tx.customerEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-success text-base">{formatCurrency(tx.totalAmount)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg w-fit">
                        <FaMoneyCheckAlt className="text-gray-400" />
                        {tx.paymentMethod || 'RAZORPAY'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(tx.paymentStatus, tx.bookingStatus)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-primary hover:text-primary-dark font-bold text-sm bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5">
                        <FaDownload size={12}/> Receipt
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
