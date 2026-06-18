import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  MdDashboard, MdDirectionsBus, MdRoute, MdSchedule, 
  MdConfirmationNumber, MdPayment, MdPeople, MdSettings, 
  MdMenu, MdClose, MdExitToApp 
} from 'react-icons/md'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <MdDashboard /> },
    { name: 'Users', path: '/admin/users', icon: <MdPeople /> },
    { name: 'Buses', path: '/admin/buses', icon: <MdDirectionsBus /> },
    { name: 'Routes', path: '/admin/routes', icon: <MdRoute /> },
    { name: 'Schedules', path: '/admin/schedules', icon: <MdSchedule /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <MdConfirmationNumber /> },
    { name: 'Payments', path: '/admin/payments', icon: <MdPayment /> },
    { name: 'Settings', path: '/admin/settings', icon: <MdSettings /> },
  ]

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all font-medium ${
          isActive 
            ? 'bg-primary text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-secondary'
        }`}
      >
        <span className="text-[20px]">{item.icon}</span>
        <span className="text-[14px] font-display">{item.name}</span>
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-secondary/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-border-light shadow-xl transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-[72px] px-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-white shadow-sm">
              <MdDashboard size={22} />
            </span>
            <span className="text-[18px] font-bold font-display text-secondary tracking-tight">
              BMR Admin
            </span>
          </div>
          <button 
            className="p-2 -mr-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="py-6 overflow-y-auto h-[calc(100vh-72px-80px)] custom-scrollbar">
          <div className="px-6 mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Main Menu</p>
          </div>
          <nav className="flex flex-col gap-1">
            {menuItems.map(item => <NavItem key={item.path} item={item} />)}
          </nav>
        </div>

        {/* User profile at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light bg-gray-50">
          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-display">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-secondary truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
              title="Logout"
            >
              <MdExitToApp size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-border-light shadow-sm flex items-center justify-between px-6 z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <MdMenu size={24} />
            </button>
            <h1 className="text-xl font-bold font-display text-secondary">
              {menuItems.find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path)))?.name || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
