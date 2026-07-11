// ============================================
// Backend API simulyatsiyasi
// ============================================

import type { ItineraryRequest, Itinerary, TimelineItem } from '../types'

/**
 * Hozircha backend mavjud emas, shuning uchun
 * bu funksiya marshrut yaratishni simulyatsiya qiladi.
 *
 * Kelajakda bu yerda haqiqiy API chaqiruvi bo'ladi:
 * ```ts
 * const res = await fetch('/api/itinerary', { method: 'POST', body: JSON.stringify(req) })
 * return res.json()
 * ```
 */
export async function generateItinerary(
  request: ItineraryRequest
): Promise<Itinerary> {
  // Backend chaqiruvini simulyatsiya qilish
  await new Promise((resolve) => setTimeout(resolve, 2500))

  // Namuna ma'lumotlar
  const mockItinerary: Itinerary = generateMockItinerary(request)

  return mockItinerary
}

function generateMockItinerary(request: ItineraryRequest): Itinerary {
  const cityData: Record<string, TimelineItem[]> = {
    Toshkent: [],
    Namangan: [],
  }

  const items: TimelineItem[] = []

  return {
    id: crypto.randomUUID(),
    city: request.city,
    totalDuration: request.duration,
    budget: request.budget,
    transport: request.transport,
    items,
    createdAt: new Date(),
  }
}
