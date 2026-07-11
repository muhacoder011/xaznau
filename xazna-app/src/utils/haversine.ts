// ============================================
// Haversine formulasi — ikki nuqta orasidagi
// masofani kilometrda hisoblash
// ============================================

/**
 * Ikki geografik koordinata orasidagi masofani
 * Haversine formulasi yordamida hisoblaydi.
 *
 * @param lat1 - Birinchi nuqtaning kengligi (gradusda)
 * @param lon1 - Birinchi nuqtaning uzunligi (gradusda)
 * @param lat2 - Ikkinchi nuqtaning kengligi (gradusda)
 * @param lon2 - Ikkinchi nuqtaning uzunligi (gradusda)
 * @returns Masofa kilometrda
 *
 * @example
 * ```ts
 * const km = haversineDistance(41.2995, 69.2401, 41.3100, 69.2500)
 * console.log(km) // ≈ 1.4 km
 * ```
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Yer radiusi (km)

  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c * 10) / 10 // 1 xonagacha yaxlitlash
}

/**
 * Bir qator lokatsiyalar orasidagi masofalarni hisoblaydi.
 * Har bir lokatsiya uchun oldingi joydan masofani qaytaradi.
 *
 * @param locations - Koordinatalar massivi [{lat, lng}, ...]
 * @returns Masofalar massivi (birinchi element 0)
 */
export function calculateDistances(
  locations: Array<{ lat: number; lng: number }>
): number[] {
  if (locations.length === 0) return []
  if (locations.length === 1) return [0]

  const distances: number[] = [0]

  for (let i = 1; i < locations.length; i++) {
    const dist = haversineDistance(
      locations[i - 1].lat,
      locations[i - 1].lng,
      locations[i].lat,
      locations[i].lng
    )
    distances.push(dist)
  }

  return distances
}

/**
 * Masofani matn ko'rinishida qaytaradi.
 * Agar masofa 1 km dan kam bo'lsa metrda, aks holda km da.
 */
export function formatDistance(km: number): string {
  if (km < 0.1) {
    return `${Math.round(km * 1000)} m`
  }
  if (km < 1) {
    return `${Math.round(km * 10) * 100} m`
  }
  return `${km.toFixed(1)} km`
}
