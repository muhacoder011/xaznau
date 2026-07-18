import React, { useState, useEffect } from 'react'
import { ChatBot } from './components/chatbot/ChatBot'
import { AdminPanel } from './components/admin/AdminPanel'
import { DistanceCalculator } from './components/admin/DistanceCalculator'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { UserProfile } from './components/auth/UserProfile'
import Shop from './components/shop/Shop'
import Missions from './components/missions/Missions'
import Inventory from './components/inventory/Inventory'
import ProfilePage from './components/profile/ProfilePage'
import ShareModal from './components/sharing/ShareModal'
import Settings from './components/settings/Settings'
import { AppStoreProvider, useAppStore } from './hooks/useAppStore'
import { useTheme } from './hooks/useTheme'
type Tab = 'chat' | 'admin' | 'calculator' | 'shop' | 'missions' | 'inventory' | 'settings'

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const { user, updateUser, incrementMissionType } = useAppStore()
  useTheme() // Initialize theme on app load

  const handleLogin = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    // localStorage dagi ro'yxatdan o'tgan foydalanuvchilarni tekshirish
    const users = JSON.parse(localStorage.getItem('xazna_users') || '[]')
    const found = users.find((u: any) => u.email === email)
    if (found && found.password === password) {
      updateUser({ name: found.name, email: found.email, avatar: (found.name || found.email).charAt(0).toUpperCase() })
      setIsAuthenticated(true)
    } else if (found && found.password !== password) {
      throw new Error('Parol noto\'g\'ri')
    } else {
      throw new Error('Email topilmadi. Avval ro\'yxatdan o\'ting.')
    }
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    if (email && password && name) {
      // Yangi foydalanuvchini localStorage ga saqlash
      const users = JSON.parse(localStorage.getItem('xazna_users') || '[]')
      if (users.find((u: any) => u.email === email)) {
        throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan')
      }
      users.push({ name, email, password })
      localStorage.setItem('xazna_users', JSON.stringify(users))
      updateUser({ name, email, avatar: name.charAt(0).toUpperCase() })
      setIsAuthenticated(true)
    } else {
      throw new Error('Barcha maydonlarni to\'ldiring')
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
    { key: 'chat' as Tab, icon: '<i class="fa-solid fa-robot"></i>', label: 'AI Yordamchi' },
    { key: 'admin' as Tab, icon: '<i class="fa-solid fa-location-dot"></i>', label: 'Admin' },
    { key: 'shop' as Tab, icon: '<i class="fa-solid fa-cart-shopping"></i>', label: 'Do\'kon' },
    { key: 'missions' as Tab, icon: '<i class="fa-solid fa-bullseye"></i>', label: 'Missiyalar' },
    { key: 'inventory' as Tab, icon: '<i class="fa-solid fa-backpack"></i>', label: 'Inventar' },
    { key: 'calculator' as Tab, icon: '<i class="fa-solid fa-ruler"></i>', label: 'Masofa' },
    { key: 'settings' as Tab, icon: '<i class="fa-solid fa-sliders"></i>', label: 'Sozlamalar' },
  ]

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Floating background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-float-slowest" />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-sky-200/20 dark:bg-sky-500/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-rose-200/15 dark:bg-rose-500/8 rounded-full blur-3xl animate-float-slower" style={{ animationDelay: '-3s' }} />
      </div>
      {/* Navigation */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <i className="fa-solid fa-coins"></i> {user.coins}
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
                <span className="text-lg"><i className="fa-solid fa-share-from-square"></i></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
          <div className="lg:flex lg:gap-8">
            {/* Navigation Tabs - horizontal on mobile, sidebar on laptop */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-1.5 overflow-x-auto lg:overflow-visible lg:w-64 lg:flex-shrink-0 lg:p-3 lg:sticky lg:top-20 lg:self-start">
              <nav className="flex items-center gap-1 min-w-max lg:flex-col lg:min-w-0">
                {mainTabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 lg:w-full lg:text-left ${
                      activeTab === tab.key
                        ? 'bg-emerald-500 text-white shadow-md scale-105'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
                    <span className="hidden sm:inline lg:inline">{tab.label}</span>
                  </button>
                ))}
                {/* Profil tugmasi */}
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="ml-2 lg:ml-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-700 dark:text-amber-300 hover:shadow-md flex items-center gap-1.5 lg:w-full lg:text-left"
                >
                  <span><i className="fa-solid fa-user"></i></span>
                  <span className="hidden sm:inline lg:inline">Profil</span>
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-6 lg:space-y-8">
              {activeTab === 'chat' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <i className="fa-solid fa-robot"></i> AI Sayohat Yordamchisi
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Sayohat rejalashingizga yordam beradi!
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full flex items-center gap-1">
                          <i className="fa-solid fa-coins"></i> {user.coins}
                        </span>
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full flex items-center gap-1">
                          <i className="fa-solid fa-star"></i> Lv.{user.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ height: 'calc(70vh - 160px)' }} className="p-4 sm:p-6 lg:p-8">
                    <ChatBot />
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
                  <AdminPanel />
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
                      <i className="fa-solid fa-ruler"></i> Masofa Kalkulyatori
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

              {activeTab === 'settings' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
                  <Settings />
                </div>
              )}
            </div>
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
