import React, { useState, useCallback, useEffect } from 'react'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { MapPicker } from './MapPicker'
import type { LocationFormData, LocationCategory } from '../../types'

// Admin autentifikatsiyasi backend API orqali amalga oshiriladi
// Agar backend mavjud bo'lmasa, localStorage dagi hash bo'yicha tekshiriladi

const CATEGORY_OPTIONS = [
  { value: 'masjid', label: 'Masjid' },
  { value: 'museum', label: 'Muzey' },
  { value: 'park', label: 'Park' },
  { value: 'restaurant', label: 'Oshxona' },
  { value: 'historical', label: 'Tarixiy' },
]

const CITY_OPTIONS = [
  { value: 'Toshkent', label: 'Toshkent' },
  { value: 'Namangan', label: 'Namangan' },
  { value: 'Samarqand', label: 'Samarqand' },
  { value: 'Buxoro', label: 'Buxoro' },
  { value: 'Xiva', label: 'Xiva' },
  { value: "Farg'ona", label: "Farg'ona" },
  { value: 'Andijon', label: 'Andijon' },
  { value: 'Nukus', label: 'Nukus' },
]

interface StoredLocation extends LocationFormData {
  id: string
  createdAt: string
}

interface Props {
  onSubmit?: (data: LocationFormData) => void
}

function loadLocations(): StoredLocation[] {
  try {
    const data = localStorage.getItem('admin_locations')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveLocations(locations: StoredLocation[]) {
  localStorage.setItem('admin_locations', JSON.stringify(locations))
}

export const AddLocationForm: React.FC<Props> = ({ onSubmit }) => {
  // Auth state — backend API orqali tekshiriladi, localStorage fallback
  const [isAdminAuth, setIsAdminAuth] = useState(false)
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [adminLogin, setAdminLogin] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [adminError, setAdminError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'stats'>('add')

  // Form state
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    description: '',
    category: 'historical',
    averageTimeMinutes: 30,
    latitude: null,
    longitude: null,
    city: 'Toshkent',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof LocationFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Location list
  const [locations, setLocations] = useState<StoredLocation[]>([])
  const [filterCity, setFilterCity] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Load locations on mount
  useEffect(() => {
    setLocations(loadLocations())
    const saved = localStorage.getItem('admin_auth')
    if (saved === 'true') {
      setIsAdminAuth(true)
    } else {
      // Check if admin credentials already set up
      const hash = localStorage.getItem('xazna_admin_hash')
      setIsSetupMode(!hash)
    }
  }, [])

  // First-time admin setup
  const handleAdminSetup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminLogin || !adminPassword) {
      setAdminError('Login va parolni kiriting!')
      return
    }
    if (adminPassword !== adminPasswordConfirm) {
      setAdminError('Parollar bir-biriga mos kelmadi!')
      return
    }
    if (adminPassword.length < 4) {
      setAdminError('Parol kamida 4 belgidan iborat bo\'lishi kerak!')
      return
    }
    localStorage.setItem('xazna_admin_hash', btoa(adminLogin + ':' + adminPassword))
    setIsAdminAuth(true)
    setAdminError('')
    localStorage.setItem('admin_auth', 'true')
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminLogin || !adminPassword) {
      setAdminError('Login va parolni kiriting!')
      return
    }
    setIsLoggingIn(true)
    setAdminError('')
    
    try {
      // Backend API orqali autentifikatsiya
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: adminLogin, password: adminPassword })
      })
      
      if (!response.ok) throw new Error('API xatosi')
      
      const data = await response.json()
      if (data.success) {
        setIsAdminAuth(true)
        setAdminError('')
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_token', data.token || '')
        setIsLoggingIn(false)
        return
      } else {
        throw new Error(data.message || 'Login yoki parol notog\'ri!')
      }
    } catch (err) {
      // Fallback: localStorage dagi hash bo'yicha tekshirish
      const storedHash = localStorage.getItem('xazna_admin_hash')
      if (storedHash && btoa(adminLogin + ':' + adminPassword) === storedHash) {
        setIsAdminAuth(true)
        setAdminError('')
        localStorage.setItem('admin_auth', 'true')
      } else {
        setAdminError('Login yoki parol xato. Serverga ulanish ham muvaffaqiyatsiz.')
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleAdminLogout = () => {
    setIsAdminAuth(false)
    setIsSetupMode(false)
    setAdminLogin('')
    setAdminPassword('')
    setAdminPasswordConfirm('')
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_token')
    // Check if hash exists for next visit
    const hash = localStorage.getItem('xazna_admin_hash')
    setIsSetupMode(!hash)
  }

  // ===== ALL HOOKS MUST BE BEFORE CONDITIONAL RETURN =====
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === 'averageTimeMinutes' ? Number(value) : value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }, [])

  const handleCoordinateChange = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
    setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }))
  }, [])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LocationFormData, string>> = {}
    if (!formData.name.trim()) newErrors.name = 'Joy nomi majburiy'
    if (!formData.description.trim()) newErrors.description = 'Ta\'rif majburiy'
    if (!formData.city) newErrors.city = 'Shaharni tanlang'
    if (formData.averageTimeMinutes < 1) newErrors.averageTimeMinutes = 'Vaqt 1 daqiqadan kam bo\'lmasligi kerak'
    if (formData.latitude === null || formData.longitude === null) newErrors.latitude = 'Xaritada joyni belgilang'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))

    try {
      const allLocations = loadLocations()
      const now = new Date().toISOString()

      if (editingId) {
        const idx = allLocations.findIndex(l => l.id === editingId)
        if (idx >= 0) {
          allLocations[idx] = { ...formData, id: editingId, createdAt: allLocations[idx].createdAt } as StoredLocation
          setSubmitMessage({ type: 'success', text: 'Joy muvaffaqiyatli yangilandi!' })
        }
      } else {
        allLocations.push({ ...formData, id: crypto.randomUUID(), createdAt: now } as StoredLocation)
        setSubmitMessage({ type: 'success', text: 'Joy muvaffaqiyatli qo\'shildi!' })
      }

      saveLocations(allLocations)
      setLocations(allLocations)
      onSubmit?.(formData)

      setFormData({ name: '', description: '', category: 'historical', averageTimeMinutes: 30, latitude: null, longitude: null, city: 'Toshkent' })
      setEditingId(null)
      setTimeout(() => setSubmitMessage(null), 3000)
    } catch {
      setSubmitMessage({ type: 'error', text: 'Xatolik yuz berdi' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (loc: StoredLocation) => {
    setFormData({
      name: loc.name,
      description: loc.description,
      category: loc.category,
      averageTimeMinutes: loc.averageTimeMinutes,
      latitude: loc.latitude,
      longitude: loc.longitude,
      city: loc.city,
    })
    setEditingId(loc.id)
    setActiveTab('add')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Bu joyni ochirishni xohlaysizmi?')) return
    const allLocations = loadLocations().filter(l => l.id !== id)
    saveLocations(allLocations)
    setLocations(allLocations)
      setSubmitMessage({ type: 'success', text: 'Joy ochirildi!' })
    setTimeout(() => setSubmitMessage(null), 3000)
  }

  const handleCancelEdit = () => {
    setFormData({ name: '', description: '', category: 'historical', averageTimeMinutes: 30, latitude: null, longitude: null, city: 'Toshkent' })
    setEditingId(null)
  }

  // ===== CONDITIONAL RETURN — Login form (backend API + localStorage fallback) =====
  if (!isAdminAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-4xl shadow-lg mx-auto mb-4 ring-4 ring-emerald-100">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{isSetupMode ? 'Birinchi marta sozlash' : 'Autentifikatsiya talab qilinadi'}</p>
          </div>
          <form onSubmit={isSetupMode ? handleAdminSetup : handleAdminLogin} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg"><i className="fa-solid fa-user"></i></span>
                <input type="text" value={adminLogin} onChange={(e) => setAdminLogin(e.target.value)} placeholder="Admin logini kiriting"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parol</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg"><i className="fa-solid fa-key"></i></span>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Parolni kiriting"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>
            {isSetupMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parolni takrorlang</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg"><i className="fa-solid fa-key"></i></span>
                  <input type="password" value={adminPasswordConfirm} onChange={(e) => setAdminPasswordConfirm(e.target.value)} placeholder="Parolni takrorlang"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                </div>
              </div>
            )}
            {adminError && <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center font-medium"><i className="fa-solid fa-xmark"></i> {adminError}</div>}
            <button type="submit" disabled={isLoggingIn || !adminLogin || !adminPassword}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-semibold text-sm transition-all disabled:cursor-not-allowed active:scale-[0.98] shadow-lg hover:shadow-xl">
              {isLoggingIn ? 'Tekshirilmoqda...' : isSetupMode ? 'Sozlash' : 'Kirish'}
            </button>
            {isSetupMode ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Iltimos, admin login va parolni yarating. Bu ma'lumotlar faqat brauzeringizda saqlanadi.</p>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Admin panelga kirish backend yoki localStorage orqali amalga oshiriladi</p>
            )}
          </form>
        </div>
      </div>
    )
  }

  // ===== STATS & FILTERS =====
  const totalLocations = locations.length
  const cityCount = new Set(locations.map(l => l.city)).size
  const categoryCounts = locations.reduce((acc, l) => { acc[l.category] = (acc[l.category] || 0) + 1; return acc }, {} as Record<string, number>)

  // Filtered locations
  const filteredLocations = locations.filter(l => {
    if (filterCity !== 'all' && l.city !== filterCity) return false
    if (filterCategory !== 'all' && l.category !== filterCategory) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl"><i className="fa-solid fa-gear"></i></span>
            Admin Panel
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Joylarni boshqarish va statistika
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">
            <i className="fa-solid fa-location-dot"></i> {totalLocations} ta joy
          </span>
          <button onClick={handleAdminLogout} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5">
            <i className="fa-solid fa-door-open"></i> Chiqish
          </button>
        </div>
      </div>

      {/* Success/Error message */}
      {submitMessage && (
        <div className={`p-4 rounded-xl text-sm font-medium animate-slide-down ${submitMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200'}`}>
          {submitMessage.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'add' as const, label: '<i class="fa-solid fa-plus"></i> Qo\'shish', desc: 'Yangi joy qo\'shish' },
          { id: 'list' as const, label: '<i class="fa-solid fa-clipboard"></i> Joylar', desc: 'Barcha joylar ro\'yxati' },
          { id: 'stats' as const, label: '<i class="fa-solid fa-chart-simple"></i> Statistika', desc: 'Ma\'lumotlar tahlili' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <span className="flex items-center gap-2" dangerouslySetInnerHTML={{ __html: tab.label }} />
          </button>
        ))}
      </div>

      {/* TAB: ADD / EDIT */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                <span dangerouslySetInnerHTML={{ __html: editingId ? '<i class="fa-solid fa-pencil"></i> Joyni tahrirlash' : '<i class="fa-solid fa-location-dot"></i> Yangi joy qo\'shish' }} />
              </h3>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="text-xs text-red-500 hover:text-red-700 font-medium">Bekor qilish</button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Joy nomi" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masalan: Minor masjidi" error={errors.name} />
              <Select label="Kategoriya" name="category" value={formData.category} onChange={handleInputChange} options={CATEGORY_OPTIONS} />
              <Select label="Shahar" name="city" value={formData.city} onChange={handleInputChange} options={CITY_OPTIONS} error={errors.city} />
              <Input label="O'rtacha vaqt (daqiqa)" name="averageTimeMinutes" type="number" min={1} max={480} value={formData.averageTimeMinutes} onChange={handleInputChange} error={errors.averageTimeMinutes} />
            </div>
            <TextArea label="Ta'rif" name="description" value={formData.description} onChange={handleInputChange} placeholder="Joy haqida qisqacha ma'lumot..." error={errors.description} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4"><i className="fa-solid fa-map"></i> Xaritada joylashuv</h3>
            <MapPicker latitude={formData.latitude} longitude={formData.longitude} onCoordinateChange={handleCoordinateChange} />
            {errors.latitude && <p className="text-red-500 text-xs mt-2">{errors.latitude}</p>}
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-full">
            <span dangerouslySetInnerHTML={{ __html: isSubmitting ? '<i class="fa-solid fa-hourglass"></i> Saqlanmoqda...' : editingId ? '<i class="fa-solid fa-floppy-disk"></i> Yangilash' : '<i class="fa-solid fa-check"></i> Qo\'shish' }} />
          </Button>
        </form>
      )}

      {/* TAB: LOCATION LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">Barcha shaharlar</option>
              {CITY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">Barcha kategoriyalar</option>
              {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <span className="text-sm text-gray-400 flex items-center px-3">{filteredLocations.length} ta joy</span>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-5xl block mb-3"><i className="fa-solid fa-inbox"></i></span>
              <p className="font-medium">Joylar topilmadi</p>
              <p className="text-sm mt-1">Yangi joy qo'shish uchin "Qo'shish" bo'limiga o'ting</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredLocations.map(loc => (
                <div key={loc.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-800 dark:text-white">{loc.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{loc.city}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">{CATEGORY_OPTIONS.find(c => c.value === loc.category)?.label || loc.category}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{loc.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span><i className="fa-solid fa-stopwatch"></i> {loc.averageTimeMinutes} daq</span>
                        <span><i className="fa-solid fa-location-dot"></i> {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</span>
                        <span><i className="fa-solid fa-calendar"></i> {new Date(loc.createdAt).toLocaleDateString('uz-UZ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => handleEdit(loc)} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title="Tahrirlash"><i className="fa-solid fa-pencil"></i></button>
                      <button onClick={() => handleDelete(loc.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title="O'chirish"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: STATISTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm text-center">
              <span className="text-3xl block mb-2"><i className="fa-solid fa-location-dot"></i></span>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalLocations}</p>
              <p className="text-xs text-gray-500 mt-0.5">Jami joylar</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm text-center">
              <span className="text-3xl block mb-2"><i className="fa-solid fa-city"></i></span>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{cityCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Shaharlar</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm text-center">
              <span className="text-3xl block mb-2"><i className="fa-solid fa-tag"></i></span>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{Object.keys(categoryCounts).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Kategoriyalar</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm text-center">
              <span className="text-3xl block mb-2"><i className="fa-solid fa-stopwatch"></i></span>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {locations.reduce((sum, l) => sum + l.averageTimeMinutes, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Jami daqiqa</p>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4"><i className="fa-solid fa-chart-simple"></i> Kategoriyalar bo'yicha</h3>
            <div className="space-y-3">
              {CATEGORY_OPTIONS.map(cat => {
                const count = categoryCounts[cat.value] || 0
                const maxCount = Math.max(...Object.values(categoryCounts), 1)
                const percent = (count / maxCount) * 100
                return (
                  <div key={cat.value}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">{cat.label}</span>
                      <span className="text-gray-500 font-medium">{count} ta</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* City breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4"><i className="fa-solid fa-city"></i> Shaharlar bo'yicha</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CITY_OPTIONS.map(city => {
                const count = locations.filter(l => l.city === city.value).length
                if (count === 0) return null
                return (
                  <div key={city.value} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{count}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{city.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
