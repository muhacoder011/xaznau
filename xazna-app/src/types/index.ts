// ============================================
// Xazina — Umumiy TypeScript turlari
// ============================================

// --- ChatBot turlari ---

export interface ChatQuestion {
  id: number
  text: string
  options: ChatOption[]
}

export interface ChatOption {
  label: string
  value: string
  icon?: string
}

export interface ChatAnswer {
  questionId: number
  value: string
  label: string
}

export interface ChatMessage {
  id: string
  type: 'bot' | 'user'
  text: string
  options?: ChatOption[]
  selectedOption?: string
  timestamp: Date
}

export interface ItineraryRequest {
  city: string
  duration: string
  budget: string
  transport: string
  prayerTimes: string
  foodPreference: string
}

// --- Marshrut (Timeline) turlari ---

export interface TimelineItem {
  id: string
  order: number
  placeName: string
  description: string
  durationMinutes: number
  distanceFromPreviousKm: number
  category: LocationCategory
  coordinates: {
    lat: number
    lng: number
  }
}

export interface Itinerary {
  id: string
  city: string
  totalDuration: string
  budget: string
  transport: string
  items: TimelineItem[]
  createdAt: Date
}

// --- Lokatsiya (Admin) turlari ---

export type LocationCategory =
  | 'masjid'
  | 'museum'
  | 'park'
  | 'restaurant'
  | 'historical'

export interface Location {
  id: string
  name: string
  description: string
  category: LocationCategory
  averageTimeMinutes: number
  latitude: number
  longitude: number
  city: string
  createdAt: Date
}

export interface LocationFormData {
  name: string
  description: string
  category: LocationCategory
  averageTimeMinutes: number
  latitude: number | null
  longitude: number | null
  city: string
}

// --- Kategoriya konfiguratsiyasi ---

export const CATEGORY_LABELS: Record<LocationCategory, string> = {
  masjid: '🕌 Masjid',
  museum: '🏛️ Muzey',
  park: '🌳 Park',
  restaurant: '🍽️ Oshxona',
  historical: '🏰 Tarixiy',
}

export const CATEGORY_COLORS: Record<LocationCategory, string> = {
  masjid: 'bg-emerald-100 text-emerald-800',
  museum: 'bg-amber-100 text-amber-800',
  park: 'bg-green-100 text-green-800',
  restaurant: 'bg-orange-100 text-orange-800',
  historical: 'bg-purple-100 text-purple-800',
}
