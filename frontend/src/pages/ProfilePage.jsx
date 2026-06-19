import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCheck, FaEdit, FaEnvelope, FaKey, FaPhoneAlt, FaTimes, FaUser, FaUserPlus, FaTrash, FaStar, FaRegStar } from 'react-icons/fa'
import { authApi, passengerProfileApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import SkeletonLoader from '../components/common/SkeletonLoader'

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? {}
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
    })
  }, [user])

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const cancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
    })
    setEditing(false)
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    const name = profileForm.name.trim()
    const phone = profileForm.phone.trim()

    if (!name) {
      toast.error('Name is required')
      return
    }

    setSavingProfile(true)
    try {
      const response = await authApi.updateProfile({ name, phone })
      const updatedProfile = getResponseData(response)
      updateUser(updatedProfile)
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    setChangingPassword(true)
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm(emptyPasswordForm)
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not change password')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="border-b border-gray-200 bg-white">
        <div className="section-wrap py-6">
          <p className="text-sm font-700 text-[#d84e55]">Account</p>
          <h1 className="mt-1 text-2xl font-800 text-[#172033]">Profile</h1>
        </div>
      </div>

      <div className="section-wrap max-w-5xl py-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="card p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-800 text-[#172033]">Personal info</h2>
                <p className="mt-1 text-sm text-slate-500">Keep your booking contact details up to date.</p>
              </div>
              {!editing ? (
                <button type="button" onClick={() => setEditing(true)} className="btn-outline px-4 py-2">
                  <FaEdit /> Edit
                </button>
              ) : (
                <button type="button" onClick={cancelEdit} className="btn-outline px-4 py-2">
                  <FaTimes /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={saveProfile} className="space-y-5">
              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-xs font-800 uppercase tracking-wide text-slate-500">
                  <FaUser /> Full name
                </span>
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  disabled={!editing || savingProfile}
                  className="input-field disabled:bg-slate-50 disabled:text-slate-500"
                  autoComplete="name"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-xs font-800 uppercase tracking-wide text-slate-500">
                  <FaEnvelope /> Email
                </span>
                <input
                  value={user?.email || ''}
                  disabled
                  className="input-field bg-slate-50 text-slate-500"
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-xs font-800 uppercase tracking-wide text-slate-500">
                  <FaPhoneAlt /> Phone
                </span>
                <input
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  disabled={!editing || savingProfile}
                  className="input-field disabled:bg-slate-50 disabled:text-slate-500"
                  autoComplete="tel"
                />
              </label>

              {editing && (
                <button type="submit" disabled={savingProfile} className="btn-primary">
                  <FaCheck /> {savingProfile ? 'Saving...' : 'Save changes'}
                </button>
              )}
            </form>
          </section>

          <section className="card p-6">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-xl font-800 text-[#172033]">
                <FaKey className="text-[#d84e55]" /> Change password
              </h2>
              <p className="mt-1 text-sm text-slate-500">Use a new password with at least 8 characters.</p>
            </div>

            <form onSubmit={changePassword} className="space-y-5">
              <label className="block">
                <span className="mb-1 block text-xs font-800 uppercase tracking-wide text-slate-500">
                  Current password
                </span>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  autoComplete="current-password"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-800 uppercase tracking-wide text-slate-500">
                  New password
                </span>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-800 uppercase tracking-wide text-slate-500">
                  Confirm new password
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </label>

              <button type="submit" disabled={changingPassword} className="btn-secondary w-full">
                <FaKey /> {changingPassword ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </section>
        </div>

        <div className="mt-6">
          <PassengerProfilesManager />
        </div>
      </div>
    </div>
  )
}

function PassengerProfilesManager() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ id: null, fullName: '', age: '', gender: 'MALE', isDefault: false })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data } = await passengerProfileApi.getProfiles()
      setProfiles(data?.data || [])
    } catch {
      toast.error('Could not load saved passengers')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (p) => {
    setForm({ id: p.id, fullName: p.fullName, age: p.age, gender: p.gender, isDefault: p.isDefault })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this passenger profile?')) return
    setDeletingId(id)
    try {
      await passengerProfileApi.deleteProfile(id)
      setProfiles(prev => prev.filter(p => p.id !== id))
      toast.success('Profile deleted')
    } catch {
      toast.error('Could not delete profile')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.fullName.trim()) return toast.error('Name is required')
    if (!form.age) return toast.error('Age is required')

    setSaving(true)
    try {
      const payload = { ...form, age: parseInt(form.age, 10) }
      if (form.id) {
        await passengerProfileApi.updateProfile(form.id, payload)
        toast.success('Profile updated')
      } else {
        await passengerProfileApi.createProfile(payload)
        toast.success('Passenger added')
      }
      setShowForm(false)
      fetchProfiles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="card p-6">
        <h2 className="mb-4 text-xl font-800 text-[#172033]">Saved Passengers</h2>
        <div className="flex gap-4"><SkeletonLoader className="h-16 w-full rounded-xl" /></div>
      </section>
    )
  }

  return (
    <section className="card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-800 text-[#172033]">
            <FaUser className="text-[#d84e55]" /> Saved Passengers
          </h2>
          <p className="mt-1 text-sm text-slate-500">Quickly autofill details during booking.</p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => { setForm({ id: null, fullName: '', age: '', gender: 'MALE', isDefault: false }); setShowForm(true) }} className="btn-primary px-4 py-2 text-sm">
            <FaUserPlus /> Add Passenger
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-border-medium bg-surface/50 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-secondary">{form.id ? 'Edit Passenger' : 'New Passenger'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-text-muted hover:text-error"><FaTimes /></button>
          </div>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto]">
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-text-muted tracking-wider">Full name</span>
              <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="input-field" placeholder="Name" required />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-text-muted tracking-wider">Age</span>
              <input type="number" min="1" max="120" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="input-field w-20" placeholder="Age" required />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase text-text-muted tracking-wider">Gender</span>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="input-field w-28">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </label>
            <div className="flex flex-col justify-end">
              <button type="submit" disabled={saving} className="btn-primary h-11">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
          <label className="flex items-center gap-2 mt-4 cursor-pointer w-fit">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-bold text-secondary">Mark as default passenger</span>
          </label>
        </div>
      )}

      {profiles.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-border-medium py-10 text-center text-text-muted">
          <FaUser className="mx-auto mb-2 text-3xl opacity-20" />
          <p className="text-sm">No saved passengers found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map(p => (
            <div key={p.id} className="relative rounded-xl border border-border-light bg-surface p-4 shadow-sm group">
              {p.isDefault && (
                <div className="absolute -top-2 -right-2 bg-success text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <FaStar /> Default
                </div>
              )}
              <p className="font-bold text-secondary truncate">{p.fullName}</p>
              <p className="text-sm text-text-muted">{p.age} yrs • {p.gender === 'MALE' ? 'Male' : 'Female'}</p>
              
              <div className="mt-4 flex gap-2 border-t border-dashed border-border-light pt-3">
                <button type="button" onClick={() => handleEdit(p)} className="flex-1 rounded-md bg-secondary/5 py-1.5 text-xs font-bold text-secondary hover:bg-secondary/10 flex items-center justify-center gap-1 transition-colors">
                  <FaEdit /> Edit
                </button>
                <button type="button" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="flex-1 rounded-md bg-error/5 py-1.5 text-xs font-bold text-error hover:bg-error/10 flex items-center justify-center gap-1 transition-colors">
                  <FaTrash /> {deletingId === p.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

