import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FaBolt, FaBusAlt, FaFilter, FaStar, FaWifi } from 'react-icons/fa'
import { MdSwapHoriz } from 'react-icons/md'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { searchApi } from '../services/api'
import { CitySearchInput, JourneyDatePicker } from '../components/common/JourneySearchControls'
import { useSearchStore } from '../store/useSearchStore'
import { motion } from 'framer-motion'
import SkeletonLoader from '../components/common/SkeletonLoader'

const FALLBACK_CITIES = ['Pune','Mumbai','Goa','Bangalore','Mysore','Chennai','Hyderabad','Delhi','Jaipur','Kolkata']
import JourneyCard from '../components/search/JourneyCard'


export default function SearchPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const autoSearched = useRef(false)
  const [cities, setCities] = useState(FALLBACK_CITIES)
  const [loading, setLoading] = useState(false)

  const {
    searchForm: form,
    searchResults: results,
    sortBy,
    setSearchForm,
    setSearchResults,
    setSortBy
  } = useSearchStore()

  // Initialize form state from query params or location state if provided and empty in store
  useEffect(() => {
    if (searchParams.get('origin') || state?.searchParams?.from) {
      setSearchForm({
        from: state?.searchParams?.from || searchParams.get('origin') || 'Pune',
        to: state?.searchParams?.to || searchParams.get('destination') || 'Mumbai',
        date: state?.searchParams?.date || searchParams.get('travelDate') || format(new Date(), 'yyyy-MM-dd'),
        passengers: 1,
      })
    } else if (!form.from) {
      setSearchForm({
        from: 'Pune',
        to: 'Mumbai',
        date: format(new Date(), 'yyyy-MM-dd'),
        passengers: 1,
      })
    }
  }, [])

  useEffect(() => {
    searchApi.getCities()
      .then(res => { if (res.data?.data?.length) setCities(res.data.data) })
      .catch(() => {})
  }, [])

  const set = (k) => (value) => setSearchForm({ ...form, [k]: value })
  const swap = () => setSearchForm({ ...form, from: form.to, to: form.from })

  const performSearch = async (params) => {
    if (params.from.trim().toLowerCase() === params.to.trim().toLowerCase()) {
      toast.error('Origin and destination cannot be the same')
      return
    }
    setLoading(true)
    try {
      const { data } = await searchApi.searchBuses({
        origin: params.from.trim(),
        destination: params.to.trim(),
        travelDate: params.date,
        seats: 1,
      })
      const list = data?.data ?? []
      setSearchResults(list)
      if (list.length === 0) toast('No buses found for this route/date')
    } catch {
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    await performSearch(form)
  }

  useEffect(() => {
    const shouldAutoSearch = state?.autoSearch || searchParams.get('auto') === '1'
    if (!shouldAutoSearch || autoSearched.current) return
    autoSearched.current = true
    performSearch({
      from: state?.searchParams?.from || searchParams.get('origin') || form.from,
      to: state?.searchParams?.to || searchParams.get('destination') || form.to,
      date: state?.searchParams?.date || searchParams.get('travelDate') || form.date,
      passengers: 1,
    })
  }, [])

  const sorted = results ? [...results].sort((a, b) =>
    sortBy === 'price' ? a.baseFare - b.baseFare :
    sortBy === 'departure' ? (a.departureTime || '').localeCompare(b.departureTime || '') :
    b.availableSeats - a.availableSeats
  ) : []

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-shell"
    >
      <div className="border-b border-border-light bg-white">
        <div className="section-wrap py-6">
          <h1 className="text-2xl font-bold text-secondary">Search buses</h1>
          <p className="mt-1 text-sm text-text-muted">Compare timings, seats and fares for your route.</p>

          <form onSubmit={handleSearch} className="mt-5 rounded-xl border border-border-light bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr_0.85fr_auto] xl:items-end">
              <div>
                <CitySearchInput
                  label="From"
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
                className="hidden h-[44px] w-[44px] items-center justify-center rounded-lg border border-border-medium bg-gray-50 text-secondary hover:border-primary hover:text-primary transition-colors xl:flex"
                aria-label="Swap route"
              >
                <MdSwapHoriz className="text-xl" />
              </button>

              <div>
                <CitySearchInput
                  label="To"
                  value={form.to}
                  onChange={set('to')}
                  cities={cities}
                  accent="var(--color-accent)"
                  placeholder="Search destination city"
                />
              </div>

              <div>
                <JourneyDatePicker value={form.date} onChange={set('date')} label="Date" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary h-12 px-7">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="section-wrap py-8">
        {loading ? (
          <div className="flex flex-col gap-4">
            <SkeletonLoader className="h-32 w-full" />
            <SkeletonLoader className="h-32 w-full" />
            <SkeletonLoader className="h-32 w-full" />
          </div>
        ) : results === null ? (
          <div className="rounded-xl border border-dashed border-border-medium bg-white p-12 text-center">
            <FaBusAlt className="mx-auto mb-4 text-5xl text-primary" />
            <h2 className="text-xl font-bold text-secondary">Start with your route</h2>
            <p className="mt-2 text-[15px] text-text-muted">Choose a city pair and date to see available buses.</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-medium bg-white p-12 text-center">
            <FaBusAlt className="mx-auto mb-4 text-5xl text-gray-300" />
            <h2 className="text-xl font-bold text-secondary">No buses found</h2>
            <p className="mt-2 text-[15px] text-text-muted">Try changing the date or route.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[250px_1fr]">
            <aside className="card h-fit p-5">
              <div className="mb-4 flex items-center gap-2">
                <FaFilter className="text-primary" />
                <h2 className="font-bold text-secondary">Sort results</h2>
              </div>
              <div className="grid gap-2">
                {[
                  ['price', 'Lowest fare'],
                  ['departure', 'Earliest departure'],
                  ['seats', 'Most seats'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`rounded-lg border px-3 py-2 text-left text-[15px] font-medium transition-colors ${
                      sortBy === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-medium bg-white text-text-muted hover:border-primary/40 hover:text-secondary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </aside>

            <main>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-secondary">{sorted.length} bus{sorted.length > 1 ? 'es' : ''} found</p>
                  <p className="text-[15px] text-text-muted">{form.from} to {form.to} on {form.date}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {sorted.map(bus => (
                  <motion.div
                    key={bus.scheduleId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <JourneyCard
                      bus={bus}
                      onSelect={() => navigate('/book', { state: { bus, searchParams: form } })}
                      onReviewsClick={() => navigate(`/routes/${bus.routeId}`, { state: { route: bus } })}
                    />
                  </motion.div>
                ))}
              </div>
            </main>
          </div>
        )}
      </div>
    </motion.div>
  )
}
