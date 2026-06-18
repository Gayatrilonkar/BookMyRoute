import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { 
  FaUsers, FaUserPlus, FaUserCheck,
  FaTicketAlt, FaCalendarDay, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaMoneyBillWave, FaRupeeSign, FaWallet, FaChartBar, FaPiggyBank
} from 'react-icons/fa'
import { motion } from 'framer-motion'

// Mock data for charts since backend only returns totals currently
const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 8900 },
  { name: 'Sat', revenue: 12000 },
  { name: 'Sun', revenue: 14000 },
]

const bookingsData = [
  { name: 'Mon', bookings: 24 },
  { name: 'Tue', bookings: 18 },
  { name: 'Wed', bookings: 29 },
  { name: 'Thu', bookings: 15 },
  { name: 'Fri', bookings: 55 },
  { name: 'Sat', bookings: 75 },
  { name: 'Sun', bookings: 82 },
]

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getDashboardStats()
        setStats(res.data.data)
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const userStats = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: <FaUsers />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Users', value: stats?.activeUsers || 0, icon: <FaUserCheck />, color: 'text-success', bg: 'bg-success/10' },
    { title: 'New Today', value: stats?.newUsersToday || 0, icon: <FaUserPlus />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'New This Month', value: stats?.newUsersThisMonth || 0, icon: <FaUserPlus />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ]

  const bookingStats = [
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: <FaTicketAlt />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: "Today's Bookings", value: stats?.todaysBookings || 0, icon: <FaCalendarDay />, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Monthly Bookings', value: stats?.monthlyBookings || 0, icon: <FaCalendarAlt />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Completed', value: stats?.completedBookings || 0, icon: <FaCheckCircle />, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Cancelled', value: stats?.cancelledBookings || 0, icon: <FaTimesCircle />, color: 'text-danger', bg: 'bg-danger/10' },
  ]

  const revenueStats = [
    { title: "Today's Revenue", value: formatCurrency(stats?.todaysRevenue), icon: <FaRupeeSign />, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Weekly Revenue', value: formatCurrency(stats?.weeklyRevenue), icon: <FaChartBar />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Monthly Revenue', value: formatCurrency(stats?.monthlyRevenue), icon: <FaWallet />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Yearly Revenue', value: formatCurrency(stats?.yearlyRevenue), icon: <FaPiggyBank />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { title: 'Total Revenue', value: formatCurrency(stats?.totalRevenue), icon: <FaMoneyBillWave />, color: 'text-success', bg: 'bg-success/10' },
  ]

  const MetricCard = ({ title, value, icon, color, bg }) => (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5 flex items-center gap-4 hover:shadow-lg transition-all border border-gray-100 bg-white group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-xl font-bold font-display text-secondary">{value}</h3>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-secondary">Dashboard Analytics</h2>
          <p className="text-gray-500 font-body text-sm mt-1">Real-time overview of your platform's performance.</p>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-secondary border-b border-gray-200 pb-2">Revenue Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {revenueStats.map((stat, i) => <MetricCard key={i} {...stat} />)}
        </div>
      </div>

      {/* Booking Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-secondary border-b border-gray-200 pb-2">Booking Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {bookingStats.map((stat, i) => <MetricCard key={i} {...stat} />)}
        </div>
      </div>

      {/* User Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-secondary border-b border-gray-200 pb-2">User Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userStats.map((stat, i) => <MetricCard key={i} {...stat} />)}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Revenue Chart */}
        <div className="card p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold font-display text-secondary mb-6">Revenue Trend (Mock Data)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={4} dot={{ r: 4, fill: 'var(--color-primary)' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="card p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold font-display text-secondary mb-6">Bookings (Mock Data)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="bookings" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
