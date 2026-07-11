import React, { useState, useEffect } from 'react'
import { ChatBot } from './components/chatbot/ChatBot'
import { AddLocationForm } from './components/admin/AddLocationForm'
import { DistanceCalculator } from './components/admin/DistanceCalculator'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { UserProfile } from './components/auth/UserProfile'
import type { LocationFormData, Itinerary } from './types'

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fs?: any
  }
}

type Tab = 'chat' | 'admin' | 'calculator'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const handleLocationSubmit = (data: LocationFormData) => {
    console.log('Yangi lokatsiya qo\'shildi:', data)
    // Kelajakda: backendga yuborish
  }

  const handleLogin = async (email: string, password: string) => {
    // Backend API chaqiruvini simulyatsiya qilish
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (email && password) {
      setIsAuthenticated(true)
    } else {
      throw new Error('Login yoki parol noto\'g\'ri')
    }
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    // Backend API chaqiruvini simulyatsiya qilish
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (email && password && name) {
      setIsAuthenticated(true)
    } else {
      throw new Error('Ro\'yxatdan otishda xatolik')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    // Reset chat state
    window.location.reload()
  }

  // Auto-login demo (saqlangan token bilan)
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setIsAuthenticated(true)
    }
  }, [])

  // Auth holatiga qarab token saqlash
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('auth_token', 'demo_token_' + Date.now())
    } else {
      localStorage.removeItem('auth_token')
    }
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                X
              </div>
              <span className="text-xl font-bold text-gray-900">
                Xazina
              </span>
            </div>

              {/* Authentication Status */}
            <div className="hidden sm:flex items-center gap-2">
              <UserProfile
                user={{ name: 'Ali Valiyev', email: 'ali@example.com' }}
                onLogout={handleLogout}
              />
            </div>

            {/* Tablar (mushrik bo'lsa) */}
            {isAuthenticated && (
              <nav className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'chat'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🤖</span>
                    <span className="hidden sm:inline">AI Yordamchi</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'admin'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📍</span>
                    <span className="hidden sm:inline">Admin Panel</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'calculator'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📏</span>
                    <span className="hidden sm:inline">Masofa</span>
                  </span>
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {!isAuthenticated ? (
          // Auth forms
          <div className="flex items-center justify-center py-12">
            {showRegister ? (
              <RegisterForm
                onRegister={handleRegister}
                onBackToLogin={() => setShowRegister(false)}
              />
            ) : (
              <LoginForm onLogin={handleLogin} onRegisterClick={() => setShowRegister(true)} />
            )}
          </div>
        ) : (
          // Protected content (show only if authenticated)
          <div className="space-y-6">
            {/* User Profile Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="max-w-6xl mx-auto flex justify-end">
                <UserProfile
                  user={{ name: 'Ali Valiyev', email: 'ali@example.com' }}
                  onLogout={handleLogout}
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'chat'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">🤖</span>
                  <span className="hidden sm:inline">AI Yordamchi</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'admin'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">📍</span>
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'calculator'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">📏</span>
                  <span className="hidden sm:inline">Masofa</span>
                </button>
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'chat' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-amber-50">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🤖 AI Sayohat Yordamchisi
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Sayohat rejalashingizga yordam bo\'ladi!
                  </p>
                </div>
                <div style={{ height: 'calc(70vh - 120px)' }} className="p-6">
                  <ChatBot />
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    📍 Admin Panel
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Yangi lokatsiyalar qo\'shish va baza boshqarish
                  </p>
                </div>
                <div className="p-6">
                  <AddLocationForm onSubmit={handleLocationSubmit} />
                </div>
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    📏 Masofa Kalkulyatori
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
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
    </div>
  )
}

export default App
