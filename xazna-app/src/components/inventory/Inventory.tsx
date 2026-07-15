import React, { useState } from 'react'
import { useAppStore } from '../../hooks/useAppStore'
import { SHOP_ITEM_CATEGORY_LABELS } from '../../types'
import type { InventoryItem, ShopItemCategory } from '../../types'

const Inventory: React.FC = () => {
  const { inventory, useItem, user } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<ShopItemCategory | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const categories: (ShopItemCategory | 'all')[] = ['all', 'guide', 'souvenir', 'boost']

  const filteredItems = selectedCategory === 'all'
    ? inventory
    : inventory.filter(item => item.category === selectedCategory)

  const handleUseItem = (item: InventoryItem) => {
    if (item.category === 'boost') {
      useItem(item.id)
      setSelectedItem(null)
    } else {
      useItem(item.id)
      setSelectedItem(null)
    }
  }

  if (inventory.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🎒 Inventar</h2>
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm">
          <span className="text-6xl block mb-4">📦</span>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Inventar bo'sh</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Hali hech narsa sotib olmagansiz</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Do'kondan kerakli narsalarni xarid qiling 🛒
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🎒 Inventar</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sizning xaridlaringiz ({inventory.length} ta)</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-full">
          <span className="text-xl">🪙</span>
          <span className="font-bold text-amber-700 dark:text-amber-300 text-lg">{user.coins}</span>
        </div>
      </div>

      {/* Kategoriya filtri */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat === 'all' ? `📋 Barchasi (${inventory.length})` : `${SHOP_ITEM_CATEGORY_LABELS[cat]}`}
          </button>
        ))}
      </div>

      {/* Inventar ro'yxati */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border transition-all hover:shadow-md ${
              item.isUsed
                ? 'border-gray-200 dark:border-gray-700 opacity-50'
                : 'border-gray-100 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{item.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    x{item.quantity}
                  </span>
                  {item.isUsed && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400">
                      Ishlatilgan
                    </span>
                  )}
                </div>
              </div>
              {!item.isUsed && (
                <button
                  onClick={() => setSelectedItem(item)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-medium transition-all active:scale-95 flex-shrink-0"
                >
                  Foydalanish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Foydalanish modali */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl mx-auto mb-4">
              {selectedItem.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">{selectedItem.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">{selectedItem.description}</p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4 text-sm text-gray-600 dark:text-gray-300">
              <p>Bu elementdan foydalanmoqchimisiz?</p>
              <p className="text-xs text-gray-400 mt-1">Miqdori: {selectedItem.quantity} ta</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleUseItem(selectedItem)}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all active:scale-95 shadow-md"
              >
                ✅ Foydalanish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
