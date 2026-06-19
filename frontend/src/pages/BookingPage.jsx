import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { FaArrowLeft, FaArrowRight, FaBus, FaCheck, FaCheckCircle, FaCreditCard, FaDownload, FaMobileAlt, FaShieldAlt, FaUniversity, FaUser } from 'react-icons/fa'
import { MdEventSeat, MdPayment } from 'react-icons/md'
import { bookingApi, seatApi, paymentApi, routeApi, passengerProfileApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import SkeletonLoader from '../components/common/SkeletonLoader'

const CURRENCY = '\u20B9'

function fmtTime(dt) {
  if (!dt) return '--'
  try { return format(parseISO(dt), 'HH:mm') } catch { return dt.slice(11, 16) || '--' }
}

function StepBar({ step }) {
  const steps = [
    { label: 'Seats', icon: <MdEventSeat /> },
    { label: 'Boarding', icon: <FaBus /> },
    { label: 'Passengers', icon: <FaUser /> },
    { label: 'Payment', icon: <MdPayment /> },
  ]

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="mx-auto flex min-w-max items-center justify-center">
        {steps.map((item, i) => (
          <div key={item.label} className="flex items-center">
            <div className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-bold transition-colors ${
              i < step
                ? 'border-success bg-success text-white'
                : i === step
                  ? 'border-primary bg-primary text-white'
                  : 'border-border-light bg-surface text-text-muted'
            }`}>
              {i < step ? <FaCheck /> : item.icon}
              {item.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-[2px] w-8 ${i < step ? 'bg-success' : 'bg-border-light'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


function BerthButton({ seat, selected, onToggle }) {
  if (!seat) return <div className="w-[52px] shrink-0" />
  const isBooked = seat.status && seat.status !== 'AVAILABLE'
  const isSel = Boolean(selected.find(s => s.seatId === seat.seatId))

  let btnCls = 'berth-btn '
  if (isBooked) {
    btnCls += 'berth-booked'
  } else if (isSel) {
    btnCls += 'berth-selected'
  } else {
    btnCls += 'berth-available'
  }

  const isMale = seat.gender === 'MALE'
  const iconColorCls = isBooked ? (isMale ? 'text-blue-300' : 'text-pink-300') : 'text-blue-500'

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        disabled={isBooked}
        onClick={() => onToggle(seat)}
        aria-pressed={isSel}
        aria-label={`${seat.seatNumber} ${isBooked ? 'sold' : isSel ? 'selected' : 'available'}`}
        className={btnCls}
      >
        {(isBooked || isSel) && (
          <div className={`absolute top-2 w-full flex justify-center ${iconColorCls}`}>
            <FaUser className="text-[10px]" />
          </div>
        )}
        <span className="berth-strip" />
      </button>
    </div>
  )
}

// ── Legend strip ──────────────────────────────────────────────────────────────
function SeatLegend() {
  return (
    <div className="mb-5 flex flex-wrap justify-center gap-5 text-xs text-slate-600">
      {[
        ['Available', 'berth-btn berth-available', false],
        ['Selected',  'berth-btn berth-selected',  false],
        ['Booked',    'berth-btn berth-booked',     true],
      ].map(([label, cls, disabled]) => (
        <div key={label} className="flex items-center gap-2">
          <button type="button" disabled={disabled} className={`${cls} !w-7 !h-9 !rounded-md pointer-events-none`}>
            <span className="berth-strip" />
          </button>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function SeatGrid({ seats, selected, onToggle, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <SkeletonLoader className="h-64 w-32 rounded-2xl" />
        <SkeletonLoader className="h-64 w-32 rounded-2xl" />
      </div>
    )
  }

  if (!seats.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-slate-50 py-14 text-center">
        <MdEventSeat className="mx-auto mb-3 text-4xl text-slate-300" />
        <p className="text-sm font-700 text-slate-500">No seat data is available for this schedule.</p>
      </div>
    )
  }

  // ── Detect sleeper layout via seatType field ──────────────────────────────
  const isSleeper = seats.some(s => /^\d+[A-F]$/.test(s.seatNumber || ''))

  // ── Standard (non-sleeper) grid — S1, S2, S3... ───────────────────────────
  if (!isSleeper) {
    const rows = []
    for (let i = 0; i < seats.length; i += 3) rows.push(seats.slice(i, i + 3))
    return (
      <div>
        <SeatLegend />
        <div className="mx-auto max-w-xs rounded-2xl border border-border-medium bg-surface shadow-sm overflow-hidden">
          <div className="flex items-center justify-center gap-2 bg-secondary px-8 py-2 text-xs font-bold text-white">
            <FaBus /> Front · Driver
          </div>
          <div className="flex flex-col gap-3 p-4">
            {rows.map((row, ri) => (
              <div key={ri} className="flex items-center justify-center gap-2">
                <BerthButton seat={row[0]} selected={selected} onToggle={onToggle} />
                <div className="w-5 border-b border-dashed border-gray-300" />
                <BerthButton seat={row[1]} selected={selected} onToggle={onToggle} />
                <BerthButton seat={row[2]} selected={selected} onToggle={onToggle} />
              </div>
            ))}
          </div>
          <div className="border-t border-border-light bg-surface py-2 text-center text-xs text-text-muted">Rear exit</div>
        </div>
      </div>
    )
  }

  // ── Sleeper layout ─────────────────────────────────────────────────────────
  // Backend generates 6 seats per row:
  //   NA = LOWER_LEFT   NB = LOWER_RIGHT   NC = LOWER_RIGHT
  //   ND = UPPER_LEFT   NE = UPPER_RIGHT   NF = UPPER_RIGHT
  // For 30 seats → 5 rows → 15 lower (5×3) + 15 upper (5×3)
  //
  // Each deck row layout:  [left]  — aisle —  [right1] [right2]

  // Group by row number extracted from seat number (e.g. "3B" → row 3, col "B")
  const rowMap = {}
  seats.forEach(seat => {
    const match = seat.seatNumber.match(/^(\d+)([A-F])$/)
    if (!match) return
    const rowNum = parseInt(match[1])
    const col    = match[2]
    if (!rowMap[rowNum]) rowMap[rowNum] = {}
    rowMap[rowNum][col] = seat
  })
  const rowNums = Object.keys(rowMap).map(Number).sort((a, b) => a - b)

  if (!rowNums.length) {
    return (
      <div>
        <SeatLegend />
        <div className="rounded-lg border border-dashed border-gray-300 bg-slate-50 py-10 text-center">
          <MdEventSeat className="mx-auto mb-3 text-4xl text-slate-300" />
          <p className="text-sm font-700 text-slate-500">Seat layout is not available for this bus.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SeatLegend />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center">

        {/* ── Lower deck: A (left) + B C (right) ── */}
        <div className="deck-panel">
          <div className="deck-header">
            <span className="text-sm font-bold text-secondary">Lower deck</span>
            <span className="deck-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2"  x2="12" y2="9" />
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                <line x1="19.07" y1="4.93" x2="14.83" y2="9.17" />
              </svg>
            </span>
          </div>
          <div className="flex flex-col gap-3 p-3">
            {rowNums.map(rowNum => (
              <div key={rowNum} className="flex items-center justify-center gap-2">
                <BerthButton seat={rowMap[rowNum].A || null} selected={selected} onToggle={onToggle} />
                <div className="w-4 border-b border-dashed border-gray-300" />
                <BerthButton seat={rowMap[rowNum].B || null} selected={selected} onToggle={onToggle} />
                <BerthButton seat={rowMap[rowNum].C || null} selected={selected} onToggle={onToggle} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Upper deck: D (left) + E F (right) ── */}
        <div className="deck-panel">
          <div className="deck-header">
            <span className="text-sm font-bold text-secondary">Upper deck</span>
          </div>
          <div className="flex flex-col gap-3 p-3">
            {rowNums.map(rowNum => (
              <div key={rowNum} className="flex items-center justify-center gap-2">
                <BerthButton seat={rowMap[rowNum].D || null} selected={selected} onToggle={onToggle} />
                <div className="w-4 border-b border-dashed border-gray-300" />
                <BerthButton seat={rowMap[rowNum].E || null} selected={selected} onToggle={onToggle} />
                <BerthButton seat={rowMap[rowNum].F || null} selected={selected} onToggle={onToggle} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

const PAYMENT_METHODS = [
  { key: 'UPI', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: <FaMobileAlt /> },
  { key: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: <FaCreditCard /> },
  { key: 'NET_BANKING', label: 'Net Banking', desc: 'All major banks', icon: <FaUniversity /> },
  { key: 'WALLET', label: 'Wallet', desc: 'Fast wallet checkout', icon: <MdPayment /> },
]

export default function BookingPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const bus = state?.bus
  const [step, setStep] = useState(0)
  const [seats, setSeats] = useState([])
  const [seatsLoading, setSeatsLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [passengers, setPassengers] = useState([])
  const [payMethod, setPayMethod] = useState('UPI')
  const [loading, setLoading] = useState(false)
  const [pickupLocations, setPickupLocations] = useState([])
  const [dropLocations, setDropLocations] = useState([])
  const [pickupLocationId, setPickupLocationId] = useState(null)
  const [dropLocationId, setDropLocationId] = useState(null)
  const [pickupSubLocationId, setPickupSubLocationId] = useState(null)
  const [dropSubLocationId, setDropSubLocationId] = useState(null)
  const [savedProfiles, setSavedProfiles] = useState([])

  useEffect(() => {
    if (!bus?.scheduleId) return
    let cancelled = false
    let eventSource = null

    const loadInitialSeats = async () => {
      setSeatsLoading(true)
      try {
        const res = await seatApi.getSeats(bus.scheduleId)
        if (cancelled) return
        const normalized = (res.data?.data ?? []).map(seat => ({
          ...seat,
          status: seat.status || 'AVAILABLE',
          fare: seat.fare || bus.baseFare,
        }))
        setSeats(normalized)
        setSelected(prev => prev.filter(selectedSeat => {
          const current = normalized.find(seat => seat.seatId === selectedSeat.seatId)
          return current && current.status === 'AVAILABLE'
        }))
      } catch {
        if (!cancelled) setSeats([])
      } finally {
        if (!cancelled) setSeatsLoading(false)
      }
    }

    const loadRouteLocations = async () => {
      try {
        const res = await routeApi.getRoute(bus.routeId)
        if (!cancelled) {
          const routeData = res.data?.data
          setPickupLocations(routeData?.pickupLocations || [])
          setDropLocations(routeData?.dropLocations || [])
        }
      } catch (err) {
        console.error("Failed to load route locations", err)
      }
    }

    const loadSavedProfiles = async () => {
      if (!user) return
      try {
        const { data } = await passengerProfileApi.getProfiles()
        if (!cancelled) setSavedProfiles(data?.data || [])
      } catch (err) {
        console.error("Failed to load passenger profiles", err)
      }
    }

    const connectSSE = () => {
      eventSource = new EventSource(`/api/schedules/${bus.scheduleId}/seats/stream`)
      
      eventSource.addEventListener('seats', (event) => {
        try {
          const data = JSON.parse(event.data)
          const normalized = data.map(seat => ({
            ...seat,
            status: seat.status || 'AVAILABLE',
            fare: seat.fare || bus.baseFare,
          }))
          setSeats(normalized)
          setSelected(prev => prev.filter(selectedSeat => {
            const current = normalized.find(seat => seat.seatId === selectedSeat.seatId)
            return current && current.status === 'AVAILABLE'
          }))
          setSeatsLoading(false)
        } catch (e) {
          console.error("Failed to parse SSE data", e)
        }
      })

      eventSource.onerror = () => {
        eventSource.close()
        setTimeout(() => {
          if (!cancelled) connectSSE()
        }, 5000)
      }
    }

    loadInitialSeats()
    loadRouteLocations()
    loadSavedProfiles()
    connectSSE()

    return () => {
      cancelled = true
      if (eventSource) eventSource.close()
    }
  }, [bus?.scheduleId, bus?.baseFare])

  if (!bus) {
    return (
      <div className="page-shell flex items-center justify-center p-4">
        <div className="card max-w-md p-8 text-center">
          <FaBus className="mx-auto mb-4 text-5xl text-gray-300" />
          <h1 className="text-2xl font-bold text-secondary">No bus selected</h1>
          <p className="mt-2 text-sm text-text-muted">Search for a route and choose a bus before booking seats.</p>
          <button onClick={() => navigate('/search')} className="btn-primary mt-6 w-full justify-center">
            <FaArrowLeft className="mr-2"/> Search buses
          </button>
        </div>
      </div>
    )
  }

  const toggleSeat = (seat) => {
    if (seat.status && seat.status !== 'AVAILABLE') {
      toast.error('This seat is already booked')
      return
    }
    setSelected(prev =>
      prev.find(s => s.seatId === seat.seatId)
        ? prev.filter(s => s.seatId !== seat.seatId)
        : [...prev, seat]
    )
  }

  const totalFare = selected.reduce((sum, s) => sum + Number(s.fare), 0)
  const depTime = fmtTime(bus.departureTime)
  const arrTime = fmtTime(bus.arrivalTime)

  const goToPassengers = () => {
    if (!selected.length) {
      toast.error('Please select at least one seat')
      return
    }
    setPassengers(selected.map(s => ({ seatId: s.seatId, seatLabel: s.seatNumber, name: '', age: '', gender: '' })))
    setStep(1)
  }

  const goToBoarding = () => {
    if (!pickupLocationId || !dropLocationId) {
      toast.error('Please select both pickup and drop points')
      return
    }
    const pLoc = pickupLocations.find(s => s.id === pickupLocationId)
    const dLoc = dropLocations.find(s => s.id === dropLocationId)
    
    if (pLoc?.subLocations?.length > 0 && !pickupSubLocationId) {
      toast.error(`Please select a specific boarding point at ${pLoc.pickupName}`)
      return
    }
    if (dLoc?.subLocations?.length > 0 && !dropSubLocationId) {
      toast.error(`Please select a specific dropping point at ${dLoc.dropName}`)
      return
    }

    if (pLoc && dLoc && pLoc.sequenceOrder >= dLoc.sequenceOrder) {
      toast.error('Drop point sequence must be logically valid for this route.')
      // Assuming valid sequence orders might not directly correspond between two lists, but if we need a check, we can omit it or refine it.
    }
    setStep(2)
  }

  const goToPayment = () => {
    const invalid = passengers.find(p => !p.name.trim() || !p.age || !p.gender)
    if (invalid) {
      toast.error('Please fill all passenger details including gender')
      return
    }
    setStep(3)
  }

  // ── Razorpay payment flow ──────────────────────────────────────────────

  /** Dynamically loads the Razorpay checkout.js SDK if not already present */
  const loadRazorpayScript = () =>
    new Promise(resolve => {
      if (document.getElementById('razorpay-sdk')) return resolve(true)
      const script = document.createElement('script')
      script.id = 'razorpay-sdk'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Step 1: Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript()
      if (!sdkLoaded) {
        toast.error('Failed to load payment SDK. Please check your internet connection.')
        setLoading(false)
        return
      }

      // Step 2: Create Razorpay order on the server
      const orderPayload = {
        scheduleId: bus.scheduleId,
        pickupLocationId: pickupLocationId || null,
        dropLocationId: dropLocationId || null,
        pickupSubLocationId: pickupSubLocationId || null,
        dropSubLocationId: dropSubLocationId || null,
        passengers: passengers.map(p => ({
          seatId: p.seatId,
          passengerName: p.name.trim(),
          passengerAge: parseInt(p.age, 10),
          passengerGender: p.gender,
        })),
      }
      const { data: orderRes } = await paymentApi.createOrder(orderPayload)
      const order = orderRes?.data

      if (!order?.orderId) {
        toast.error('Could not create payment order. Please try again.')
        setLoading(false)
        return
      }

      // Intercept mock order for testing without valid keys
      if (order.orderId.startsWith('order_mock_')) {
        toast.success('Mock payment successful (Test Mode)')
        await handleRazorpaySuccess({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: 'pay_mock_' + Date.now(),
          razorpay_signature: 'mock_signature_valid'
        })
        return
      }

      // Step 3: Open Razorpay checkout popup
      const razorpayOptions = {
        key: order.keyId,
        amount: Math.round(Number(order.amount) * 100), // paise
        currency: order.currency || 'INR',
        name: order.companyName || 'BookMyRoute',
        description: order.description || `${bus.origin} → ${bus.destination}`,
        order_id: order.orderId,
        prefill: {
          name:  order.customerName  || '',
          email: order.customerEmail || '',
          contact: order.customerPhone || '',
        },
        theme: { color: 'var(--color-primary)' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
            setLoading(false)
          },
        },

        // Step 4: Called by Razorpay after successful payment
        handler: async (response) => {
          await handleRazorpaySuccess(response)
        },
      }

      const rzp = new window.Razorpay(razorpayOptions)
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error?.description || 'Unknown error'}`)
        setLoading(false)
      })
      rzp.open()

    } catch (err) {
      console.error('Payment Error:', err)
      toast.error('Something went wrong initiating payment. Please try again.')
      setLoading(false)
    }
  }

  const handleRazorpaySuccess = async (response) => {
          try {
            const verifyPayload = {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              scheduleId:        bus.scheduleId,
              paymentMethod:     payMethod,
              pickupLocationId: pickupLocationId || null,
              dropLocationId: dropLocationId || null,
              pickupSubLocationId: pickupSubLocationId || null,
              dropSubLocationId: dropSubLocationId || null,
              passengers: passengers.map(p => ({
                seatId:         p.seatId,
                passengerName:  p.name.trim(),
                passengerAge:   parseInt(p.age, 10),
                passengerGender: p.gender,
              })),
            }

            const { data: verifyRes } = await paymentApi.verifyPayment(verifyPayload)
            const booking = verifyRes?.data

            toast.success(booking?.notificationEmailSent
              ? 'Payment successful! Booking confirmed and email sent.'
              : 'Payment successful! Booking confirmed.')

            navigate(`/booking-confirmation/${booking?.bookingRef || 'BMR-CONFIRMED'}`, {
              replace: true,
              state: {
                confirmedData: {
                  ref:          booking?.bookingRef || 'BMR-CONFIRMED',
                  amount:       booking?.totalAmount || totalFare,
                  status:       booking?.bookingStatus || 'CONFIRMED',
                  emailSent:    booking?.notificationEmailSent === true,
                  emailMessage: booking?.notificationEmailMessage,
                  paymentId:    response.razorpay_payment_id,
                  routeInfo:    `${bus.origin} to ${bus.destination}`,
                  busName:      bus.busName,
                  depTime:      depTime,
                  pickupLocationName: booking?.pickupLocationName,
                  pickupSubLocationName: booking?.pickupSubLocationName,
                  dropLocationName: booking?.dropLocationName,
                  dropSubLocationName: booking?.dropSubLocationName,
                  seats:        selected.map(s => s.seatNumber).join(', '),
                  passengerCount: selected.length
                }
              }
            })
          } catch {
            toast.error('Payment was received but booking confirmation failed. Contact support with your payment ID.')
          } finally {
            setLoading(false)
          }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-shell py-8"
    >
      <div className="section-wrap max-w-5xl">
        <StepBar step={step} />

        <div className="card mb-6 p-5 border-l-4 border-l-primary">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
                <FaBus />
              </div>
              <div>
                <p className="font-bold text-secondary">{bus.busName}</p>
                <p className="text-sm text-text-muted">{bus.busType}</p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-secondary">{depTime}</p>
                <p className="text-sm text-text-muted">{bus.origin}</p>
              </div>
              <FaArrowRight className="text-border-medium" />
              <div>
                <p className="text-xl font-bold text-secondary">{arrTime}</p>
                <p className="text-sm text-text-muted">{bus.destination}</p>
              </div>
            </div>

            <div className="rounded-lg bg-surface px-4 py-3 text-right">
              <p className="text-2xl font-bold font-mono text-primary">₹{bus.baseFare}<span className="text-sm font-medium font-sans text-text-muted">/seat</span></p>
              {selected.length > 0 && <p className="text-sm font-bold text-success">Total: ₹{totalFare}</p>}
            </div>
          </div>
        </div>

        {step === 0 && (
          <div className="card p-6">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-secondary">
              <div className="bg-primary/10 p-2 rounded-lg"><MdEventSeat className="text-primary" /></div> Select seats
            </h2>
            <SeatGrid seats={seats} selected={selected} onToggle={toggleSeat} loading={seatsLoading} />
            {selected.length > 0 && (
              <div className="mt-8 flex flex-col gap-4 rounded-lg border border-warning bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-secondary">Selected: {selected.map(s => s.seatNumber).join(', ')}</p>
                  <p className="text-[15px] text-text-muted">{selected.length} seat{selected.length > 1 ? 's' : ''} | Total Fare: <span className="font-mono text-secondary font-bold">₹{totalFare}</span></p>
                </div>
                <button onClick={goToPassengers} className="btn-primary whitespace-nowrap">
                  Continue <FaArrowRight />
                </button>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="card p-6">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-secondary">
              <div className="bg-primary/10 p-2 rounded-lg"><FaBus className="text-primary" /></div> Boarding & Dropping Points
            </h2>
            {pickupLocations.length > 0 || dropLocations.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">Pickup Point</h3>
                  <div className="grid gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {pickupLocations.map(loc => (
                      <div key={`pickup-${loc.id}`} className={`rounded-xl border transition-colors overflow-hidden ${
                        pickupLocationId === loc.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border-light bg-surface hover:border-primary/50'
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            setPickupLocationId(loc.id)
                            setPickupSubLocationId(null)
                          }}
                          className="w-full flex flex-col text-left p-4"
                        >
                          <span className="font-bold text-secondary">{loc.pickupName}</span>
                          <span className="text-sm text-text-muted">{loc.pickupTime}</span>
                        </button>
                        {pickupLocationId === loc.id && loc.subLocations?.length > 0 && (
                          <div className="px-4 pb-4 pt-1 bg-white border-t border-dashed border-primary/20">
                            <p className="text-xs font-bold text-text-muted uppercase mb-2">Select Boarding Point</p>
                            <div className="grid gap-2">
                              {loc.subLocations.map(sub => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => setPickupSubLocationId(sub.id)}
                                  className={`text-left text-sm p-2 rounded-lg border transition-colors flex items-center justify-between ${
                                    pickupSubLocationId === sub.id
                                      ? 'bg-primary text-white border-primary font-medium shadow-sm'
                                      : 'bg-surface border-border-light hover:border-primary text-secondary'
                                  }`}
                                >
                                  <span>{sub.subLocationName}</span>
                                  {pickupSubLocationId === sub.id && <FaCheckCircle className="text-white" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">Drop Point</h3>
                  <div className="grid gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {dropLocations.map(loc => (
                      <div key={`drop-${loc.id}`} className={`rounded-xl border transition-colors overflow-hidden ${
                        dropLocationId === loc.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border-light bg-surface hover:border-primary/50'
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            setDropLocationId(loc.id)
                            setDropSubLocationId(null)
                          }}
                          className="w-full flex flex-col text-left p-4"
                        >
                          <span className="font-bold text-secondary">{loc.dropName}</span>
                          <span className="text-sm text-text-muted">{loc.dropTime}</span>
                        </button>
                        {dropLocationId === loc.id && loc.subLocations?.length > 0 && (
                          <div className="px-4 pb-4 pt-1 bg-white border-t border-dashed border-primary/20">
                            <p className="text-xs font-bold text-text-muted uppercase mb-2">Select Dropping Point</p>
                            <div className="grid gap-2">
                              {loc.subLocations.map(sub => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => setDropSubLocationId(sub.id)}
                                  className={`text-left text-sm p-2 rounded-lg border transition-colors flex items-center justify-between ${
                                    dropSubLocationId === sub.id
                                      ? 'bg-primary text-white border-primary font-medium shadow-sm'
                                      : 'bg-surface border-border-light hover:border-primary text-secondary'
                                  }`}
                                >
                                  <span>{sub.subLocationName}</span>
                                  {dropSubLocationId === sub.id && <FaCheckCircle className="text-white" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                No boarding/dropping points available for this route.
              </div>
            )}
            
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button onClick={() => setStep(0)} className="btn-outline justify-center h-12"><FaArrowLeft className="mr-2"/> Back</button>
              <button onClick={goToBoarding} disabled={(pickupLocations.length > 0 || dropLocations.length > 0) && (!pickupLocationId || !dropLocationId)} className="btn-primary justify-center h-12">Continue <FaArrowRight className="ml-2"/></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card p-6">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-secondary">
              <div className="bg-primary/10 p-2 rounded-lg"><FaUser className="text-primary" /></div> Passenger details
            </h2>
            <div className="grid gap-5">
              {passengers.map((passenger, i) => (
                <div key={passenger.seatId} className="rounded-xl border border-border-light p-5 bg-surface/50">
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-[15px] font-bold text-secondary">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs text-white">{passenger.seatLabel}</span>
                      Passenger {i + 1}
                    </p>
                    
                    {savedProfiles.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        <span className="text-xs font-bold text-text-muted whitespace-nowrap">AUTOFILL:</span>
                        {savedProfiles.map(profile => (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => {
                              setPassengers(items => items.map((item, j) => 
                                j === i ? { ...item, name: profile.fullName, age: profile.age, gender: profile.gender } : item
                              ))
                              toast.success(`Autofilled with ${profile.fullName}`)
                            }}
                            className="text-xs font-bold bg-white border border-border-medium rounded-full px-3 py-1 hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                          >
                            {profile.fullName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="mb-1.5 block text-xs font-bold uppercase text-text-muted tracking-wider">Full name</span>
                      <input
                        value={passenger.name}
                        onChange={e => setPassengers(items => items.map((item, j) => j === i ? { ...item, name: e.target.value } : item))}
                        placeholder="Enter full name"
                        className="input-field"
                      />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-bold uppercase text-text-muted tracking-wider">Age</span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={passenger.age}
                        onChange={e => setPassengers(items => items.map((item, j) => j === i ? { ...item, age: e.target.value } : item))}
                        placeholder="Age"
                        className="input-field"
                      />
                    </label>
                    <label className="sm:col-span-2 mt-2">
                      <span className="mb-2 block text-xs font-bold uppercase text-text-muted tracking-wider">Gender</span>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" name={`gender-${i}`} value="MALE" checked={passenger.gender === 'MALE'} onChange={e => setPassengers(items => items.map((item, j) => j === i ? { ...item, gender: e.target.value } : item))} className="accent-primary w-4 h-4" />
                          <span className="text-[15px] font-medium text-secondary group-hover:text-primary transition-colors">Male</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" name={`gender-${i}`} value="FEMALE" checked={passenger.gender === 'FEMALE'} onChange={e => setPassengers(items => items.map((item, j) => j === i ? { ...item, gender: e.target.value } : item))} className="accent-primary w-4 h-4" />
                          <span className="text-[15px] font-medium text-secondary group-hover:text-primary transition-colors">Female</span>
                        </label>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button onClick={() => setStep(1)} className="btn-outline justify-center h-12"><FaArrowLeft className="mr-2"/> Back</button>
              <button onClick={goToPayment} className="btn-primary justify-center h-12">Continue <FaArrowRight className="ml-2"/></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card p-6">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-secondary">
              <div className="bg-primary/10 p-2 rounded-lg"><MdPayment className="text-primary" /></div> Payment
            </h2>
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">Select payment method</p>
                <div className="grid gap-3">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => setPayMethod(method.key)}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                        payMethod === method.key
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border-light bg-surface hover:border-primary/50'
                      }`}
                    >
                      <span className={`text-2xl ${payMethod === method.key ? 'text-primary' : 'text-text-muted'}`}>{method.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-secondary">{method.label}</span>
                        <span className="block text-[13px] text-text-muted mt-0.5">{method.desc}</span>
                      </span>
                      {payMethod === method.key && <FaCheckCircle className="text-primary text-xl" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">Order summary</p>
                <div className="rounded-xl border border-border-light bg-surface p-5 shadow-sm">
                  <div className="grid gap-3 mb-4">
                    {selected.map(seat => (
                      <div key={seat.seatId} className="flex justify-between text-[15px]">
                        <span className="text-text-muted">Seat <span className="font-semibold text-secondary">{seat.seatNumber}</span></span>
                        <span className="font-bold font-mono text-secondary">₹{seat.fare}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between border-t border-dashed border-border-medium pt-4">
                    <span className="font-bold text-secondary">Total</span>
                    <span className="text-2xl font-bold font-mono text-primary">₹{totalFare}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">
                  <FaShieldAlt className="text-lg shrink-0 mt-0.5" /> 
                  <span>Your payment is secured and encrypted with bank-grade security.</span>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-xl mx-auto">
              <button onClick={() => setStep(2)} className="btn-outline justify-center h-12"><FaArrowLeft className="mr-2"/> Back</button>
              <button onClick={handlePayment} disabled={loading} className="btn-primary justify-center h-12">
                {loading ? 'Processing...' : `Pay ₹${totalFare}`} <FaArrowRight className="ml-2"/>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
