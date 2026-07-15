import React, { useState, useMemo } from 'react'
import { useAppStore } from '../../hooks/useAppStore'
import { SHOP_ITEMS } from '../../data/shopItems'
import type { ShopItem, ShopItemCategory } from '../../types'
import { SHOP_ITEM_CATEGORY_LABELS } from '../../types'

type SortOption = 'default' | 'price-asc' | 'price-desc'

const Shop: React.FC = () => {
  const { user, buyItem } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<ShopItemCategory | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('default')

  const categories: (ShopItemCategory | 'all')[] = ['all', 'guide', 'souvenir', 'boost']

  // Daily deals - items with discounts
  const dailyDeals = useMemo(() => SHOP_ITEMS.filter(item => item.originalPrice), [])

  // Sort va filter
  const filteredItems = useMemo(() => {
    let items = selectedCategory === 'all'
      ? [...SHOP_ITEMS]
      : SHOP_ITEMS.filter(item => item.category === selectedCategory)

    switch (sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        items.sort((a, b) => b.price - a.price)
        break
    }
    return items
  }, [selectedCategory, sortBy])

  const handleBuy = (item: ShopItem, qty: number) => {
    // Multiple purchase
    let successCount = 0
    const totalPrice = item.price * qty

    if (user.coins < totalPrice) {
      setPurchaseMessage({ type: 'error', text: `Tangalar yetarli emas! ${totalPrice} <i className="fa-solid fa-coins"></i> kerak. Sizda: ${user.coins} <i className="fa-solid fa-coins"></i>` })
      setTimeout(() => setPurchaseMessage(null), 3000)
      return
    }

    for (let i = 0; i < qty; i++) {
      const success = buyItem(item.id)
      if (success) successCount++
    }

    if (successCount > 0) {
      setPurchaseMessage({ type: 'success', text: `"${item.name}" x${successCount} muvaffaqiyatli sotib olindi! <i className="fa-solid fa-check"></i>` })
      setSelectedItem(null)
      setQuantity(1)
    } else {
      setPurchaseMessage({ type: 'error', text: `Xatolik yuz berdi!` })
    }
    setTimeout(() => setPurchaseMessage(null), 3000)
  }

  const openBuyModal = (item: ShopItem) => {
    setSelectedItem(item)
    setQuantity(1)
  }

  const discountPercent = (item: ShopItem) => {
    if (!item.originalPrice) return 0
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Sarlavha va tanga balansi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white"><i className="fa-solid fa-cart-shopping"></i> Do'kon</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sayohat uchun kerakli narsalarni xarid qiling</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-full self-start">
          <span className="text-xl"><i className="fa-solid fa-coins"></i></span>
          <span className="font-bold text-amber-700 dark:text-amber-300 text-lg">{user.coins}</span>
        </div>
      </div>

      {/* Daily Deals */}
      {dailyDeals.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-800/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg"><i className="fa-solid fa-fire"></i></span>
            <h3 className="font-bold text-gray-800 dark:text-white">Kunlik chegirmalar</h3>
            <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium">Cheklangan vaqt</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {dailyDeals.map(deal => (
              <button
                key={deal.id}
                onClick={() => { setSelectedCategory('all'); openBuyModal(deal) }}
                className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-red-100 dark:border-gray-700 flex items-center gap-3 min-w-[200px]"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${deal.color} flex items-center justify-center text-xl`}>
                  {deal.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{deal.name}</p>
                  <p className="text-xs">
                    <span className="text-amber-600 font-bold">{deal.price} <i className="fa-solid fa-coins"></i></span>
                    <span className="text-gray-400 line-through ml-1">{deal.originalPrice} <i className="fa-solid fa-coins"></i></span>
                    <span className="text-red-500 font-bold ml-1">-{discountPercent(deal)}%</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kategoriya filtri va sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
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
              {cat === 'all' ? '<i className="fa-solid fa-tag"></i> Barchasi' : SHOP_ITEM_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="default"><i className="fa-solid fa-thumbtack"></i> Standart</option>
          <option value="price-asc"><i className="fa-solid fa-dollar-sign"></i> Narx: arzondan qimmatga</option>
          <option value="price-desc"><i className="fa-solid fa-dollar-sign"></i> Narx: qimmatdan arzonga</option>
        </select>
      </div>

      {/* Xarid xabari */}
      {purchaseMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium animate-slide-down ${
            purchaseMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
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
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-[1.02] animate-fade-in"
          >
            {/* Gradient header */}
            <div className={`h-28 bg-gradient-to-br ${item.color} flex items-center justify-center relative overflow-hidden`}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/30 rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/20 rounded-full" />
              </div>
              <span className="text-5xl filter drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform">{item.icon}</span>
              
              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {item.isPopular && (
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                    <i className="fa-solid fa-star"></i> Top
                  </span>
                )}
                {item.originalPrice && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                    -{discountPercent(item)}%
                  </span>
                )}
                {item.isNew && (
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                    🆕 Yangi
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight">{item.name}</h3>
                {item.stock !== undefined && item.stock <= 10 && (
                  <span className="text-xs px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium whitespace-nowrap">
                    {item.stock} dona
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>

              {/* Benefits */}
              <div className="space-y-1">
                {item.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <span className="text-emerald-500 font-bold"><i className="fa-solid fa-check"></i></span>
                    {benefit}
                  </div>
                ))}
              </div>

              {/* Narx va sotib olish */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold text-lg">{item.price}</span>
                    <span className="text-amber-500"><i className="fa-solid fa-coins"></i></span>
                  </div>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">{item.originalPrice} <i className="fa-solid fa-coins"></i></span>
                  )}
                </div>
                <button
                  onClick={() => openBuyModal(item)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    user.coins >= item.price
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg active:scale-95'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {user.coins >= item.price ? 'Sotib olish' : 'Yetarli emas'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
            <span className="text-5xl block mb-3"><i className="fa-solid fa-inbox"></i></span>
            <p>Bu kategoriyada mahsulotlar topilmadi</p>
          </div>
        )}
      </div>

      {/* Tasdiqlash modali */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setSelectedItem(null); setQuantity(1) }}>
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className={`h-24 bg-gradient-to-br ${selectedItem.color} rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden`}>
              <span className="text-5xl">{selectedItem.icon}</span>
              {selectedItem.originalPrice && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  -{discountPercent(selectedItem)}%
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">{selectedItem.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">{selectedItem.description}</p>

            {/* Narx */}
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3 flex items-center justify-between mb-4">
              <span className="text-gray-700 dark:text-gray-200 font-medium">Narxi:</span>
              <div className="text-right">
                <span className="text-amber-600 dark:text-amber-400 font-bold text-lg flex items-center gap-1">
                  {selectedItem.price} <i className="fa-solid fa-coins"></i>
                </span>
                {selectedItem.originalPrice && (
                  <span className="text-xs text-gray-400 line-through block">{selectedItem.originalPrice} <i className="fa-solid fa-coins"></i></span>
                )}
              </div>
            </div>

            {/* Miqdor tanlash */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
              <label className="text-sm text-gray-600 dark:text-gray-300 font-medium block mb-2">Miqdor:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center font-bold text-lg transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center text-2xl font-bold text-gray-800 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center font-bold text-lg transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Jami: <span className="text-amber-600 font-bold">{selectedItem.price * quantity} <i className="fa-solid fa-coins"></i></span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedItem(null); setQuantity(1) }}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleBuy(selectedItem, quantity)}
                disabled={user.coins < selectedItem.price * quantity}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
              >
                {user.coins >= selectedItem.price * quantity
                  ? `<i className="fa-solid fa-check"></i> Sotib olish (${quantity} dona)`
                  : '<i className="fa-solid fa-xmark"></i> Yetarli emas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop
