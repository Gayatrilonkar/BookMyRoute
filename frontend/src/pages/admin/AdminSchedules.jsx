import { useState, useEffect, useMemo } from 'react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaCalendarAlt, FaSearch, FaBus, FaRupeeSign, FaTimes, FaCheckCircle, FaBan, FaExclamationTriangle, FaMapMarkedAlt, FaClock, FaCalendarDay } from 'react-icons/fa'
import { format, parseISO, addMinutes, isAfter } from 'date-fns'
import { motion } from 'framer-motion'
import AdminModal from '../../components/common/AdminModal'

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([])
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState(1)
  const [backendConflictMsg, setBackendConflictMsg] = useState(null)
  
  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    departureTime: '',
    baseFare: '',
    recurrenceType: 'NONE',
    recurrenceEndDate: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [schedRes, busRes, routeRes] = await Promise.all([
        adminApi.getSchedules(),
        adminApi.getBuses({ active: true }),
        adminApi.getRoutes()
      ])
      setSchedules(schedRes.data.data || [])
      setBuses(busRes.data.data || [])
      setRoutes(routeRes.data.data || [])
    } catch (err) {
      toast.error('Failed to load schedules data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (schedule) => {
    try {
      if (schedule.isActive) {
        // Assume API has a generic update or we need a toggle endpoint, using update for now
        await adminApi.updateSchedule(schedule.scheduleId, { ...schedule, isActive: false })
        toast.success(`Schedule deactivated`)
      } else {
        await adminApi.updateSchedule(schedule.scheduleId, { ...schedule, isActive: true })
        toast.success(`Schedule activated`)
      }
      fetchData()
    } catch (err) {
      toast.error('Failed to update schedule status')
    }
  }

  const handleNext = () => {
    setBackendConflictMsg(null)
    if (step === 1) {
      if (!formData.busId || !formData.routeId) return toast.error("Please select a Bus and a Route")
    }
    if (step === 2) {
      if (!formData.departureTime || !formData.baseFare) return toast.error("Please fill in Time and Fare")
      if (new Date(formData.departureTime) < new Date()) return toast.error("Departure time must be in the future")
    }
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setBackendConflictMsg(null)
    setStep(s => s - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBackendConflictMsg(null)

    try {
      // Calculate Arrival Time dynamically
      const selectedRoute = routes.find(r => r.routeId === parseInt(formData.routeId))
      const selectedBus = buses.find(b => b.busId === parseInt(formData.busId))
      const arrTime = addMinutes(new Date(formData.departureTime), selectedRoute.durationMins || 120)

      const payload = {
        busId: parseInt(formData.busId),
        routeId: parseInt(formData.routeId),
        departureTime: formData.departureTime + (formData.departureTime.length === 16 ? ':00' : ''),
        arrivalTime: format(arrTime, "yyyy-MM-dd'T'HH:mm:ss"),
        baseFare: parseFloat(formData.baseFare),
        availableSeats: selectedBus.totalSeats,
        recurrenceType: formData.recurrenceType,
        recurrenceEndDate: formData.recurrenceType !== 'NONE' ? formData.recurrenceEndDate : null
      }

      await adminApi.createSchedule(payload)
      toast.success(formData.recurrenceType !== 'NONE' ? 'Recurring schedules created successfully' : 'Schedule created successfully')
      setShowModal(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create schedule'
      if (msg.toLowerCase().includes('conflict')) {
        setBackendConflictMsg(msg)
      } else {
        toast.error(msg)
      }
    }
  }

  const handleAddNew = () => {
    setFormData({
      busId: '',
      routeId: '',
      departureTime: '',
      baseFare: '',
      recurrenceType: 'NONE',
      recurrenceEndDate: ''
    })
    setStep(1)
    setBackendConflictMsg(null)
    setShowModal(true)
  }

  const filteredSchedules = schedules.filter(s => 
    s.origin.toLowerCase().includes(search.toLowerCase()) || 
    s.destination.toLowerCase().includes(search.toLowerCase()) ||
    s.busName.toLowerCase().includes(search.toLowerCase())
  )

  const groupedSchedules = useMemo(() => {
    const map = {}
    filteredSchedules.forEach(s => {
      const d = format(new Date(s.departureTime), 'yyyy-MM-dd')
      if (!map[d]) map[d] = []
      map[d].push(s)
    })
    return map
  }, [filteredSchedules])

  const calendarDates = Object.keys(groupedSchedules).sort()

  const selectedRouteObj = routes.find(r => r.routeId === parseInt(formData.routeId))
  const selectedBusObj = buses.find(b => b.busId === parseInt(formData.busId))

  const modalFooter = (
    <div className="flex justify-between items-center w-full">
      {step > 1 ? (
          <button type="button" onClick={handleBack} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
              Back
          </button>
      ) : (
          <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
              Cancel
          </button>
      )}
      
      {step < 3 ? (
          <button onClick={handleNext} className="btn-primary px-8 shadow-sm">
              Next Step
          </button>
      ) : (
          <button onClick={handleSubmit} className="btn-primary px-8 shadow-md hover:shadow-lg flex items-center gap-2">
              <FaCheckCircle /> {formData.recurrenceType !== 'NONE' ? 'Generate Schedules' : 'Publish Schedule'}
          </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-secondary">Schedule Calendar</h2>
          <p className="text-gray-500 font-body text-sm mt-1">Assign buses to routes, manage departure times, and resolve conflicts.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="btn-primary flex items-center gap-2 shadow-sm"
        >
          <FaPlus /> Create Schedule
        </button>
      </div>

      <div className="card p-4 bg-white shadow-sm border border-border-light rounded-2xl flex items-center">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by city or bus name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : calendarDates.length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            No schedules found matching your search.
          </div>
        ) : (
          calendarDates.map(dateStr => (
            <div key={dateStr} className="space-y-4">
              <h3 className="text-lg font-bold text-secondary flex items-center gap-2 border-b border-gray-200 pb-2">
                <FaCalendarAlt className="text-primary" /> {format(parseISO(dateStr), 'EEEE, MMMM do, yyyy')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {groupedSchedules[dateStr].sort((a,b) => new Date(a.departureTime) - new Date(b.departureTime)).map(schedule => (
                  <motion.div layout initial={{opacity:0}} animate={{opacity:1}} key={schedule.scheduleId} className={`card p-5 flex flex-col hover:shadow-lg transition-shadow border relative overflow-hidden ${!schedule.isActive ? 'border-gray-200 opacity-60' : 'border-border-light'}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${schedule.isActive ? 'bg-success' : 'bg-gray-400'}`}></div>
                    
                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div className="font-bold text-secondary text-lg">{format(new Date(schedule.departureTime), 'hh:mm a')}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        schedule.isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 pl-2">
                      <div className="font-bold text-secondary truncate">{schedule.origin}</div>
                      <div className="text-gray-400 text-xs">→</div>
                      <div className="font-bold text-secondary truncate">{schedule.destination}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 pl-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bus</span>
                        <div className="flex items-center gap-1.5">
                          <FaBus className="text-primary text-xs" />
                          <span className="text-sm font-medium text-secondary truncate" title={schedule.busName}>
                            {schedule.busName}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fare</span>
                        <div className="flex items-center gap-1 text-sm font-bold text-success">
                          <FaRupeeSign size={12}/>{schedule.baseFare}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-gray-100 pl-2">
                      <button 
                        onClick={() => handleToggleStatus(schedule)}
                        className={`text-xs font-bold flex items-center gap-1.5 ${
                          schedule.isActive ? 'text-danger hover:text-red-700' : 'text-success hover:text-green-700'
                        }`}
                      >
                        {schedule.isActive ? <><FaBan /> Deactivate</> : <><FaCheckCircle /> Activate</>}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Schedule Builder"
        subtitle="Assign a bus and timings for a route"
        maxWidthClass="max-w-4xl"
        footer={modalFooter}
      >
        <div className="flex flex-col h-full min-h-[500px]">
          {/* Wizard Progress */}
          <div className="px-8 py-6 sticky top-0 bg-white z-10 border-b border-gray-100">
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
              
              {[1,2,3].map(num => (
                  <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {num}
                  </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">
              <span>Assignment</span>
              <span>Timings & Fare</span>
              <span>Recurrence & Preview</span>
            </div>
          </div>
          
          <div className="p-8">
            {step === 1 && (
                <motion.div initial={{x: 20, opacity:0}} animate={{x:0, opacity:1}} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><FaBus className="text-primary"/> Select a Bus</label>
                        <select required className="input-field shadow-sm" value={formData.busId} onChange={e => setFormData({...formData, busId: e.target.value})}>
                          <option value="">-- Choose a Bus --</option>
                          {buses.map(b => <option key={b.busId} value={b.busId}>{b.busName} ({b.busNumber}) - {b.totalSeats} seats</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><FaMapMarkedAlt className="text-primary"/> Select a Route</label>
                        <select required className="input-field shadow-sm" value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})}>
                          <option value="">-- Choose a Route --</option>
                          {routes.map(r => <option key={r.routeId} value={r.routeId}>{r.origin} → {r.destination} ({r.distanceKm}km, {Math.floor(r.durationMins/60)}h {r.durationMins%60}m)</option>)}
                        </select>
                    </div>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div initial={{x: 20, opacity:0}} animate={{x:0, opacity:1}} className="space-y-6">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mb-2">
                       <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                         <FaClock />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-blue-900">Timing Details</p>
                         <p className="text-xs text-blue-700 mt-1">Arrival time will be calculated automatically based on the selected route's duration ({selectedRouteObj?.durationMins} mins).</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Departure Date & Time</label>
                            <input required type="datetime-local" className="input-field shadow-sm" 
                              value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Base Fare (₹)</label>
                            <input required type="number" min="1" step="0.01" className="input-field shadow-sm" placeholder="e.g. 500" 
                              value={formData.baseFare} onChange={e => setFormData({...formData, baseFare: e.target.value})} />
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div initial={{x: 20, opacity:0}} animate={{x:0, opacity:1}} className="space-y-6">
                    <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <FaCalendarDay className="text-primary"/>
                            <h4 className="font-bold text-secondary">Recurrence Configuration</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600 uppercase">Pattern</label>
                                <select className="input-field bg-white" value={formData.recurrenceType} onChange={e => setFormData({...formData, recurrenceType: e.target.value})}>
                                    <option value="NONE">One Time (No Recurrence)</option>
                                    <option value="DAILY">Daily</option>
                                    <option value="WEEKLY">Weekly</option>
                                </select>
                            </div>
                            {formData.recurrenceType !== 'NONE' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600 uppercase">End Date</label>
                                    <input type="date" required className="input-field bg-white" min={formData.departureTime.split('T')[0]}
                                        value={formData.recurrenceEndDate} onChange={e => setFormData({...formData, recurrenceEndDate: e.target.value})} />
                                </div>
                            )}
                        </div>
                    </div>

                    {backendConflictMsg && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mt-4">
                          <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-red-800">Database Conflict Prevented Save</h4>
                            <p className="text-xs text-red-600 mt-1">{backendConflictMsg}</p>
                          </div>
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Schedule Overview</h4>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs">Bus</span>
                                <span className="font-bold text-secondary">{selectedBusObj?.busName}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Route</span>
                                <span className="font-bold text-secondary">{selectedRouteObj?.origin} → {selectedRouteObj?.destination}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Departure</span>
                                <span className="font-bold text-secondary">{formData.departureTime ? format(new Date(formData.departureTime), 'MMM dd, yyyy - hh:mm a') : '-'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Fare</span>
                                <span className="font-bold text-success">₹{formData.baseFare}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
