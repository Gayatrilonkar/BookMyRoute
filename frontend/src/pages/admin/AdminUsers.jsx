import { useState, useEffect } from 'react'
import { adminApi, authApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaUserShield, FaUser, FaSearch, FaBan, FaCheckCircle, FaFilter, FaTimes, FaLock } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  
  // OTP Flow States
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    fetchUsers()
    
    // Get current admin user details for OTP
    const userJson = localStorage.getItem('bmr_user')
    if (userJson) {
      setAdminUser(JSON.parse(userJson))
    }
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getUsers()
      setUsers(res.data.data)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const initiateAction = async (actionFn) => {
    try {
      setOtpLoading(true)
      await adminApi.requestOtp({ email: adminUser.email, purpose: 'ADMIN_ACTION' })
      setPendingAction(() => actionFn)
      setShowOtpModal(true)
      toast.success('Security OTP sent to your email')
    } catch (err) {
      toast.error('Failed to request OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtpAndExecute = async (e) => {
    e.preventDefault()
    try {
      setOtpLoading(true)
      const res = await adminApi.verifyOtp({ email: adminUser.email, purpose: 'ADMIN_ACTION', otp })
      if (res.data.data === true) {
        setShowOtpModal(false)
        setOtp('')
        toast.success('OTP Verified')
        if (pendingAction) {
          await pendingAction()
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleToggleStatus = (user) => {
    initiateAction(async () => {
      try {
        const updated = { ...user, isActive: !user.isActive }
        await adminApi.updateUser(user.userId, updated)
        toast.success(`User ${updated.isActive ? 'activated' : 'blocked'} successfully`)
        fetchUsers()
      } catch (err) {
        toast.error('Failed to update user status')
      }
    })
  }

  const handleToggleRole = (user) => {
    initiateAction(async () => {
      try {
        const newRole = user.role === 'ADMIN' ? 'PASSENGER' : 'ADMIN'
        await adminApi.updateUser(user.userId, { ...user, role: newRole })
        toast.success(`User role changed to ${newRole}`)
        fetchUsers()
      } catch (err) {
        toast.error('Failed to update user role')
      }
    })
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-secondary">User Management</h2>
          <p className="text-gray-500 font-body text-sm mt-1">Manage user accounts, roles, and security access.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white shadow-sm border border-border-light rounded-2xl">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <FaFilter className="text-gray-400" />
          <select 
            className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white font-bold text-gray-600"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="PASSENGER">Passenger</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden border border-border-light shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-border-light">
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-display font-bold text-sm text-gray-500 uppercase tracking-wider text-right">Actions (Secured)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.userId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-secondary text-[15px]">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-secondary">{user.email}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{user.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {user.role === 'ADMIN' ? <FaUserShield /> : <FaUser />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                        user.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {user.isActive ? <><FaCheckCircle /> Active</> : <><FaBan /> Blocked</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleRole(user)}
                          disabled={otpLoading}
                          className="px-3 py-1.5 rounded-lg border border-border-light text-xs font-bold text-secondary hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          Make {user.role === 'ADMIN' ? 'Passenger' : 'Admin'}
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          disabled={otpLoading || user.userId === adminUser?.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                            user.isActive 
                              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                              : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {user.isActive ? 'Block' : 'Unblock'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                <FaLock />
              </div>
              <h3 className="text-xl font-bold font-display text-secondary mb-2">Security Verification</h3>
              <p className="text-sm text-gray-500 mb-6">Enter the 6-digit OTP sent to <strong className="text-secondary">{adminUser?.email}</strong> to authorize this sensitive action.</p>
              
              <form onSubmit={handleVerifyOtpAndExecute} className="space-y-6">
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowOtpModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={otp.length !== 6 || otpLoading} className="flex-1 py-3 rounded-xl font-bold btn-primary flex items-center justify-center disabled:opacity-50">
                    {otpLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
