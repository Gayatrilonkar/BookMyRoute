import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { FaCog, FaSave, FaServer, FaShieldAlt, FaMailBulk } from 'react-icons/fa'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'BookMyRoute',
    contactEmail: 'support@bookmyroute.com',
    maintenanceMode: 'false',
    razorpayMode: 'TEST',
    maxBookingDays: '30'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getSettings()
      if (res.data.data && res.data.data.length > 0) {
        const settingsMap = {}
        res.data.data.forEach(s => settingsMap[s.settingKey] = s.settingValue)
        setSettings(prev => ({ ...prev, ...settingsMap }))
      }
    } catch (err) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await adminApi.updateSettings(settings)
      toast.success('Settings updated successfully')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? String(checked) : value
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold font-display text-secondary">System Settings</h2>
        <p className="text-gray-500 font-body text-sm mt-1">Configure global application settings and integrations.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General Settings */}
        <div className="card p-6 bg-white border border-border-light shadow-sm rounded-2xl">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-2 mb-4">
            <FaCog className="text-primary" /> General Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Platform Name</label>
              <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} className="input-field" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Support Email</label>
              <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="input-field" required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Maximum Advance Booking Days</label>
              <input type="number" min="1" name="maxBookingDays" value={settings.maxBookingDays} onChange={handleChange} className="input-field" required />
              <p className="text-xs text-gray-500 mt-1">How far in advance users can book a ticket.</p>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="card p-6 bg-white border border-border-light shadow-sm rounded-2xl">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-2 mb-4">
            <FaShieldAlt className="text-primary" /> Payment Integrations
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-secondary text-sm">Razorpay Environment</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Switch between test mode and live production mode.</p>
                </div>
                <select name="razorpayMode" value={settings.razorpayMode} onChange={handleChange} className="px-4 py-2 border border-gray-300 rounded-xl outline-none font-bold text-sm bg-white">
                  <option value="TEST">Test Mode</option>
                  <option value="LIVE">Live Mode</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* System Operations */}
        <div className="card p-6 bg-white border border-border-light shadow-sm rounded-2xl">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-2 mb-4">
            <FaServer className="text-danger" /> System Operations
          </h3>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="maintenance" 
              name="maintenanceMode" 
              checked={settings.maintenanceMode === 'true'} 
              onChange={handleChange}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <div>
              <label htmlFor="maintenance" className="font-bold text-secondary text-sm">Enable Maintenance Mode</label>
              <p className="text-xs text-gray-500">When enabled, the frontend will display a maintenance page to passengers.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="btn-primary px-8 flex items-center gap-2">
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaSave />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
