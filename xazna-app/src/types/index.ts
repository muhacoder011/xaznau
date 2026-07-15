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
  masjid: '<i className="fa-solid fa-mosque"></i> Masjid',
  museum: '<i className="fa-solid fa-landmark"></i> Muzey',
  park: '<i className="fa-solid fa-tree"></i> Park',
  restaurant: '<i className="fa-solid fa-utensils"></i> Oshxona',
  historical: '<i className="fa-solid fa-chess-rook"></i> Tarixiy',
}

export const CATEGORY_COLORS: Record<LocationCategory, string> = {
  masjid: 'bg-emerald-100 text-emerald-800',
  museum: 'bg-amber-100 text-amber-800',
  park: 'bg-green-100 text-green-800',
  restaurant: 'bg-orange-100 text-orange-800',
  historical: 'bg-purple-100 text-purple-800',
}

// ============================================
// Yangi turlar: Do'kon, Missiyalar, Profil, Inventar
// ============================================

// --- Foydalanuvchi profili ---

export interface AppUser {
  id: string
  name: string
  email: string
  avatar: string
  level: number
  experience: number
  experienceToNextLevel: number
  coins: number
  tripsPlanned: number
  destinationsVisited: number
  joinedAt: Date
}

// --- Do'kon (Shop) turlari ---

export type ShopItemCategory = 'guide' | 'souvenir' | 'boost'

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: ShopItemCategory
  icon: string
  color: string
  benefits: string[]
  isPopular?: boolean
  originalPrice?: number // Chegirma uchun asl narx
  stock?: number // Qancha dona qolgan (limited)
  isNew?: boolean // Yangi mahsulot
}

// --- Inventory (Sotib olingan narsalar) ---

export interface InventoryItem {
  id: string
  shopItemId: string
  name: string
  description: string
  icon: string
  category: ShopItemCategory
  purchasedAt: Date
  isUsed: boolean
  quantity: number
}

// --- Missiyalar (Missions/Quests) ---

export type MissionStatus = 'available' | 'in_progress' | 'completed' | 'claimed'
export type MissionDifficulty = 'easy' | 'medium' | 'hard'
export type MissionType = 'daily' | 'weekly' | 'achievement'

export interface Mission {
  id: string
  title: string
  description: string
  icon: string
  type: MissionType
  difficulty: MissionDifficulty
  reward: {
    coins: number
    experience: number
    item?: string
  }
  requirements: {
    type: string
    target: number
    current: number
  }
  status: MissionStatus
  progress: number // 0-100
}

// --- Ulashish (Sharing) turlari ---

export interface ShareData {
  title: string
  text: string
  url?: string
}

export const SHOP_ITEM_CATEGORY_LABELS: Record<ShopItemCategory, string> = {
  guide: '<i className="fa-solid fa-compass"></i> Gid xizmati',
  souvenir: '<i className="fa-solid fa-gift"></i> Suvenir',
  boost: '<i className="fa-solid fa-bolt"></i> Kuchaytirish',
}
