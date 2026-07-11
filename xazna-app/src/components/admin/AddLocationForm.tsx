import React, { useState, useCallback } from 'react'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { MapPicker } from './MapPicker'
import type { LocationFormData, LocationCategory } from '../../types'

const ADMIN_LOGIN = 'Xazina'
const ADMIN_PASSWORD = 'xazina2026'

const CATEGORY_OPTIONS = [
  { value: 'masjid', label: '🕌 Masjid' },
  { value: 'museum', label: '🏛️ Muzey' },
  { value: 'park', label: '🌳 Park' },
  { value: 'restaurant', label: '🍽️ Oshxona' },
  { value: 'historical', label: '🏰 Tarixiy' },
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

interface Props {
  onSubmit?: (data: LocationFormData) => void
}

export const AddLocationForm: React.FC<Props> = ({ onSubmit }) => {
  const [isAdminAuth, setIsAdminAuth] = useState(false)
  const [adminLogin, setAdminLogin] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    description: '',
    category: 'historical',
    averageTimeMinutes: 30,
    latitude: null,
    longitude: null,
    city: 'Toshkent',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof LocationFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminLogin === ADMIN_LOGIN && adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuth(true)
      setAdminError('')
      localStorage.setItem('admin_auth', 'true')
    } else {
      setAdminError('Login yoki parol notogri!')
    }
  }

  const handleAdminLogout = () => {
    setIsAdminAuth(false)
    setAdminLogin('')
    setAdminPassword('')
    localStorage.removeItem('admin_auth')
  }

  // Auto-login from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('admin_auth')
    if (saved === 'true') setIsAdminAuth(true)
  }, [])

  // Agar admin autentifikatsiyadan otmagan bolsa, login formani korsatish
  if (!isAdminAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-4xl shadow-lg mx-auto mb-4 ring-4 ring-emerald-100">
              🔐
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Faqat adminlar uchun</p>
          </div>

          <form onSubmit={handleAdminLogin} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">👤</span>
                <input
                  type="text"
                  value={adminLogin}
                  onChange={(e) => setAdminLogin(e.target.value)}
                  placeholder="Admin logini kiriting"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parol</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔑</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {adminError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 text-center font-medium animate-shake">
                ❌ {adminError}
              </div>
            )}

            <button
              type="submit"
              disabled={!adminLogin || !adminPassword}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-semibold text-sm transition-all disabled:cursor-not-allowed active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              🔓 Kirish
            </button>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Admin panelga kirish uchun maxsus login va parol talab qilinadi
            </p>
          </form>
        </div>
      </div>
    )
  }

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'averageTimeMinutes' ? Number(value) : value,
    }))
    // Xatoni tozalash
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
    if (formData.latitude === null || formData.longitude === null) {
      newErrors.latitude = 'Xaritada joyni belgilang'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      // Backendga yuborish simulyatsiyasi
      await new Promise((resolve) => setTimeout(resolve, 800))
      onSubmit?.(formData)
      alert('✅ Joy muvaffaqiyatli qo\'shildi!')

      // Formani tozalash
      setFormData({
        name: '',
        description: '',
        category: 'historical',
        averageTimeMinutes: 30,
        latitude: null,
        longitude: null,
        city: 'Toshkent',
      })
    } catch (err) {
      alert('❌ Xatolik yuz berdi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">📍</span>
            Yangi joy qo'shish
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Marshrutlar bazasiga yangi lokatsiya qo'shing
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdminLogout}
          className="px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
        >
          🚪 Chiqish
        </button>
      </div>

      {/* Asosiy ma'lumotlar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
          Asosiy ma'lumotlar
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Joy nomi"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Masalan: Minor masjidi"
            error={errors.name}
          />

          <Select
            label="Kategoriya"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            options={CATEGORY_OPTIONS}
          />

          <Select
            label="Shahar"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            options={CITY_OPTIONS}
            error={errors.city}
          />

          <Input
            label="O'rtacha vaqt (daqiqa)"
            name="averageTimeMinutes"
            type="number"
            min={1}
            max={480}
            value={formData.averageTimeMinutes}
            onChange={handleInputChange}
            error={errors.averageTimeMinutes}
          />
        </div>

        <TextArea
          label="Ta'rif"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Joy haqida qisqacha ma'lumot..."
          error={errors.description}
        />
      </div>

      {/* Xarita qismi */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
          🗺️ Xaritada joylashuv
        </h3>

        <MapPicker
          latitude={formData.latitude}
          longitude={formData.longitude}
          onCoordinateChange={handleCoordinateChange}
        />

        {errors.latitude && (
          <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>
        )}

        {/* Koordinata inputlari (manual kiritish uchun) */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Kenglik (Latitude)"
            type="number"
            step="any"
            value={formData.latitude ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseFloat(e.target.value) : null
              setFormData((prev) => ({ ...prev, latitude: val }))
            }}
            placeholder="Masalan: 41.3186"
          />
          <Input
            label="Uzunlik (Longitude)"
            type="number"
            step="any"
            value={formData.longitude ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseFloat(e.target.value) : null
              setFormData((prev) => ({ ...prev, longitude: val }))
            }}
            placeholder="Masalan: 69.2502"
          />
        </div>
        <p className="text-xs text-gray-400">
          💡 Xaritani bosib yoki markerni sudrab koordinatalarni avtomatik to'ldiring
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              category: 'historical',
              averageTimeMinutes: 30,
              latitude: null,
              longitude: null,
              city: 'Toshkent',
            })
            setErrors({})
          }}
        >
          Tozalash
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting} size="lg">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Joyni qo'shish
          </span>
        </Button>
      </div>
    </form>
  )
}
