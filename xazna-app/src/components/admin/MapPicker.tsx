import React, { useEffect, useRef } from 'react'
import { useMapPicker } from '../../hooks/useMapPicker'

interface Props {
  latitude: number | null
  longitude: number | null
  onCoordinateChange: (lat: number, lng: number) => void
}

export const MapPicker: React.FC<Props> = ({
  latitude,
  longitude,
  onCoordinateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  const {
    initMap,
    setCoordinates,
    resetMap,
  } = useMapPicker({
    initialLat: latitude,
    initialLng: longitude,
    onCoordinateChange,
  })

  useEffect(() => {
    if (containerRef.current && !hasInitialized.current) {
      hasInitialized.current = true
      initMap(containerRef.current)
    }
  }, [initMap])

  // Tashqaridan latitude/longitude o'zgarganida markerni yangilash
  useEffect(() => {
    if (latitude !== null && longitude !== null && hasInitialized.current) {
      setCoordinates(latitude, longitude)
    }
  }, [latitude, longitude, setCoordinates])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <i className="fa-solid fa-location-dot"></i> Xaritada joyni belgilang
      </label>

      <div
        ref={containerRef}
        className="w-full h-[350px] rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm"
        style={{ zIndex: 1 }}
      />

      <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5">
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-mouse-pointer"></i> Xaritani bosish — marker qo'yadi
        </span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-1">
          <i className="fa-solid fa-arrows-left-right"></i> Markerni sudrab — koordinatalarni o'zgartirish
        </span>
        {latitude && longitude && (
          <>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => resetMap()}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Koordinata displeyi */}
      {latitude !== null && longitude !== null && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">
                Kenglik:{' '}
                <strong className="text-primary-700 font-mono">
                  {latitude.toFixed(6)}
                </strong>
              </span>
              <span className="text-gray-600">
                Uzunlik:{' '}
                <strong className="text-primary-700 font-mono">
                  {longitude.toFixed(6)}
                </strong>
              </span>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
              <i className="fa-solid fa-check"></i> Belgilandi
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
