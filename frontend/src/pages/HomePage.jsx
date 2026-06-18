import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBusAlt, FaHeadset, FaShieldAlt, FaStar, FaTag } from 'react-icons/fa'
import { MdSwapHoriz } from 'react-icons/md'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { searchApi } from '../services/api'
import { CitySearchInput, JourneyDatePicker } from '../components/common/JourneySearchControls'

const FALLBACK_CITIES = ['Pune','Mumbai','Goa','Bangalore','Mysore','Chennai','Hyderabad','Delhi','Jaipur','Kolkata']

const SERVICES = [
  { icon: <FaShieldAlt />, title: 'Secure booking', desc: 'Protected checkout and verified operators' },
  { icon: <FaBusAlt />, title: 'Live inventory', desc: 'Compare buses, seats and fares in one place' },
  { icon: <FaHeadset />, title: 'Trip support', desc: 'Help with cancellations and booking updates' },
]

const POPULAR = [
  { from: 'Pune', to: 'Mumbai', price: 350, duration: '3h' },
  { from: 'Mumbai', to: 'Goa', price: 650, duration: '8h' },
  { from: 'Bangalore', to: 'Mysore', price: 250, duration: '3h' },
  { from: 'Chennai', to: 'Coimbatore', price: 450, duration: '5h' },
]

const OFFERS = [
  { title: 'First booking offer', desc: 'Save up to Rs 500 on selected routes', code: 'BMRFIRST' },
  { title: 'Weekend saver', desc: 'Lower fares on popular Friday trips', code: 'WEEKEND' },
  { title: 'UPI cashback', desc: 'Instant cashback on eligible UPI payments', code: 'UPI100' },
]

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cities, setCities] = useState(FALLBACK_CITIES)
  const [form, setForm] = useState({
    from: 'Pune',
    to: 'Mumbai',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    searchApi.getCities()
      .then(res => { if (res.data?.data?.length) setCities(res.data.data) })
      .catch(() => {})
  }, [])

  const set = (key) => (value) => setForm(f => ({ ...f, [key]: value }))
  const swap = () => setForm(f => ({ ...f, from: f.to, to: f.from }))
  const searchPath = (params = form) => {
    const query = new URLSearchParams({
      origin: params.from,
      destination: params.to,
      travelDate: params.date,
      seats: String(params.passengers || 1),
      auto: '1',
    })
    return `/search?${query.toString()}`
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const redirectTo = searchPath(form)
    navigate(user ? redirectTo : '/login', {
      state: user ? { searchParams: form, autoSearch: true } : { redirectTo },
    })
  }

  return (
    <div className="page-shell">
      <section
        className="relative bg-secondary text-white"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(26,35,50,0.94), rgba(26,35,50,0.74)), url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="section-wrap py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[15px] font-medium text-white shadow-sm">
              <FaStar className="text-warning" /> Trusted intercity bus booking
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl text-white">
              Book bus tickets with clarity and confidence.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-300 md:text-lg">
              Search routes, compare fares, pick seats and manage bookings from one clean dashboard.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative z-20 mt-10 rounded-xl bg-white p-4 shadow-xl">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_0.8fr_auto] lg:items-end">
              <div>
                <CitySearchInput
                  label="Leaving from"
                  value={form.from}
                  onChange={set('from')}
                  cities={cities}
                  accent="var(--color-primary)"
                  placeholder="Search origin city"
                />
              </div>

              <button
                type="button"
                onClick={swap}
                className="hidden h-[44px] w-[44px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-secondary hover:border-primary hover:text-primary transition-colors lg:flex"
                aria-label="Swap origin and destination"
              >
                <MdSwapHoriz className="text-xl" />
              </button>

              <div>
                <CitySearchInput
                  label="Going to"
                  value={form.to}
                  onChange={set('to')}
                  cities={cities}
                  accent="var(--color-accent)"
                  placeholder="Search destination city"
                />
              </div>

              <div>
                <JourneyDatePicker value={form.date} onChange={set('date')} />
              </div>

              <button type="submit" className="btn-primary h-12 px-8 text-base">
                Search buses
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {[
              ['Today', 0],
              ['Tomorrow', 1],
              ['Weekend', 5],
            ].map(([label, offset]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  const date = new Date()
                  date.setDate(date.getDate() + offset)
                  setForm(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))
                }}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-medium text-[13px] text-white hover:bg-white/20 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap -mt-7 relative z-10">
        <div className="grid gap-4 rounded-xl border border-border-light bg-white p-4 shadow-md md:grid-cols-3">
          {SERVICES.map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
              <div>
                <p className="font-bold text-secondary">{title}</p>
                <p className="mt-1 text-sm leading-6 text-text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Offers for your next trip</h2>
            <p className="mt-1 text-sm text-text-muted">Simple deals, easy to scan before booking.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {OFFERS.map(offer => (
            <div key={offer.code} className="card-hover p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <FaTag />
              </div>
              <h3 className="font-bold text-secondary">{offer.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">{offer.desc}</p>
              <p className="mt-4 inline-flex rounded-md bg-gray-100 px-3 py-1 font-mono text-xs font-bold text-gray-700 border border-gray-200">
                {offer.code}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap pb-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Popular routes</h2>
            <p className="mt-1 text-sm text-text-muted">Frequently booked city pairs.</p>
          </div>
          <Link to={user ? '/search' : '/login'} className="btn-outline hidden sm:inline-flex">View all routes</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR.map(route => (
            <Link
              to={user ? searchPath({ from: route.from, to: route.to, date: form.date }) : '/login'}
              state={user
                ? { searchParams: { from: route.from, to: route.to, date: form.date, passengers: 1 }, autoSearch: true }
                : { redirectTo: searchPath({ from: route.from, to: route.to, date: form.date }) }}
              key={`${route.from}-${route.to}`}
              className="card-hover block p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-text-muted">From</p>
                  <p className="truncate text-[17px] font-bold text-secondary">{route.from}</p>
                </div>
                <FaBusAlt className="shrink-0 text-primary" />
                <div className="min-w-0 text-right">
                  <p className="text-xs font-bold uppercase text-text-muted">To</p>
                  <p className="truncate text-[17px] font-bold text-secondary">{route.to}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border-light pt-4 text-sm">
                <span className="text-text-muted font-medium">{route.duration}</span>
                <span className="font-bold text-secondary font-mono">₹{route.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
