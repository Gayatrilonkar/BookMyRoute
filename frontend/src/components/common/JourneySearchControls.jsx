import { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameYear,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa'

function todayValue() {
  return format(new Date(), 'yyyy-MM-dd')
}

function parseDate(value) {
  try {
    return value ? parseISO(value) : new Date()
  } catch {
    return new Date()
  }
}

export function CitySearchInput({ label, value, onChange, cities, accent = '#d84e55', placeholder }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const matches = useMemo(() => {
    const clean = (value || '').trim().toLowerCase()
    const list = clean
      ? cities.filter(city => city.toLowerCase().includes(clean))
      : cities
    return list.slice(0, 8)
  }, [cities, value])

  const chooseCity = (city) => {
    onChange(city)
    setOpen(false)
    setActiveIndex(0)
  }

  const handleKeyDown = (event) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(index => Math.min(index + 1, Math.max(matches.length - 1, 0)))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(index => Math.max(index - 1, 0))
    }
    if (event.key === 'Enter' && open && matches[activeIndex]) {
      event.preventDefault()
      chooseCity(matches[activeIndex])
    }
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <label className="mb-1 flex items-center gap-2 text-xs font-800 uppercase tracking-wide text-slate-500">
        <FaMapMarkerAlt style={{ color: accent }} /> {label}
      </label>
      <input
        value={value}
        onChange={event => {
          onChange(event.target.value)
          setOpen(true)
          setActiveIndex(0)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={handleKeyDown}
        className="input-field"
        placeholder={placeholder}
        autoComplete="off"
        required
      />
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          {matches.length > 0 ? matches.map((city, index) => (
            <button
              key={city}
              type="button"
              onMouseDown={event => event.preventDefault()}
              onClick={() => chooseCity(city)}
              className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-700 ${
                index === activeIndex
                  ? 'bg-[#d84e55]/10 text-[#d84e55]'
                  : 'text-[#172033] hover:bg-slate-50'
              }`}
            >
              <FaMapMarkerAlt className="text-slate-400" />
              {city}
            </button>
          )) : (
            <div className="px-4 py-3 text-sm text-slate-500">
              Type the city name and search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function JourneyDatePicker({ value, onChange, label = 'Journey date' }) {
  const selected = parseDate(value)
  const today = parseDate(todayValue())
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(startOfMonth(selected))

  useEffect(() => {
    setViewMonth(startOfMonth(selected))
  }, [value])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [viewMonth])

  const chooseDate = (date) => {
    if (isBefore(date, today) && !isSameDay(date, today)) return
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const canGoPrevious = (
    viewMonth.getFullYear() > today.getFullYear()
    || (isSameYear(viewMonth, today) && viewMonth.getMonth() > today.getMonth())
  )

  return (
    <div className="relative">
      <label className="mb-1 flex items-center gap-2 text-xs font-800 uppercase tracking-wide text-slate-500">
        <FaCalendarAlt className="text-[#059669]" /> {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="input-field flex h-12 items-center justify-between text-left"
      >
        <span className="font-800">{format(selected, 'dd MMM yyyy')}</span>
        <FaCalendarAlt className="text-[#d84e55]" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.35rem)] z-[90] w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(month => subMonths(month, 1))}
              disabled={!canGoPrevious}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-[#172033] hover:border-[#d84e55] hover:text-[#d84e55] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous month"
            >
              <FaChevronLeft />
            </button>
            <p className="font-800 text-[#172033]">{format(viewMonth, 'MMMM yyyy')}</p>
            <button
              type="button"
              onClick={() => setViewMonth(month => addMonths(month, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-[#172033] hover:border-[#d84e55] hover:text-[#d84e55]"
              aria-label="Next month"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-800 uppercase text-slate-400">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map(day => {
              const disabled = isBefore(day, today) && !isSameDay(day, today)
              const active = isSameDay(day, selected)
              const muted = !isSameMonth(day, viewMonth)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => chooseDate(day)}
                  disabled={disabled}
                  className={`flex h-10 items-center justify-center rounded-lg text-sm font-800 transition-colors ${
                    active
                      ? 'bg-[#d84e55] text-white'
                      : disabled
                        ? 'cursor-not-allowed text-slate-300'
                        : muted
                          ? 'text-slate-400 hover:bg-slate-50'
                          : 'text-[#172033] hover:bg-[#d84e55]/10 hover:text-[#d84e55]'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => chooseDate(today)} className="btn-outline flex-1 px-3 py-2">
              Today
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-primary flex-1 px-3 py-2">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
