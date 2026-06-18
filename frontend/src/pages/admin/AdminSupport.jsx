import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaHeadset, FaReply, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { format } from 'date-fns'

export default function AdminSupport() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null) // ticket object

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getSupportRequests()
      setRequests(res.data.data)
    } catch (err) {
      toast.error('Failed to load support requests')
    } finally {
      setLoading(false)
    }
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    
    try {
      await adminApi.replySupportRequest(replyingTo.ticketRef, replyText)
      toast.success('Reply sent successfully')
      setReplyingTo(null)
      setReplyText('')
      fetchRequests()
    } catch (err) {
      toast.error('Failed to send reply')
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'OPEN') return <span className="px-2.5 py-1 bg-warning/10 text-warning text-[11px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1"><FaExclamationCircle/> Open</span>
    if (status === 'RESOLVED') return <span className="px-2.5 py-1 bg-success/10 text-success text-[11px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1"><FaCheckCircle/> Resolved</span>
    return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-md uppercase tracking-wider">{status}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display text-secondary">Support & Complaints</h2>
        <p className="text-gray-500 font-body text-sm mt-1">Manage user inquiries and resolve issues.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12 card">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="card p-8 text-center text-gray-500 font-medium">
              No support requests found.
            </div>
          ) : (
            requests.map(req => (
              <div 
                key={req.ticketRef} 
                className={`card p-5 cursor-pointer transition-all border ${replyingTo?.ticketRef === req.ticketRef ? 'border-primary shadow-md' : 'border-border-light hover:border-primary/50'}`}
                onClick={() => {
                  setReplyingTo(req)
                  setReplyText('')
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">#{req.ticketRef}</span>
                    {getStatusBadge(req.status)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {req.createdAt ? format(new Date(req.createdAt), 'MMM dd, hh:mm a') : 'N/A'}
                  </span>
                </div>
                <h4 className="font-bold text-secondary text-sm mb-1">{req.subject}</h4>
                <p className="text-gray-600 text-sm line-clamp-2">{req.message}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                  <FaHeadset className="text-gray-400" />
                  <span>{req.customerName} ({req.customerEmail})</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Box */}
        <div>
          {replyingTo ? (
            <div className="card p-6 border border-border-light sticky top-24">
              <div className="mb-6">
                <h3 className="font-bold font-display text-lg text-secondary mb-1">Reply to Ticket #{replyingTo.ticketRef}</h3>
                <p className="text-sm text-gray-500">From: {replyingTo.customerName} ({replyingTo.customerEmail})</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <p className="font-bold text-sm text-secondary mb-2">{replyingTo.subject}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{replyingTo.message}</p>
              </div>

              {replyingTo.status === 'RESOLVED' ? (
                <div className="bg-success/10 border border-success/20 p-4 rounded-xl flex gap-3 text-success">
                  <FaCheckCircle className="mt-0.5" size={16} />
                  <div>
                    <p className="font-bold text-sm">Ticket Resolved</p>
                    <p className="text-xs mt-1">Admin Reply: {replyingTo.adminReply}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReplySubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Your Response</label>
                    <textarea 
                      required 
                      rows={5}
                      className="input-field w-full resize-none"
                      placeholder="Type your reply here. This will be sent to the customer via email and mark the ticket as resolved."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setReplyingTo(null)} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary flex items-center gap-2">
                      <FaReply /> Send Reply & Resolve
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="card p-12 flex flex-col items-center justify-center text-center text-gray-400 border border-border-light border-dashed sticky top-24">
              <FaHeadset size={48} className="mb-4 text-gray-300" />
              <p className="font-medium text-secondary">Select a ticket</p>
              <p className="text-sm">Click on a ticket from the list to view details and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
