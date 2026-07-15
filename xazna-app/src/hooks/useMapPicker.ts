// ============================================
// Xarita orqali koordinata tanlash hook'i
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react'
import L from 'leaflet'

// Leaflet marker icon fix (webpack/vite bilan muammo)
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
})

interface UseMapPickerOptions {
  initialLat?: number | null
  initialLng?: number | null
  onCoordinateChange?: (lat: number, lng: number) => void
}

export function useMapPicker(options: UseMapPickerOptions = {}) {
  const { initialLat, initialLng, onCoordinateChange } = options

  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const [latitude, setLatitude] = useState<number | null>(initialLat ?? null)
  const [longitude, setLongitude] = useState<number | null>(initialLng ?? null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Xaritani boshlang'ich sozlash
  const initMap = useCallback((container: HTMLDivElement) => {
    if (mapRef.current) return

    mapContainerRef.current = container

    const defaultLat = initialLat ?? 41.2995
    const defaultLng = initialLng ?? 69.2401

    const map = L.map(container, {
      center: [defaultLat, defaultLng],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Agar boshlang'ich koordinatalar berilgan bo'lsa, marker qo'yish
    if (initialLat && initialLng) {
      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map)
      markerRef.current = marker
      marker.bindPopup(`<i className="fa-solid fa-location-dot"></i> ${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}`)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        const lat = parseFloat(pos.lat.toFixed(6))
        const lng = parseFloat(pos.lng.toFixed(6))
        setLatitude(lat)
        setLongitude(lng)
        marker.setPopupContent(`<i className="fa-solid fa-location-dot"></i> ${lat}, ${lng}`)
        onCoordinateChange?.(lat, lng)
      })
    }

    // Xaritani bosganda marker qo'yish/ko'chirish
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6))
      const lng = parseFloat(e.latlng.lng.toFixed(6))

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
        markerRef.current = marker

        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          const newLat = parseFloat(pos.lat.toFixed(6))
          const newLng = parseFloat(pos.lng.toFixed(6))
          setLatitude(newLat)
          setLongitude(newLng)
          marker.setPopupContent(`<i className="fa-solid fa-location-dot"></i> ${newLat}, ${newLng}`)
          onCoordinateChange?.(newLat, newLng)
        })
      }

      setLatitude(lat)
      setLongitude(lng)
      markerRef.current.setPopupContent(`<i className="fa-solid fa-location-dot"></i> ${lat}, ${lng}`)
      onCoordinateChange?.(lat, lng)
    })

    mapRef.current = map
    setIsMapReady(true)

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      setIsMapReady(false)
    }
  }, [initialLat, initialLng, onCoordinateChange])

  // Koordinatalarni dasturiy o'rnatish
  const setCoordinates = useCallback((lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      markerRef.current.setPopupContent(`<i className="fa-solid fa-location-dot"></i> ${lat}, ${lng}`)
    } else if (mapRef.current) {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current)
      markerRef.current = marker

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        const newLat = parseFloat(pos.lat.toFixed(6))
        const newLng = parseFloat(pos.lng.toFixed(6))
        setLatitude(newLat)
        setLongitude(newLng)
        marker.setPopupContent(`<i className="fa-solid fa-location-dot"></i> ${newLat}, ${newLng}`)
        onCoordinateChange?.(newLat, newLng)
      })
    }

    mapRef.current?.setView([lat, lng], mapRef.current.getZoom())
  }, [onCoordinateChange])

  // Xaritani qayta yuklash
  const resetMap = useCallback((lat?: number, lng?: number) => {
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    const centerLat = lat ?? 41.2995
    const centerLng = lng ?? 69.2401

    setLatitude(null)
    setLongitude(null)
    mapRef.current?.setView([centerLat, centerLng], 12)
  }, [])

  return {
    mapRef,
    markerRef,
    mapContainerRef,
    latitude,
    longitude,
    isMapReady,
    initMap,
    setCoordinates,
    resetMap,
  }
}
