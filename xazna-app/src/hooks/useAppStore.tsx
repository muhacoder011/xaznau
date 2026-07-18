// ============================================
// Xazina App Store — markaziy holat boshqaruvi
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { AppUser, InventoryItem, Mission } from '../types'
import { INITIAL_USER, INITIAL_INVENTORY } from '../data/userData'
import { SHOP_ITEMS } from '../data/shopItems'
import { MISSIONS } from '../data/missions'

interface AppStoreState {
  user: AppUser
  inventory: InventoryItem[]
  missions: Mission[]
  isStoreLoaded: boolean
}

interface AppStoreContext extends AppStoreState {
  // User
  updateUser: (updates: Partial<AppUser>) => void
  addExperience: (amount: number) => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean

  // Inventory
  addToInventory: (item: Omit<InventoryItem, 'id' | 'purchasedAt'>) => void
  useItem: (itemId: string) => void
  removeItem: (itemId: string) => void

  // Missions
  updateMissionProgress: (missionId: string, progress: number) => void
  completeMission: (missionId: string) => void
  claimMissionReward: (missionId: string) => void
  incrementMissionType: (type: string) => void

  // Shop
  buyItem: (shopItemId: string) => boolean
  getItemById: (id: string) => (typeof SHOP_ITEMS)[number] | undefined
}

const StoreContext = createContext<AppStoreContext | null>(null)

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser>(INITIAL_USER)
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY)
  const [missions, setMissions] = useState<Mission[]>(MISSIONS)
  const [isStoreLoaded, setIsStoreLoaded] = useState(false)

  // LocalStorage dan yuklash
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xazina_store')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUser(parsed.user || INITIAL_USER)
        setInventory(parsed.inventory || INITIAL_INVENTORY)
        setMissions(parsed.missions || MISSIONS)
      }
    } catch (e) {
      console.warn('Store yuklanmadi, boshlang\'ich holat ishlatiladi')
    }
    setIsStoreLoaded(true)
  }, [])

  // Saqlash
  useEffect(() => {
    if (isStoreLoaded) {
      localStorage.setItem('xazina_store', JSON.stringify({ user, inventory, missions }))
    }
  }, [user, inventory, missions, isStoreLoaded])

  const updateUser = useCallback((updates: Partial<AppUser>) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  const addExperience = useCallback((amount: number) => {
    setUser(prev => {
      let { experience, level, experienceToNextLevel } = prev
      experience += amount
      while (experience >= experienceToNextLevel) {
        experience -= experienceToNextLevel
        level += 1
        experienceToNextLevel = level * 200 + 100
      }
      return { ...prev, experience, level, experienceToNextLevel }
    })
  }, [])

  const addCoins = useCallback((amount: number) => {
    setUser(prev => ({ ...prev, coins: prev.coins + amount }))
  }, [])

  const spendCoins = useCallback((amount: number): boolean => {
    if (user.coins < amount) return false
    setUser(prev => ({ ...prev, coins: prev.coins - amount }))
    return true
  }, [user.coins])

  const addToInventory = useCallback((item: Omit<InventoryItem, 'id' | 'purchasedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      purchasedAt: new Date(),
    }
    setInventory(prev => [...prev, newItem])
  }, [])

  const useItem = useCallback((itemId: string) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, isUsed: true, quantity: item.quantity - 1 } : item
      ).filter(item => item.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId))
  }, [])

  const updateMissionProgress = useCallback((missionId: string, progress: number) => {
    setMissions(prev =>
      prev.map(m =>
        m.id === missionId
          ? { ...m, progress: Math.min(progress, 100), status: progress >= 100 ? 'completed' : 'in_progress' }
          : m
      )
    )
  }, [])

  const completeMission = useCallback((missionId: string) => {
    setMissions(prev =>
      prev.map(m => (m.id === missionId ? { ...m, status: 'completed', progress: 100 } : m))
    )
  }, [])

  const claimMissionReward = useCallback((missionId: string) => {
    setMissions(prev =>
      prev.map(m => {
        if (m.id === missionId && m.status === 'completed') {
          addCoins(m.reward.coins)
          addExperience(m.reward.experience)

          // Agar item sovg'a bo'lsa, inventarga qo'shish
          const shopItem = m.reward.item
            ? SHOP_ITEMS.find(si => si.name === m.reward.item)
            : undefined

          if (shopItem) {
            const existing = inventory.find(i => i.shopItemId === shopItem.id && !i.isUsed)
            if (existing) {
              setInventory(prev =>
                prev.map(i => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i))
              )
            } else {
              addToInventory({
                shopItemId: shopItem.id,
                name: shopItem.name,
                description: shopItem.description,
                icon: shopItem.icon,
                category: shopItem.category,
                isUsed: false,
                quantity: 1,
                image: shopItem.image,
              })
            }
          }

          return { ...m, status: 'claimed' }
        }
        return m
      })
    )
  }, [addCoins, addExperience, addToInventory, inventory])

  const incrementMissionType = useCallback((type: string) => {
    setMissions(prev =>
      prev.map(m => {
        if (m.status !== 'available' && m.status !== 'in_progress') return m
        if (m.requirements.type !== type) return m

        const newCurrent = m.requirements.current + 1
        const newProgress = Math.min(Math.round((newCurrent / m.requirements.target) * 100), 100)
        const newStatus = newProgress >= 100 ? 'completed' : 'in_progress'

        return {
          ...m,
          requirements: { ...m.requirements, current: newCurrent },
          progress: newProgress,
          status: newStatus as Mission['status'],
        }
      })
    )
  }, [])

  const buyItem = useCallback((shopItemId: string): boolean => {
    const shopItem = SHOP_ITEMS.find(item => item.id === shopItemId)
    if (!shopItem) return false
    if (user.coins < shopItem.price) return false

    setUser(prev => ({ ...prev, coins: prev.coins - shopItem.price }))

    addToInventory({
      shopItemId: shopItem.id,
      name: shopItem.name,
      description: shopItem.description,
      icon: shopItem.icon,
      category: shopItem.category,
      isUsed: false,
      quantity: 1,
      image: shopItem.image,
    })

    // Mission progress
    incrementMissionType('buy_item')

    return true
  }, [addToInventory, incrementMissionType, user.coins])

  const getItemById = useCallback((id: string) => {
    return SHOP_ITEMS.find(item => item.id === id)
  }, [])

  return (
    <StoreContext.Provider
      value={{
        user,
        inventory,
        missions,
        isStoreLoaded,
        updateUser,
        addExperience,
        addCoins,
        spendCoins,
        addToInventory,
        useItem,
        removeItem,
        updateMissionProgress,
        completeMission,
        claimMissionReward,
        incrementMissionType,
        buyItem,
        getItemById,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useAppStore(): AppStoreContext {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider')
  }
  return context
}
