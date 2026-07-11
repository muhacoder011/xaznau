import type { AppUser, InventoryItem } from '../types'

// Boshlang'ich foydalanuvchi ma'lumotlari
export const INITIAL_USER: AppUser = {
  id: 'user-1',
  name: 'Ali Valiyev',
  email: 'ali@example.com',
  avatar: 'A',
  level: 1,
  experience: 0,
  experienceToNextLevel: 200,
  coins: 100, // Yangi foydalanuvchiga bonus sifatida 100 tanga
  tripsPlanned: 0,
  destinationsVisited: 0,
  joinedAt: new Date(),
}

// Boshlang'ich inventar (bo'sh)
export const INITIAL_INVENTORY: InventoryItem[] = []

// Darajalar uchun tajriba talablari
export const LEVEL_EXPERIENCE_REQUIREMENTS: Record<number, number> = {
  1: 200,
  2: 500,
  3: 1000,
  4: 2000,
  5: 3500,
  6: 5000,
  7: 7500,
  8: 10000,
  9: 15000,
  10: 20000,
}

export function getExperienceForLevel(level: number): number {
  if (level >= 10) return 20000
  return LEVEL_EXPERIENCE_REQUIREMENTS[level] || 200
}
