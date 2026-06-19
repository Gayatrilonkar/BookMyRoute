import { useState, useEffect } from 'react'
import { adminApi, routeApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaRoute, FaSearch, FaMapMarkerAlt, FaLocationArrow, FaRoad, FaTimes, FaEdit, FaArrowUp, FaArrowDown, FaTrash, FaMapSigns } from 'react-icons/fa'
import { motion } from 'framer-motion'
import AdminModal from '../../components/common/AdminModal'

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState(null)
  const [activeTab, setActiveTab] = useState('pickup') // 'pickup' or 'drop'
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distanceKm: 100,
    durationMins: 120,
    isActive: true
  })

  // Stop Builder state
  const [pickupLocations, setPickupLocations] = useState([])
  const [dropLocations, setDropLocations] = useState([])
  const [stopsLoading, setStopsLoading] = useState(false)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getRoutes()
      setRoutes(res.data.data)
    } catch (err) {
      toast.error('Failed to load routes')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingRoute(null)
    setFormData({ origin: '', destination: '', distanceKm: 100, durationMins: 120, isActive: true })
    setPickupLocations([
      { pickupName: '', pickupAddress: '', pickupTime: '08:00', landmark: '', subLocations: [] }
    ])
    setDropLocations([
      { dropName: '', dropAddress: '', dropTime: '10:00', landmark: '', subLocations: [] }
    ])
    setActiveTab('pickup')
    setShowModal(true)
  }

  const handleEdit = async (route) => {
    setEditingRoute(route)
    setFormData({
      origin: route.origin,
      destination: route.destination,
      distanceKm: route.distanceKm,
      durationMins: route.durationMins,
      isActive: route.isActive ?? true
    })
    
    try {
      setStopsLoading(true)
      setShowModal(true)
      setActiveTab('pickup')
      
      const res = await routeApi.getRoute(route.routeId)
      const routeData = res.data?.data
      
      if (routeData) {
         setPickupLocations((routeData.pickupLocations || []).map(loc => ({
           id: loc.id,
           pickupName: loc.pickupName || '',
           pickupAddress: loc.pickupAddress || '',
           pickupTime: loc.pickupTime || '08:00',
           landmark: loc.landmark || '',
           subLocations: (loc.subLocations || []).map(sub => ({
             id: sub.id,
             subLocationName: sub.subLocationName,
             sequenceOrder: sub.sequenceOrder
           }))
         })))
         
         setDropLocations((routeData.dropLocations || []).map(loc => ({
           id: loc.id,
           dropName: loc.dropName || '',
           dropAddress: loc.dropAddress || '',
           dropTime: loc.dropTime || '10:00',
           landmark: loc.landmark || '',
           subLocations: (loc.subLocations || []).map(sub => ({
             id: sub.id,
             subLocationName: sub.subLocationName,
             sequenceOrder: sub.sequenceOrder
           }))
         })))
      }
    } catch (err) {
      toast.error('Failed to load locations')
      setPickupLocations([])
      setDropLocations([])
    } finally {
      setStopsLoading(false)
    }
  }

  // Generic Handlers for Locations
  const addLocation = (type) => {
    if (type === 'pickup') {
      setPickupLocations([...pickupLocations, { pickupName: '', pickupAddress: '', pickupTime: '08:00', landmark: '', subLocations: [] }])
    } else {
      setDropLocations([...dropLocations, { dropName: '', dropAddress: '', dropTime: '10:00', landmark: '', subLocations: [] }])
    }
  }

  const removeLocation = (type, index) => {
    if (type === 'pickup') {
      const newLocs = [...pickupLocations]; newLocs.splice(index, 1); setPickupLocations(newLocs);
    } else {
      const newLocs = [...dropLocations]; newLocs.splice(index, 1); setDropLocations(newLocs);
    }
  }

  const moveLocation = (type, index, direction) => {
    const list = type === 'pickup' ? [...pickupLocations] : [...dropLocations]
    if (direction === -1 && index > 0) {
      const temp = list[index]; list[index] = list[index - 1]; list[index - 1] = temp;
    } else if (direction === 1 && index < list.length - 1) {
      const temp = list[index]; list[index] = list[index + 1]; list[index + 1] = temp;
    }
    type === 'pickup' ? setPickupLocations(list) : setDropLocations(list)
  }

  const updateLocation = (type, index, field, value) => {
    if (type === 'pickup') {
      const newLocs = [...pickupLocations]; newLocs[index][field] = value; setPickupLocations(newLocs);
    } else {
      const newLocs = [...dropLocations]; newLocs[index][field] = value; setDropLocations(newLocs);
    }
  }

  const addSubLocation = (type, index) => {
    if (type === 'pickup') {
      const newLocs = [...pickupLocations]; 
      if (!newLocs[index].subLocations) newLocs[index].subLocations = [];
      newLocs[index].subLocations.push({ subLocationName: '', sequenceOrder: newLocs[index].subLocations.length + 1 })
      setPickupLocations(newLocs)
    } else {
      const newLocs = [...dropLocations]; 
      if (!newLocs[index].subLocations) newLocs[index].subLocations = [];
      newLocs[index].subLocations.push({ subLocationName: '', sequenceOrder: newLocs[index].subLocations.length + 1 })
      setDropLocations(newLocs)
    }
  }

  const updateSubLocation = (type, stopIndex, subIndex, field, value) => {
    if (type === 'pickup') {
      const newLocs = [...pickupLocations]; newLocs[stopIndex].subLocations[subIndex][field] = value; setPickupLocations(newLocs);
    } else {
      const newLocs = [...dropLocations]; newLocs[stopIndex].subLocations[subIndex][field] = value; setDropLocations(newLocs);
    }
  }

  const removeSubLocation = (type, stopIndex, subIndex) => {
    if (type === 'pickup') {
      const newLocs = [...pickupLocations]; newLocs[stopIndex].subLocations.splice(subIndex, 1); setPickupLocations(newLocs);
    } else {
      const newLocs = [...dropLocations]; newLocs[stopIndex].subLocations.splice(subIndex, 1); setDropLocations(newLocs);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (pickupLocations.length < 1) return toast.error('A route must have at least 1 pickup point')
    if (dropLocations.length < 1) return toast.error('A route must have at least 1 drop point')

    const invalidPickup = pickupLocations.find(s => !s.pickupName.trim() || !s.pickupAddress.trim() || !s.pickupTime.trim())
    if (invalidPickup) return toast.error('All pickup points must have a valid name, address, and time')
    
    const invalidDrop = dropLocations.find(s => !s.dropName.trim() || !s.dropAddress.trim() || !s.dropTime.trim())
    if (invalidDrop) return toast.error('All drop points must have a valid name, address, and time')

    const finalPickupLocations = pickupLocations.map((loc, index) => ({
      ...loc,
      sequenceOrder: index + 1,
      subLocations: (loc.subLocations || []).map((sub, sidx) => ({
        ...sub,
        sequenceOrder: sidx + 1
      }))
    }))
    
    const finalDropLocations = dropLocations.map((loc, index) => ({
      ...loc,
      sequenceOrder: index + 1,
      subLocations: (loc.subLocations || []).map((sub, sidx) => ({
        ...sub,
        sequenceOrder: sidx + 1
      }))
    }))

    const payload = {
      ...formData,
      pickupLocations: finalPickupLocations,
      dropLocations: finalDropLocations
    }

    try {
      if (editingRoute) {
        await adminApi.updateRoute(editingRoute.routeId, payload)
        toast.success('Route updated successfully')
      } else {
        await adminApi.createRoute(payload)
        toast.success('Route added successfully')
      }
      setShowModal(false)
      fetchRoutes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save route')
    }
  }

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await adminApi.deleteRoute(routeId);
      toast.success("Route deleted successfully");
      fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete route');
    }
  }

  const filteredRoutes = routes.filter(r => 
    r.origin.toLowerCase().includes(search.toLowerCase()) || 
    r.destination.toLowerCase().includes(search.toLowerCase()) ||
    r.routeId?.toString().includes(search.toLowerCase())
  )

  const formatDuration = (mins) => {
    if (!mins) return '0h 0m'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }
  
  const currentLocations = activeTab === 'pickup' ? pickupLocations : dropLocations;

  const modalFooter = (
    <div className="flex justify-between items-center w-full">
      <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
        Cancel
      </button>
      <button type="submit" form="routeForm" className="btn-primary px-8 shadow-md">
        {editingRoute ? 'Save Changes' : 'Create Route'}
      </button>
    </div>
  )

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-secondary">Route Management</h2>
          <p className="text-gray-500 font-body text-sm mt-1">Manage source to destination routes and their dynamic stops.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="btn-primary flex items-center gap-2 shadow-sm"
        >
          <FaPlus /> Add New Route
        </button>
      </div>

      <div className="card p-4 bg-white shadow-sm border border-border-light rounded-2xl flex items-center">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by city..." 
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
        ) : filteredRoutes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 card border-dashed">
            No routes found matching your search.
          </div>
        ) : (
          filteredRoutes.map(route => (
            <motion.div layout initial={{opacity:0}} animate={{opacity:1}} key={route.routeId} className="card p-6 flex flex-col hover:shadow-lg transition-shadow border border-border-light relative overflow-hidden group">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                    <FaRoute />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400">ID: #{route.routeId}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${route.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {route.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <FaMapMarkerAlt className="text-gray-400 text-sm shrink-0" />
                  <span className="font-bold text-secondary truncate">{route.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaLocationArrow className="text-primary text-sm shrink-0" />
                  <span className="font-bold text-secondary truncate">{route.destination}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-0.5">Boarding</div>
                  <div className="text-sm font-bold text-gray-800">{route.pickupLocations?.length || 0} Points</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-0.5">Dropping</div>
                  <div className="text-sm font-bold text-gray-800">{route.dropLocations?.length || 0} Points</div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <FaRoad className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{route.distanceKm} km</span>
                </div>
                <div className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                  {formatDuration(route.durationMins)}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-[11px] font-medium text-gray-400">
                  Created: {route.createdAt ? new Date(route.createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDeleteRoute(route.routeId)} className="text-sm text-red-600 font-bold flex items-center gap-1.5 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">
                    <FaTrash />
                  </button>
                  <button onClick={() => handleEdit(route)} className="text-sm text-primary font-bold flex items-center gap-1.5 hover:text-primary-dark transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg">
                    <FaEdit /> Edit Route
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRoute ? 'Edit Route' : 'Add New Route'}
        subtitle="Configure origin, destination and timeline details."
        maxWidthClass="max-w-[1400px]"
        footer={modalFooter}
      >
        <div className="flex flex-col md:flex-row h-full min-h-[600px]">
          {/* Left Panel: Form Side */}
          <div className="w-full md:w-5/12 flex flex-col border-b md:border-b-0 md:border-r border-border-light bg-white overflow-y-auto custom-scrollbar p-6">
            <form id="routeForm" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Origin City</label>
                  <input required type="text" className="input-field shadow-sm bg-gray-50 focus:bg-white" placeholder="e.g. Mumbai" 
                    value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Destination City</label>
                  <input required type="text" className="input-field shadow-sm bg-gray-50 focus:bg-white" placeholder="e.g. Pune" 
                    value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Distance (km)</label>
                  <input required type="number" min="1" className="input-field shadow-sm bg-gray-50 focus:bg-white" 
                    value={formData.distanceKm} onChange={e => setFormData({...formData, distanceKm: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Duration (mins)</label>
                  <input required type="number" min="1" className="input-field shadow-sm bg-gray-50 focus:bg-white" 
                    value={formData.durationMins} onChange={e => setFormData({...formData, durationMins: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800">Route Status</h4>
                  <p className="text-xs text-gray-500">Enable or disable this route</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </form>
          </div>

          {/* Right Panel: Stop Builder Side */}
          <div className="w-full md:w-7/12 bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 px-6 sm:px-8 pt-6 pb-0 bg-slate-50/90 backdrop-blur-md shrink-0 border-b border-gray-200 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
                  <FaMapSigns className="text-primary"/> Dynamic Locations
                </h3>
              </div>
              
              {/* Tabs */}
              <div className="flex items-center gap-6 mt-6">
                <button 
                  type="button"
                  onClick={() => setActiveTab('pickup')}
                  className={`pb-3 px-1 text-sm font-bold transition-colors relative ${activeTab === 'pickup' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Boarding Points
                  {activeTab === 'pickup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('drop')}
                  className={`pb-3 px-1 text-sm font-bold transition-colors relative ${activeTab === 'drop' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Dropping Points
                  {activeTab === 'drop' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
              </div>
            </div>
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6 relative">
              {stopsLoading ? (
                <div className="flex justify-center py-12">
                   <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4 relative pb-12">
                  <div className="absolute left-6 top-8 bottom-12 w-0.5 bg-gray-200 rounded-full z-0 hidden sm:block"></div>
                  {currentLocations.map((loc, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-6">
                      
                      {/* Timeline Column */}
                      <div className="hidden sm:flex flex-col items-center gap-1 shrink-0 w-12 py-2 relative z-10">
                        <button type="button" disabled={idx === 0} onClick={() => moveLocation(activeTab, idx, -1)} className="text-gray-400 hover:text-primary disabled:opacity-30 bg-slate-50 rounded-full p-1"><FaArrowUp size={12} /></button>
                        <div className={`w-8 h-8 rounded-full ${activeTab === 'pickup' ? 'bg-primary' : 'bg-secondary'} text-white text-sm font-bold flex items-center justify-center ring-4 ring-slate-50 shadow-sm`}>{idx + 1}</div>
                        <button type="button" disabled={idx === currentLocations.length - 1} onClick={() => moveLocation(activeTab, idx, 1)} className="text-gray-400 hover:text-primary disabled:opacity-30 bg-slate-50 rounded-full p-1"><FaArrowDown size={12} /></button>
                      </div>
                      
                      {/* Content Column */}
                      <div className="flex-1 min-w-0 w-full">
                        {/* Main Stop Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start gap-4">
                          <div className="flex-1 grid grid-cols-12 gap-4 w-full">
                            <div className="col-span-12 sm:col-span-8">
                              <input 
                                type="text" 
                                required
                                placeholder={activeTab === 'pickup' ? "Pickup Name (e.g. Swargate)" : "Drop Name (e.g. Wakad)"}
                                className="w-full text-base font-bold text-secondary border-b border-transparent hover:border-gray-200 focus:border-primary bg-transparent outline-none placeholder:font-normal placeholder:text-gray-400 pb-1 transition-colors"
                                value={activeTab === 'pickup' ? loc.pickupName : loc.dropName}
                                onChange={e => updateLocation(activeTab, idx, activeTab === 'pickup' ? 'pickupName' : 'dropName', e.target.value)}
                              />
                            </div>
                            <div className="col-span-12 sm:col-span-4">
                              <input 
                                type="time" 
                                required
                                className="w-full text-sm font-bold text-secondary border-b border-transparent hover:border-gray-200 focus:border-primary bg-transparent outline-none pb-1 transition-colors cursor-pointer"
                                value={activeTab === 'pickup' ? loc.pickupTime : loc.dropTime}
                                onChange={e => updateLocation(activeTab, idx, activeTab === 'pickup' ? 'pickupTime' : 'dropTime', e.target.value)}
                              />
                            </div>
                            <div className="col-span-12">
                              <input 
                                type="text" 
                                required
                                placeholder="Full Address"
                                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary focus:bg-white transition-colors shadow-sm"
                                value={activeTab === 'pickup' ? loc.pickupAddress : loc.dropAddress}
                                onChange={e => updateLocation(activeTab, idx, activeTab === 'pickup' ? 'pickupAddress' : 'dropAddress', e.target.value)}
                              />
                            </div>
                            <div className="col-span-12">
                              <input 
                                type="text" 
                                placeholder="Landmark (Optional)"
                                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary focus:bg-white transition-colors shadow-sm"
                                value={loc.landmark}
                                onChange={e => updateLocation(activeTab, idx, 'landmark', e.target.value)}
                              />
                            </div>
                          </div>
                          <button type="button" onClick={() => removeLocation(activeTab, idx)} className="text-gray-400 hover:text-danger p-2 sm:p-2.5 rounded-xl hover:bg-red-50 transition-colors shrink-0 flex items-center justify-center self-end sm:self-start">
                            <FaTrash size={14}/>
                          </button>
                        </div>

                        {/* Sub Locations Section */}
                        <div className="mt-3 ml-2 sm:ml-6 pl-4 border-l-2 border-dashed border-primary/30 relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Sub Locations (e.g. gates, pillars)</span>
                          </div>
                          <div className="space-y-2.5">
                            {(loc.subLocations || []).map((sub, sidx) => (
                              <div key={sidx} className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary/20 flex-shrink-0" />
                                <input 
                                  type="text"
                                  required
                                  placeholder="Sub Location Name"
                                  className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary shadow-sm focus:shadow-md transition-all"
                                  value={sub.subLocationName}
                                  onChange={e => updateSubLocation(activeTab, idx, sidx, 'subLocationName', e.target.value)}
                                />
                                <button type="button" onClick={() => removeSubLocation(activeTab, idx, sidx)} className="text-gray-400 hover:text-danger p-2 rounded-lg hover:bg-red-50 transition-colors bg-white border border-gray-100 shadow-sm">
                                  <FaTimes size={12}/>
                                </button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addSubLocation(activeTab, idx)} className="text-sm font-bold text-primary hover:text-primary-dark hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 mt-1 border border-transparent hover:border-primary/20">
                              <FaPlus size={10} /> Add Sub Location
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={() => addLocation(activeTab)} className={`ml-0 sm:ml-12 mt-6 px-5 py-3 border-2 border-dashed ${activeTab === 'pickup' ? 'border-primary text-primary hover:bg-primary/5' : 'border-secondary text-secondary hover:bg-secondary/5'} rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto`}>
                    <FaPlus /> Add Another {activeTab === 'pickup' ? 'Boarding' : 'Dropping'} Point
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
