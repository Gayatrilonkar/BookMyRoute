import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaBus, FaSearch, FaBan, FaCheckCircle, FaEdit, FaCouch, FaLayerGroup, FaWifi, FaVideo, FaChargingStation, FaMapMarkerAlt, FaSnowflake } from 'react-icons/fa'
import { motion } from 'framer-motion'
import AdminModal from '../../components/common/AdminModal'

const AVAILABLE_AMENITIES = [
  { id: 'WiFi', icon: <FaWifi />, label: 'WiFi' },
  { id: 'Water Bottle', icon: <FaSnowflake />, label: 'Water Bottle' },
  { id: 'Blanket', icon: <FaCouch />, label: 'Blanket' },
  { id: 'CCTV', icon: <FaVideo />, label: 'CCTV' },
  { id: 'Charging Point', icon: <FaChargingStation />, label: 'Charging Point' },
  { id: 'Live Tracking', icon: <FaMapMarkerAlt />, label: 'Live Tracking' }
]

export default function AdminBuses() {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBus, setEditingBus] = useState(null)
  
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    busNumber: '',
    busName: '',
    busType: 'AC_SEATER',
    totalSeats: 40,
    amenities: []
  })

  // Designer state
  const [rows, setRows] = useState(10)

  useEffect(() => {
    fetchBuses()
  }, [])

  useEffect(() => {
    const isSleeper = formData.busType.includes('SLEEPER')
    const seatsPerRow = isSleeper ? 6 : 4
    const calculatedSeats = rows * seatsPerRow
    setFormData(prev => ({ ...prev, totalSeats: calculatedSeats }))
  }, [rows, formData.busType])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getBuses()
      setBuses(res.data.data)
    } catch (err) {
      toast.error('Failed to load buses')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (bus) => {
    try {
      await adminApi.toggleBus(bus.busId)
      toast.success(`Bus ${bus.busNumber} status toggled`)
      fetchBuses()
    } catch (err) {
      toast.error('Failed to update bus status')
    }
  }

  const handleEdit = (bus) => {
    setEditingBus(bus)
    setFormData({
      busNumber: bus.busNumber,
      busName: bus.busName,
      busType: bus.busType,
      totalSeats: bus.totalSeats,
      amenities: bus.amenities ? bus.amenities.split(',').map(s => s.trim()) : []
    })
    const isSleeper = bus.busType.includes('SLEEPER')
    setRows(Math.max(1, Math.floor(bus.totalSeats / (isSleeper ? 6 : 4))))
    setStep(1)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingBus(null)
    setFormData({ busNumber: '', busName: '', busType: 'AC_SEATER', totalSeats: 40, amenities: [] })
    setRows(10)
    setStep(1)
    setShowModal(true)
  }

  const toggleAmenity = (amenityId) => {
    setFormData(prev => {
      const current = prev.amenities
      if (current.includes(amenityId)) {
        return { ...prev, amenities: current.filter(a => a !== amenityId) }
      } else {
        return { ...prev, amenities: [...current, amenityId] }
      }
    })
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.busName || !formData.busNumber) {
        return toast.error("Please fill required fields")
      }
    }
    setStep(s => s + 1)
  }

  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        amenities: formData.amenities.join(', ')
      }

      if (editingBus) {
        await adminApi.updateBus(editingBus.busId, payload)
        toast.success('Bus updated successfully')
      } else {
        await adminApi.createBus(payload)
        toast.success('Bus added successfully')
      }
      setShowModal(false)
      fetchBuses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bus')
    }
  }

  const filteredBuses = buses.filter(b => 
    b.busName.toLowerCase().includes(search.toLowerCase()) || 
    b.busNumber.toLowerCase().includes(search.toLowerCase())
  )

  const isSleeper = formData.busType.includes('SLEEPER')

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
      
      {step < 4 ? (
          <button onClick={handleNext} className="btn-primary px-8 shadow-sm">
              Next
          </button>
      ) : (
          <button onClick={handleSubmit} className="btn-primary px-8 shadow-md hover:shadow-lg">
              {editingBus ? 'Save Changes' : 'Create Bus'}
          </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-secondary">Bus Inventory & Layouts</h2>
          <p className="text-gray-500 font-body text-sm mt-1">Design and manage fleet seating configurations.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="btn-primary flex items-center gap-2 shadow-sm"
        >
          <FaPlus /> Add New Bus
        </button>
      </div>

      <div className="card p-4 bg-white shadow-sm border border-border-light rounded-2xl flex items-center">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by bus name or number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 card">
            No buses found matching your search.
          </div>
        ) : (
          filteredBuses.map(bus => (
            <motion.div layout initial={{opacity:0}} animate={{opacity:1}} key={bus.busId} className="card p-6 flex flex-col hover:shadow-lg transition-shadow border border-border-light relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${bus.isActive ? 'bg-success' : 'bg-danger'}`}></div>
              <div className="flex justify-between items-start mb-4 pl-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                    <FaBus />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-secondary">{bus.busName}</h3>
                    <p className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{bus.busNumber}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  bus.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}>
                  {bus.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 pl-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Layout</p>
                  <p className="text-sm font-medium text-secondary">{bus.busType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Capacity</p>
                  <p className="text-sm font-medium text-secondary">{bus.totalSeats} Seats</p>
                </div>
              </div>

              <div className="mb-6 pl-2 flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Amenities</p>
                <div className="flex flex-wrap gap-1">
                  {bus.amenities ? bus.amenities.split(',').map((am, i) => (
                    <span key={i} className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-md border border-gray-200">
                      {am.trim()}
                    </span>
                  )) : <span className="text-sm text-gray-400">None</span>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 pl-2">
                <button onClick={() => handleEdit(bus)} className="text-sm text-primary font-bold flex items-center gap-1.5 hover:text-primary-dark">
                  <FaEdit /> Edit
                </button>
                <button 
                  onClick={() => handleToggleStatus(bus)}
                  className={`text-sm font-bold flex items-center gap-1.5 ${
                    bus.isActive ? 'text-danger hover:text-red-700' : 'text-success hover:text-green-700'
                  }`}
                >
                  {bus.isActive ? <><FaBan /> Deactivate</> : <><FaCheckCircle /> Activate</>}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBus ? 'Edit Bus' : 'Add New Bus'}
        subtitle="Step-by-step bus configuration and layout designer"
        maxWidthClass="max-w-6xl"
        footer={modalFooter}
      >
        <div className="flex flex-col md:flex-row h-full min-h-[500px]">
          {/* Form Side */}
          <div className="w-full md:w-1/2 flex flex-col border-r border-border-light relative overflow-y-auto">
            {/* Wizard Progress */}
            <div className="px-6 py-5 sticky top-0 bg-white z-10 border-b border-gray-100">
               <div className="flex justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
                  
                  {[1,2,3,4].map(num => (
                      <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {num}
                      </div>
                  ))}
               </div>
               <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">
                  <span>Basic</span>
                  <span>Layout</span>
                  <span>Amenities</span>
                  <span>Preview</span>
               </div>
            </div>
            
            <div className="p-6">
              {step === 1 && (
                  <motion.div initial={{x: 20, opacity:0}} animate={{x:0, opacity:1}} className="space-y-5">
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-gray-700">Bus Name / Model</label>
                          <input required type="text" className="input-field" placeholder="e.g. Volvo Multi-Axle 9400" 
                              value={formData.busName} onChange={e => setFormData({...formData, busName: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-gray-700">Registration Number</label>
                          <input required type="text" className="input-field" placeholder="e.g. MH-12-AB-1234" 
                              value={formData.busNumber} onChange={e => setFormData({...formData, busNumber: e.target.value})} />
                      </div>
                  </motion.div>
              )}

              {step === 2 && (
                  <motion.div initial={{x: 20, opacity:0}} animate={{x:0, opacity:1}} className="space-y-6">
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-gray-700">Bus Type</label>
                          <select className="input-field" value={formData.busType} onChange={e => setFormData({...formData, busType: e.target.value})}>
                              <option value="AC_SEATER">AC Seater</option>
                              <option value="AC_SLEEPER">AC Sleeper</option>
                              <option value="NON_AC_SEATER">Non-AC Seater</option>
                              <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
                          </select>
                      </div>

                      <div className="space-y-3 p-5 border border-border-light rounded-xl bg-gray-50/50">
                          <h4 className="font-bold text-secondary flex items-center gap-2"><FaLayerGroup className="text-primary"/> Layout configuration</h4>
                          <p className="text-xs text-gray-500 mb-4">Adjust rows to automatically calculate capacity based on the bus type.</p>
                          <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-600">Number of Rows</span>
                              <div className="flex items-center gap-3">
                              <button type="button" onClick={() => setRows(Math.max(1, rows - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold hover:border-primary text-secondary transition-colors">-</button>
                              <span className="font-bold w-6 text-center text-lg">{rows}</span>
                              <button type="button" onClick={() => setRows(Math.min(25, rows + 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold hover:border-primary text-secondary transition-colors">+</button>
                              </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-2">
                              <span className="text-sm font-bold text-gray-600">Total Capacity</span>
                              <span className="font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-lg text-lg">{formData.totalSeats} Seats</span>
                          </div>
                      </div>
                  </motion.div>
              )}

              {step === 3 && (
                  <motion.div initial={{x: 20, opacity:0}} animate={{x:0, opacity:1}} className="space-y-5">
                      <label className="text-sm font-bold text-gray-700">Select Amenities</label>
                      <div className="grid grid-cols-2 gap-3">
                          {AVAILABLE_AMENITIES.map(amenity => (
                              <button 
                                  key={amenity.id}
                                  type="button"
                                  onClick={() => toggleAmenity(amenity.id)}
                                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                      formData.amenities.includes(amenity.id) ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                  }`}
                              >
                                  <div className="text-xl">{amenity.icon}</div>
                                  <span className="font-bold text-sm">{amenity.label}</span>
                              </button>
                          ))}
                      </div>
                  </motion.div>
              )}

              {step === 4 && (
                  <motion.div initial={{x: 20, opacity:0}} animate={{x:0, opacity:1}} className="space-y-6">
                      <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                              <FaBus />
                          </div>
                          <h3 className="text-2xl font-bold font-display text-secondary">{formData.busName}</h3>
                          <p className="text-gray-500 font-mono mt-1">{formData.busNumber}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl border border-gray-100 bg-white">
                              <span className="text-xs font-bold text-gray-400 uppercase">Bus Type</span>
                              <p className="font-bold text-secondary mt-1">{formData.busType.replace('_', ' ')}</p>
                          </div>
                          <div className="p-4 rounded-xl border border-gray-100 bg-white">
                              <span className="text-xs font-bold text-gray-400 uppercase">Total Capacity</span>
                              <p className="font-bold text-secondary mt-1">{formData.totalSeats} Seats</p>
                          </div>
                      </div>

                      <div className="p-4 rounded-xl border border-gray-100 bg-white">
                          <span className="text-xs font-bold text-gray-400 uppercase mb-3 block">Selected Amenities</span>
                          <div className="flex flex-wrap gap-2">
                              {formData.amenities.length > 0 ? formData.amenities.map(a => (
                                  <span key={a} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-lg">{a}</span>
                              )) : <span className="text-sm text-gray-500 italic">No amenities selected</span>}
                          </div>
                      </div>
                  </motion.div>
              )}
            </div>
          </div>

          {/* Layout Designer Preview Side */}
          <div className="w-full md:w-1/2 bg-[#f8f9fa] flex flex-col relative overflow-hidden">
            <div className="p-6 text-center border-b border-gray-200/50 bg-white/50 sticky top-0 z-10 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-secondary mb-1">Live Layout Preview</h3>
              <p className="text-xs text-text-muted">Generated automatically based on rows</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col items-center">
              {isSleeper ? (
                <div className="flex flex-col lg:flex-row gap-8 w-full justify-center">
                  <div className="w-full max-w-[200px] border border-gray-200 rounded-3xl p-5 bg-white flex flex-col items-center shadow-md">
                    <span className="text-xs font-bold text-gray-400 mb-5 uppercase tracking-widest">Lower Deck</span>
                    {Array.from({ length: rows }).map((_, rIdx) => (
                      <div key={`ld-${rIdx}`} className="flex justify-between w-full mb-3 last:mb-0">
                        <div className="w-10 h-16 bg-blue-50 rounded-lg border-2 border-blue-100 flex items-center justify-center text-[10px] text-blue-500 font-bold hover:bg-blue-100 transition-colors">{rIdx+1}A</div>
                        <div className="flex gap-2">
                          <div className="w-10 h-16 bg-blue-50 rounded-lg border-2 border-blue-100 flex items-center justify-center text-[10px] text-blue-500 font-bold hover:bg-blue-100 transition-colors">{rIdx+1}B</div>
                          <div className="w-10 h-16 bg-blue-50 rounded-lg border-2 border-blue-100 flex items-center justify-center text-[10px] text-blue-500 font-bold hover:bg-blue-100 transition-colors">{rIdx+1}C</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="w-full max-w-[200px] border border-gray-200 rounded-3xl p-5 bg-white flex flex-col items-center shadow-md opacity-90">
                    <span className="text-xs font-bold text-gray-400 mb-5 uppercase tracking-widest">Upper Deck</span>
                    {Array.from({ length: rows }).map((_, rIdx) => (
                      <div key={`ud-${rIdx}`} className="flex justify-between w-full mb-3 last:mb-0">
                        <div className="w-10 h-16 bg-indigo-50 rounded-lg border-2 border-indigo-100 flex items-center justify-center text-[10px] text-indigo-500 font-bold hover:bg-indigo-100 transition-colors">{rIdx+1}D</div>
                        <div className="flex gap-2">
                          <div className="w-10 h-16 bg-indigo-50 rounded-lg border-2 border-indigo-100 flex items-center justify-center text-[10px] text-indigo-500 font-bold hover:bg-indigo-100 transition-colors">{rIdx+1}E</div>
                          <div className="w-10 h-16 bg-indigo-50 rounded-lg border-2 border-indigo-100 flex items-center justify-center text-[10px] text-indigo-500 font-bold hover:bg-indigo-100 transition-colors">{rIdx+1}F</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-[2rem] p-6 bg-white shadow-md w-full max-w-[280px]">
                   <div className="flex justify-end mb-8 border-b border-dashed border-gray-200 pb-6">
                      <div className="w-12 h-12 rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center shadow-inner">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      </div>
                   </div>
                   {Array.from({ length: rows }).map((_, rIdx) => (
                      <div key={`s-${rIdx}`} className="flex justify-between w-full mb-4 last:mb-0">
                        <div className="flex gap-2">
                          <div className="w-11 h-11 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-default"><FaCouch /></div>
                          <div className="w-11 h-11 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-default"><FaCouch /></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-11 h-11 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-default"><FaCouch /></div>
                          <div className="w-11 h-11 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-default"><FaCouch /></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
