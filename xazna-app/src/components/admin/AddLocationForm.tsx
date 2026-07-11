import React, { useState, useCallback } from 'react'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { MapPicker } from './MapPicker'
import type { LocationFormData, LocationCategory } from '../../types'

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
]

interface Props {
  onSubmit?: (data: LocationFormData) => void
}

export const AddLocationForm: React.FC<Props> = ({ onSubmit }) => {
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
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 justify-center sm:justify-start">
          <span className="text-3xl">📍</span>
          Yangi joy qo'shish
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Marshrutlar bazasiga yangi lokatsiya qo'shing
        </p>
      </div>

      {/* Asosiy ma'lumotlar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
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
