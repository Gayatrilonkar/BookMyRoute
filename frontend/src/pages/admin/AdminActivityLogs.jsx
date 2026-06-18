import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaHistory, FaSearch, FaUserShield } from 'react-icons/fa'
import { format } from 'date-fns'

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getLogs()
      setLogs(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => 
    log.actionType?.toLowerCase().includes(search.toLowerCase()) || 
    log.targetEntity?.toLowerCase().includes(search.toLowerCase())
  ).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-secondary">Activity Logs</h2>
          <p className="text-gray-500 font-body text-sm mt-1">Audit trail of critical administrative actions.</p>
        </div>
      </div>

      <div className="card p-4 bg-white shadow-sm border border-border-light rounded-2xl flex items-center">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by action or entity..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="card bg-white shadow-sm border border-border-light rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Admin</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Action Type</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Entity</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FaUserShield className="text-purple-500" />
                        <span className="font-bold text-sm text-secondary">{log.admin?.name || 'Admin'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold border border-gray-200">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-secondary">
                      {log.targetEntity} {log.targetEntityId ? `(#${log.targetEntityId})` : ''}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {log.actionDetails || 'No details provided'}
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
