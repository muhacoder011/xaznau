import React, { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { haversineDistance, formatDistance } from '../../utils/haversine'

interface CoordInput {
  lat: string
  lng: string
}

export const DistanceCalculator: React.FC = () => {
  const [pointA, setPointA] = useState<CoordInput>({ lat: '', lng: '' })
  const [pointB, setPointB] = useState<CoordInput>({ lat: '', lng: '' })
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)

    const lat1 = parseFloat(pointA.lat)
    const lng1 = parseFloat(pointA.lng)
    const lat2 = parseFloat(pointB.lat)
    const lng2 = parseFloat(pointB.lng)

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      setError('Barcha maydonlarni to\'g\'ri to\'ldiring')
      return
    }

    if (
      Math.abs(lat1) > 90 || Math.abs(lat2) > 90 ||
      Math.abs(lng1) > 180 || Math.abs(lng2) > 180
    ) {
      setError('Koordinatalar noto\'g\'ri. Kenglik: -90..90, Uzunlik: -180..180')
      return
    }

    const distance = haversineDistance(lat1, lng1, lat2, lng2)
    setResult(distance)
  }

  const handleClear = () => {
    setPointA({ lat: '', lng: '' })
    setPointB({ lat: '', lng: '' })
    setResult(null)
    setError(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        📏 Masofa kalkulyatori
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Haversine formulasi orqali ikki joy orasidagi masofani hisoblang
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* A nuqta */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
              A
            </span>
            Birinchi nuqta
          </h4>
          <Input
            label="Kenglik (Lat)"
            type="number"
            step="any"
            value={pointA.lat}
            onChange={(e) => setPointA((prev) => ({ ...prev, lat: e.target.value }))}
            placeholder="41.3186"
          />
          <Input
            label="Uzunlik (Lng)"
            type="number"
            step="any"
            value={pointA.lng}
            onChange={(e) => setPointA((prev) => ({ ...prev, lng: e.target.value }))}
            placeholder="69.2502"
          />
        </div>

        {/* B nuqta */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
              B
            </span>
            Ikkinchi nuqta
          </h4>
          <Input
            label="Kenglik (Lat)"
            type="number"
            step="any"
            value={pointB.lat}
            onChange={(e) => setPointB((prev) => ({ ...prev, lat: e.target.value }))}
            placeholder="41.3100"
          />
          <Input
            label="Uzunlik (Lng)"
            type="number"
            step="any"
            value={pointB.lng}
            onChange={(e) => setPointB((prev) => ({ ...prev, lng: e.target.value }))}
            placeholder="69.2500"
          />
        </div>
      </div>

      {/* Natija */}
      {result !== null && (
        <div className="mt-5 bg-gradient-to-r from-primary-50 to-amber-50 rounded-xl p-5 border border-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hisoblangan masofa</p>
              <p className="text-3xl font-bold text-primary-700 mt-1">
                {formatDistance(result)}
              </p>
            </div>
            <div className="text-right text-xs text-gray-400 font-mono">
              <p>Haversine formulasi</p>
              <p>Yer radiusi: 6371 km</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tugmalar */}
      <div className="mt-5 flex items-center gap-3">
        <Button onClick={handleCalculate} variant="primary" size="lg">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Hisoblash
          </span>
        </Button>
        <Button onClick={handleClear} variant="secondary">
          Tozalash
        </Button>
      </div>
    </div>
  )
}
