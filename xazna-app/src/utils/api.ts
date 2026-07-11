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
    Toshkent: [
      {
        id: '1',
        order: 1,
        placeName: "Minor masjidi",
        description: "Toshkentdagi eng katta va go'zal masjidlardan biri",
        durationMinutes: 40,
        distanceFromPreviousKm: 0,
        category: 'masjid',
        coordinates: { lat: 41.3186, lng: 69.2502 },
      },
      {
        id: '2',
        order: 2,
        placeName: "Amir Temur muzeyi",
        description: "Amir Temur va Temuriylar davriga oid noyob eksponatlar",
        durationMinutes: 60,
        distanceFromPreviousKm: 2.8,
        category: 'museum',
        coordinates: { lat: 41.3112, lng: 69.2796 },
      },
      {
        id: '3',
        order: 3,
        placeName: "Navoiy bog'i",
        description: "Dam olish va sayr qilish uchun eng yaxshi park",
        durationMinutes: 45,
        distanceFromPreviousKm: 1.5,
        category: 'park',
        coordinates: { lat: 41.3022, lng: 69.2694 },
      },
      {
        id: '4',
        order: 4,
        placeName: "Chorsu bozori",
        description: "An'anaviy sharqona bozor — milliy ta'mlar va hunarmandchilik",
        durationMinutes: 90,
        distanceFromPreviousKm: 2.1,
        category: 'historical',
        coordinates: { lat: 41.3269, lng: 69.2334 },
      },
      {
        id: '5',
        order: 5,
        placeName: "Besh qozon milliy taomlari",
        description: "Eng mazali palov va milliy taomlar",
        durationMinutes: 60,
        distanceFromPreviousKm: 1.2,
        category: 'restaurant',
        coordinates: { lat: 41.3365, lng: 69.2411 },
      },
    ],
    Namangan: [
      {
        id: '1',
        order: 1,
        placeName: "Uychi masjidi",
        description: "Namangan viloyatidagi qadimiy masjid",
        durationMinutes: 40,
        distanceFromPreviousKm: 0,
        category: 'masjid',
        coordinates: { lat: 41.0167, lng: 71.6667 },
      },
      {
        id: '2',
        order: 2,
        placeName: "Xon saroyi",
        description: "Tarixiy Xon saroyi — go'zal me'morchilik namunasi",
        durationMinutes: 50,
        distanceFromPreviousKm: 2.4,
        category: 'historical',
        coordinates: { lat: 41.0013, lng: 71.6725 },
      },
      {
        id: '3',
        order: 3,
        placeName: "Namangan shahar parki",
        description: "Keng va ko'kalamzor istirohat bog'i",
        durationMinutes: 45,
        distanceFromPreviousKm: 1.8,
        category: 'park',
        coordinates: { lat: 40.9956, lng: 71.6542 },
      },
      {
        id: '4',
        order: 4,
        placeName: "Osh markazi",
        description: "Milliy osh va boshqa taomlar tayyorlanadigan markaz",
        durationMinutes: 60,
        distanceFromPreviousKm: 1.0,
        category: 'restaurant',
        coordinates: { lat: 40.9889, lng: 71.6485 },
      },
    ],
  }

  const items = (cityData[request.city] || cityData['Toshkent'])
    .slice(
      0,
      request.duration === '2 soat' ? 2 :
      request.duration === '4 soat' ? 3 :
      request.duration === '6 soat' ? 4 :
      5
    )
    .map((item, index) => ({
      ...item,
      order: index + 1,
      distanceFromPreviousKm:
        index === 0 ? 0 : Math.round((item.distanceFromPreviousKm + Math.random() * 0.5) * 10) / 10,
    }))

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
