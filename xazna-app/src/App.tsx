import React, { useState, useEffect } from 'react'
import { ChatBot } from './components/chatbot/ChatBot'
import { AddLocationForm } from './components/admin/AddLocationForm'
import { DistanceCalculator } from './components/admin/DistanceCalculator'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { UserProfile } from './components/auth/UserProfile'
import Shop from './components/shop/Shop'
import Missions from './components/missions/Missions'
import Inventory from './components/inventory/Inventory'
import ProfilePage from './components/profile/ProfilePage'
import ShareModal from './components/sharing/ShareModal'
import { AppStoreProvider, useAppStore } from './hooks/useAppStore'
import type { LocationFormData } from './types'

type Tab = 'chat' | 'admin' | 'calculator' | 'shop' | 'missions' | 'inventory'

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const { user, updateUser, incrementMissionType } = useAppStore()

  const handleLocationSubmit = (data: LocationFormData) => {
    console.log('Yangi lokatsiya qo\'shildi:', data)
  }

  const handleLogin = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (email && password) {
      setIsAuthenticated(true)
    } else {
      throw new Error('Login yoki parol noto\'g\'ri')
    }
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (email && password && name) {
      // Yangi foydalanuvchi ro'yxatdan o'tganda profil ma'lumotlarini yangilash
      updateUser({ name, email, avatar: name.charAt(0).toUpperCase() })
      setIsAuthenticated(true)
    } else {
      throw new Error('Ro\'yxatdan otishda xatolik')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    window.location.reload()
  }

  // Auto-login demo
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setIsAuthenticated(true)
    }
  }, [])

  // Auth token saqlash
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('auth_token', 'demo_token_' + Date.now())
    } else {
      localStorage.removeItem('auth_token')
    }
  }, [isAuthenticated])

  // Sayohat yaratilganda mission progress
  const handleTripCreated = () => {
    incrementMissionType('create_itinerary')
    updateUser({ tripsPlanned: user.tripsPlanned + 1 })
  }

  // ====== NAV TABS ======
  const mainTabs = [
    { key: 'chat' as Tab, icon: '🤖', label: 'AI Yordamchi' },
    { key: 'admin' as Tab, icon: '📍', label: 'Admin' },
    { key: 'shop' as Tab, icon: '🛒', label: 'Do\'kon' },
    { key: 'missions' as Tab, icon: '🎯', label: 'Missiyalar' },
    { key: 'inventory' as Tab, icon: '🎒', label: 'Inventar' },
    { key: 'calculator' as Tab, icon: '📏', label: 'Masofa' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                X
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Xazina
              </span>
              {isAuthenticated && (
                <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                  🪙 {user.coins}
                </span>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Profile */}
              <div className="hidden sm:flex items-center gap-2">
                <UserProfile
                  user={{ name: user.name, email: user.email }}
                  onLogout={handleLogout}
                />
              </div>

              {/* Ulashish tugmasi */}
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Ulashish"
              >
                <span className="text-lg">📤</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {!isAuthenticated ? (
          // Auth forms
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg mx-auto mb-4">
                  X
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Xazina</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Sayohat rejalash uchun aqlli yordamchi</p>
              </div>
              {showRegister ? (
                <RegisterForm
                  onRegister={handleRegister}
                  onBackToLogin={() => setShowRegister(false)}
                />
              ) : (
                <LoginForm onLogin={handleLogin} onRegisterClick={() => setShowRegister(true)} />
              )}
            </div>
          </div>
        ) : (
          // Protected content
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-1.5 overflow-x-auto">
              <nav className="flex items-center gap-1 min-w-max">
                {mainTabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      activeTab === tab.key
                        ? 'bg-emerald-500 text-white shadow-md scale-105'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
                {/* Profil tugmasi */}
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="ml-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-700 dark:text-amber-300 hover:shadow-md flex items-center gap-1.5"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">Profil</span>
                </button>
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'chat' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        🤖 AI Sayohat Yordamchisi
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Sayohat rejalashingizga yordam beradi!
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full flex items-center gap-1">
                        🪙 {user.coins}
                      </span>
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full flex items-center gap-1">
                        ⭐ Lv.{user.level}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ height: 'calc(70vh - 160px)' }} className="p-6">
                  <ChatBot />
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    📍 Admin Panel
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Yangi lokatsiyalar qo'shish va baza boshqarish
                  </p>
                </div>
                <div className="p-6">
                  <AddLocationForm onSubmit={handleLocationSubmit} />
                </div>
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
                <Shop />
              </div>
            )}

            {activeTab === 'missions' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
                <Missions />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
                <Inventory />
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    📏 Masofa Kalkulyatori
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Haversine formulasi yordamida masofalar hisoblang
                  </p>
                </div>
                <div className="p-6">
                  <DistanceCalculator />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={{
          title: 'Xazina - Sayohat Yordamchisi',
          text: `Xazina ilovasida ${user.tripsPlanned} ta sayohat rejalashtirdim! ${user.level}-darajaga yetdim! Siz ham sinab ko'ring 🚀`,
          url: window.location.href,
        }}
      />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  )
}

export default App
