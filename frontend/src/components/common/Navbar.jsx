import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaBars, FaBusAlt, FaHeadset, FaIdBadge, FaSignOutAlt, FaTimes, FaUserCircle } from 'react-icons/fa'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setOpen(false)
    setProfileOpen(false)
    navigate('/login')
  }

  const navLink = (to, label, mobile = false) => (
    <Link
      to={to}
      onClick={() => mobile && setOpen(false)}
      className={`rounded-lg px-3 py-2 text-[15px] font-medium transition-colors ${
        pathname === to
          ? 'bg-primary/10 text-primary'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-secondary text-white shadow-md">
      <div className="section-wrap flex h-[72px] items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <FaBusAlt size={20} />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            BookMyRoute
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/help"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-medium transition-colors ${
              pathname === '/help'
                ? 'bg-primary/10 text-primary'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FaHeadset className={pathname === '/help' ? 'text-primary' : 'text-gray-400'} />
            Help
          </Link>
          {user ? (
            <>
              {navLink('/search', 'Search buses')}
              {!isAdmin && navLink('/my-bookings', 'My bookings')}
              {isAdmin && navLink('/admin', 'Admin')}

              <div className="relative ml-2">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[15px] font-medium text-white hover:border-primary/40 hover:bg-white/10 transition-colors"
                >
                  <FaUserCircle className="text-primary" size={18} />
                  <span>{user.name?.split(' ')[0] || 'Account'}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-14 z-50 min-w-[220px] rounded-xl border border-gray-200 bg-white py-2 shadow-xl text-text-body">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-[15px] font-bold text-secondary">{user.name}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-[15px] font-medium text-secondary hover:bg-gray-50 transition-colors"
                    >
                      <FaIdBadge className="text-primary" /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[15px] font-medium text-danger hover:bg-danger-light transition-colors"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link to="/login" className="btn-outline text-white hover:text-white hover:bg-white/10 px-5">Login</Link>
              <Link to="/register" className="btn-primary px-5">Register</Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white md:hidden hover:bg-white/10"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {open ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-secondary px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              to="/help"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-medium ${
                pathname === '/help'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FaHeadset className={pathname === '/help' ? 'text-primary' : 'text-gray-400'} /> Help
            </Link>
            {user ? (
              <>
                {navLink('/search', 'Search buses', true)}
                {!isAdmin && navLink('/my-bookings', 'My bookings', true)}
                {isAdmin && navLink('/admin', 'Admin', true)}
                <div className="mt-2 border-t border-white/10 pt-4">
                  <p className="text-[15px] font-bold text-white px-3">{user.name}</p>
                  <p className="mb-3 text-xs text-gray-400 px-3">{user.email}</p>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className={`mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-medium ${
                      pathname === '/profile'
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FaIdBadge className={pathname === '/profile' ? 'text-primary' : 'text-gray-400'} /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-medium text-danger hover:bg-danger/10 transition-colors"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline w-full bg-white/5 text-white hover:bg-white/10 border border-white/10">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
