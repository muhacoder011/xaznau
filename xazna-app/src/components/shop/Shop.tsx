import React, { useState } from 'react'
import { useAppStore } from '../../hooks/useAppStore'
import { SHOP_ITEMS } from '../../data/shopItems'
import type { ShopItem, ShopItemCategory } from '../../types'
import { SHOP_ITEM_CATEGORY_LABELS } from '../../types'

const Shop: React.FC = () => {
  const { user, buyItem } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<ShopItemCategory | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const categories: (ShopItemCategory | 'all')[] = ['all', 'transport', 'food', 'guide', 'souvenir', 'boost']

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(item => item.category === selectedCategory)

  const handleBuy = (item: ShopItem) => {
    const success = buyItem(item.id)
    if (success) {
      setPurchaseMessage({ type: 'success', text: `"${item.name}" muvaffaqiyatli sotib olindi! ✅` })
      setSelectedItem(null)
    } else {
      setPurchaseMessage({ type: 'error', text: `Tangalar yetarli emas! ${item.price} 🪙 kerak. Sizda: ${user.coins} 🪙` })
    }
    setTimeout(() => setPurchaseMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Sarlavha va tanga balansi */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🛒 Do'kon</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sayohat uchun kerakli narsalarni xarid qiling</p>
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
            {cat === 'all' ? '🏷️ Barchasi' : SHOP_ITEM_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Xarid xabari */}
      {purchaseMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
            purchaseMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {purchaseMessage.text}
        </div>
      )}

      {/* Mahsulotlar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
          >
            {/* Gradient header */}
            <div className={`h-24 bg-gradient-to-br ${item.color} flex items-center justify-center relative overflow-hidden`}>
              <span className="text-5xl filter drop-shadow-lg">{item.icon}</span>
              {item.isPopular && (
                <span className="absolute top-2 right-2 bg-white/90 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                  ⭐ Top
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>

              {/* Benefits */}
              <div className="space-y-1">
                {item.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <span className="text-emerald-500">✓</span>
                    {benefit}
                  </div>
                ))}
              </div>

              {/* Narx va sotib olish */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold text-lg">{item.price}</span>
                  <span className="text-amber-500">🪙</span>
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    user.coins >= item.price
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg active:scale-95'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={user.coins < item.price}
                >
                  {user.coins >= item.price ? 'Sotib olish' : 'Yetarli emas'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasdiqlash modali */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className={`h-20 bg-gradient-to-br ${selectedItem.color} rounded-2xl flex items-center justify-center mb-4`}>
              <span className="text-4xl">{selectedItem.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">{selectedItem.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">{selectedItem.description}</p>

            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3 flex items-center justify-between mb-4">
              <span className="text-gray-700 dark:text-gray-200 font-medium">Narxi:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold text-lg flex items-center gap-1">
                {selectedItem.price} 🪙
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleBuy(selectedItem)}
                disabled={user.coins < selectedItem.price}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
              >
                {user.coins >= selectedItem.price ? '✅ Sotib olish' : '❌ Yetarli emas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop
