import React, { useState } from 'react'
import { ChatBot } from './components/chatbot/ChatBot'
import { AddLocationForm } from './components/admin/AddLocationForm'
import { DistanceCalculator } from './components/admin/DistanceCalculator'
import type { LocationFormData } from './types'

type Tab = 'chat' | 'admin' | 'calculator'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  const handleLocationSubmit = (data: LocationFormData) => {
    console.log('Yangi lokatsiya qo\'shildi:', data)
    // Kelajakda: backendga yuborish
  }

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

            {/* Tablar */}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto" style={{ height: 'calc(100vh - 120px)' }}>
            <ChatBot />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-3xl mx-auto">
            <AddLocationForm onSubmit={handleLocationSubmit} />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-3xl mx-auto">
            <DistanceCalculator />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
