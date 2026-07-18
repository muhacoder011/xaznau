import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { MapPicker } from './MapPicker'
import { haversineDistance, formatDistance } from '../../utils/haversine'
import type { LocationFormData, LocationCategory, AppUser } from '../../types'

// ============================================
// Admin Panel — To'liq boshqaruv paneli
// Professional, qulay va zamonaviy interfeys
// ============================================

// --- Constants ---
const CATEGORY_OPTIONS = [
  { value: 'masjid', label: 'Masjid' },
  { value: 'museum', label: 'Muzey' },
  { value: 'park', label: 'Park' },
  { value: 'restaurant', label: 'Oshxona' },
  { value: 'historical', label: 'Tarixiy' },
]

const CITY_OPTIONS = [
  { value: 'Toshkent', label: 'Toshkent' },
  { value: 'Namangan', label: 'Namangan' },
  { value: 'Samarqand', label: 'Samarqand' },
  { value: 'Buxoro', label: 'Buxoro' },
  { value: 'Xiva', label: 'Xiva' },
  { value: "Farg'ona", label: "Farg'ona" },
  { value: 'Andijon', label: 'Andijon' },
  { value: 'Nukus', label: 'Nukus' },
]

interface StoredLocation extends LocationFormData {
  id: string
  createdAt: string
}

type AdminSection = 'dashboard' | 'locations' | 'users' | 'analytics' | 'settings'

// ============================================
// Utility functions
// ============================================
function loadLocations(): StoredLocation[] {
  try {
    const data = localStorage.getItem('admin_locations')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveLocations(locations: StoredLocation[]) {
  localStorage.setItem('admin_locations', JSON.stringify(locations))
}

function loadUsers(): any[] {
  try {
    return JSON.parse(localStorage.getItem('xazna_users') || '[]')
  } catch { return [] }
}

function loadStoreData(): any {
  try {
    return JSON.parse(localStorage.getItem('xazina_store') || '{}')
  } catch { return {} }
}

// ============================================
// Main AdminPanel Component
// ============================================
export const AdminPanel: React.FC = () => {
  // --- Auth state ---
  const [isAdminAuth, setIsAdminAuth] = useState(false)
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [adminLogin, setAdminLogin] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [adminError, setAdminError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // --- Section ---
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')

  // --- Toast ---
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // --- Load auth on mount ---
  useEffect(() => {
    const saved = localStorage.getItem('admin_auth')
    if (saved === 'true') {
      setIsAdminAuth(true)
    } else {
      const hash = localStorage.getItem('xazna_admin_hash')
      setIsSetupMode(!hash)
    }
  }, [])

  // ========== AUTH HANDLERS ==========
  const handleAdminSetup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminLogin || !adminPassword) {
      setAdminError('Login va parolni kiriting!')
      return
    }
    if (adminPassword !== adminPasswordConfirm) {
      setAdminError('Parollar bir-biriga mos kelmadi!')
      return
    }
    if (adminPassword.length < 4) {
      setAdminError('Parol kamida 4 belgidan iborat bo\'lishi kerak!')
      return
    }
    localStorage.setItem('xazna_admin_hash', btoa(adminLogin + ':' + adminPassword))
    setIsAdminAuth(true)
    localStorage.setItem('admin_auth', 'true')
    setAdminError('')
    showToast('success', 'Admin panel sozlandi!')
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminLogin || !adminPassword) {
      setAdminError('Login va parolni kiriting!')
      return
    }
    setIsLoggingIn(true)
    setAdminError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: adminLogin, password: adminPassword })
      })
      if (!response.ok) throw new Error('API xatosi')
      const data = await response.json()
      if (data.success) {
        setIsAdminAuth(true)
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_token', data.token || '')
        setIsLoggingIn(false)
        showToast('success', 'Xush kelibsiz, Admin!')
        return
      } else {
        throw new Error(data.message || 'Login yoki parol notog\'ri!')
      }
    } catch {
      const storedHash = localStorage.getItem('xazna_admin_hash')
      if (storedHash && btoa(adminLogin + ':' + adminPassword) === storedHash) {
        setIsAdminAuth(true)
        setAdminError('')
        localStorage.setItem('admin_auth', 'true')
        showToast('success', 'Xush kelibsiz, Admin!')
      } else {
        setAdminError('Login yoki parol xato. Serverga ulanish ham muvaffaqiyatsiz.')
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleAdminLogout = () => {
    setIsAdminAuth(false)
    setIsSetupMode(false)
    setAdminLogin('')
    setAdminPassword('')
    setAdminPasswordConfirm('')
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_token')
    const hash = localStorage.getItem('xazna_admin_hash')
    setIsSetupMode(!hash)
    showToast('info', 'Admin panelidan chiqildi')
  }

  // ========== RENDER AUTH ==========
  if (!isAdminAuth) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-white text-4xl shadow-lg mx-auto mb-5 ring-4 ring-gray-100 dark:ring-gray-700">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              {isSetupMode ? 'Admin panelni sozlash' : 'Davom etish uchun tizimga kiring'}
            </p>
          </div>

          <form
            onSubmit={isSetupMode ? handleAdminSetup : handleAdminLogin}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 space-y-5"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin login</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  value={adminLogin}
                  onChange={(e) => setAdminLogin(e.target.value)}
                  placeholder="Loginni kiriting"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parol</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-key"></i>
                </span>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {isSetupMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parolni takrorlang</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fa-solid fa-key"></i>
                  </span>
                  <input
                    type="password"
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    placeholder="Parolni takrorlang"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {adminError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{adminError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !adminLogin || !adminPassword}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl font-medium text-sm transition-all disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Tekshirilmoqda...
                </span>
              ) : isSetupMode ? 'Admin panelni sozlash' : 'Kirish'}
            </button>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              {isSetupMode
                ? 'Admin login va parolingizni yarating. Ma\'lumotlar brauzeringizda saqlanadi.'
                : 'Backend API yoki mahalliy autentifikatsiya orqali kiring.'}
            </p>
          </form>
        </div>
      </div>
    )
  }

  // ========== AUTHENTICATED ==========
  return (
    <div className="flex gap-0 min-h-[80vh] relative">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-down max-w-sm ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          'bg-gray-800 text-white'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <i className="fa-solid fa-check-circle"></i>}
            {toast.type === 'error' && <i className="fa-solid fa-circle-exclamation"></i>}
            {toast.type === 'info' && <i className="fa-solid fa-info-circle"></i>}
            {toast.message}
          </div>
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`flex-shrink-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-16' : 'w-56'
      }`}>
        <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-20 overflow-hidden">
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                A
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Admin</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2 space-y-0.5">
            {[
              { id: 'dashboard' as AdminSection, icon: 'fa-gauge-high', label: 'Dashboard' },
              { id: 'locations' as AdminSection, icon: 'fa-location-dot', label: 'Joylar' },
              { id: 'users' as AdminSection, icon: 'fa-users', label: 'Foydalanuvchilar' },
              { id: 'analytics' as AdminSection, icon: 'fa-chart-line', label: 'Analitika' },
              { id: 'settings' as AdminSection, icon: 'fa-gear', label: 'Sozlamalar' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-gray-900 dark:bg-gray-700 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                <span className="text-base flex-shrink-0 w-5 text-center">
                  <i className={`fa-solid ${item.icon}`}></i>
                </span>
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-2 border-t border-gray-100 dark:border-gray-700 mt-1">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
              title={isSidebarCollapsed ? 'Kengaytirish' : 'Yig\'ish'}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">
                <i className={`fa-solid ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
              </span>
              {!isSidebarCollapsed && <span>Yig'ish</span>}
            </button>
            <button
              onClick={handleAdminLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-0.5"
              title="Chiqish"
            >
              <span className="text-base flex-shrink-0 w-5 text-center">
                <i className="fa-solid fa-right-from-bracket"></i>
              </span>
              {!isSidebarCollapsed && <span>Chiqish</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-w-0">
        {activeSection === 'dashboard' && (
          <DashboardSection onNavigate={setActiveSection} showToast={showToast} />
        )}
        {activeSection === 'locations' && (
          <LocationsSection showToast={showToast} />
        )}
        {activeSection === 'users' && (
          <UsersSection />
        )}
        {activeSection === 'analytics' && (
          <AnalyticsSection />
        )}
        {activeSection === 'settings' && (
          <SettingsSection showToast={showToast} />
        )}
      </div>
    </div>
  )
}

// ============================================
// DASHBOARD SECTION
// ============================================
const DashboardSection: React.FC<{
  onNavigate: (section: AdminSection) => void
  showToast: (type: 'success' | 'error' | 'info', message: string) => void
}> = ({ onNavigate, showToast }) => {
  const locations = loadLocations()
  const users = loadUsers()
  const store = loadStoreData()
  const storeUser: AppUser | null = store.user || null

  const totalLocations = locations.length
  const totalUsers = users.length
  const totalCities = new Set(locations.map(l => l.city)).size
  const totalDuration = locations.reduce((sum, l) => sum + l.averageTimeMinutes, 0)
  const totalCoins = storeUser?.coins ?? 0
  const totalTrips = storeUser?.tripsPlanned ?? 0
  const adminLoginName = localStorage.getItem('xazna_admin_hash')
    ? atob(localStorage.getItem('xazna_admin_hash')!).split(':')[0]
    : 'Admin'

  const recentLocations = [...locations].reverse().slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Xush kelibsiz, {adminLoginName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Admin panelga umumiy ko'rinish
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <i className="fa-solid fa-calendar-days"></i>
          <span>{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <span className="text-xs text-gray-400">Jami</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLocations}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Joylar soni</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <i className="fa-solid fa-users"></i>
            </div>
            <span className="text-xs text-gray-400">Foydalanuvchi</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ro'yxatdan o'tganlar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <i className="fa-solid fa-city"></i>
            </div>
            <span className="text-xs text-gray-400">Shahar</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCities}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Qamrab olingan</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <i className="fa-solid fa-coins"></i>
            </div>
            <span className="text-xs text-gray-400">Tizimda</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCoins}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tangalar</p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left"></i>
            So'nggi qo'shilgan joylar
          </h3>
          {recentLocations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Hozircha joylar mavjud emas</p>
          ) : (
            <div className="space-y-2">
              {recentLocations.map(loc => (
                <div key={loc.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-300 flex-shrink-0">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{loc.name}</p>
                      <p className="text-xs text-gray-400 truncate">{loc.city} · {loc.category}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {new Date(loc.createdAt).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              ))}
            </div>
          )}
          {locations.length > 0 && (
            <button
              onClick={() => onNavigate('locations')}
              className="mt-3 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
            >
              Barcha joylarni ko'rish <i className="fa-solid fa-arrow-right"></i>
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-bolt"></i>
            Tezkor amallar
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('locations')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-plus"></i>
              </span>
              Yangi joy qo'shish
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(loadLocations(), null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = 'xazna-locations.json'; a.click()
                URL.revokeObjectURL(url)
                showToast('success', 'Ma\'lumotlar eksport qilindi!')
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-download"></i>
              </span>
              Ma'lumotlarni eksport qilish
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-chart-bar"></i>
              </span>
              Statistika va hisobotlar
            </button>
          </div>

          {/* System info */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Versiya</span>
              <span className="font-mono font-medium text-gray-600 dark:text-gray-300">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
              <span>Ma'lumotlar</span>
              <span className="font-medium text-gray-600 dark:text-gray-300">{locations.length} ta joy, {totalUsers} ta foydalanuvchi</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
              <span>Sayohatlar</span>
              <span className="font-medium text-gray-600 dark:text-gray-300">{totalTrips} ta</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// LOCATIONS SECTION (CRUD)
// ============================================
const LocationsSection: React.FC<{
  showToast: (type: 'success' | 'error' | 'info', message: string) => void
}> = ({ showToast }) => {
  const [locations, setLocations] = useState<StoredLocation[]>([])
  const [formData, setFormData] = useState<LocationFormData>({
    name: '', description: '', category: 'historical',
    averageTimeMinutes: 30, latitude: null, longitude: null, city: 'Toshkent',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof LocationFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterCity, setFilterCity] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'add' | 'list'>('list')

  useEffect(() => { setLocations(loadLocations()) }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'averageTimeMinutes' ? Number(value) : value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }, [])

  const handleCoordinateChange = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
    setErrors(prev => ({ ...prev, latitude: undefined, longitude: undefined }))
  }, [])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LocationFormData, string>> = {}
    if (!formData.name.trim()) newErrors.name = 'Joy nomi majburiy'
    if (!formData.description.trim()) newErrors.description = 'Ta\'rif majburiy'
    if (!formData.city) newErrors.city = 'Shaharni tanlang'
    if (formData.averageTimeMinutes < 1) newErrors.averageTimeMinutes = 'Vaqt 1 daqiqadan kam bo\'lmasligi kerak'
    if (formData.latitude === null || formData.longitude === null) newErrors.latitude = 'Xaritada joyni belgilang'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 400))

    try {
      const allLocations = loadLocations()
      const now = new Date().toISOString()

      if (editingId) {
        const idx = allLocations.findIndex(l => l.id === editingId)
        if (idx >= 0) {
          allLocations[idx] = { ...formData, id: editingId, createdAt: allLocations[idx].createdAt } as StoredLocation
          showToast('success', '"' + formData.name + '" muvaffaqiyatli yangilandi!')
        }
      } else {
        allLocations.push({ ...formData, id: crypto.randomUUID(), createdAt: now } as StoredLocation)
        showToast('success', '"' + formData.name + '" muvaffaqiyatli qo\'shildi!')
      }

      saveLocations(allLocations)
      setLocations(allLocations)
      resetForm()
    } catch {
      showToast('error', 'Xatolik yuz berdi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', category: 'historical', averageTimeMinutes: 30, latitude: null, longitude: null, city: 'Toshkent' })
    setEditingId(null)
    setErrors({})
  }

  const handleEdit = (loc: StoredLocation) => {
    setFormData({
      name: loc.name, description: loc.description, category: loc.category,
      averageTimeMinutes: loc.averageTimeMinutes, latitude: loc.latitude,
      longitude: loc.longitude, city: loc.city,
    })
    setEditingId(loc.id)
    setViewMode('add')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Bu joyni o\'chirishni xohlaysizmi?')) return
    const allLocations = loadLocations().filter(l => l.id !== id)
    saveLocations(allLocations)
    setLocations(allLocations)
    showToast('info', 'Joy o\'chirildi')
  }

  const filteredLocations = useMemo(() =>
    locations.filter(l => {
      if (filterCity !== 'all' && l.city !== filterCity) return false
      if (filterCategory !== 'all' && l.category !== filterCategory) return false
      if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !l.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    }),
    [locations, filterCity, filterCategory, searchQuery]
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-location-dot text-gray-500"></i>
            Joylarni boshqarish
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {locations.length} ta joy, {new Set(locations.map(l => l.city)).size} ta shahar
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setViewMode(viewMode === 'add' ? 'list' : 'add') }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === 'add'
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800'
          }`}
        >
          {viewMode === 'add' ? (
            <><i className="fa-solid fa-list"></i> Joylar ro'yxati</>
          ) : (
            <><i className="fa-solid fa-plus"></i> Yangi joy</>
          )}
        </button>
      </div>

      {/* Form */}
      {viewMode === 'add' && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {editingId ? 'Joyni tahrirlash' : 'Yangi joy qo\'shish'}
            </h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-red-500 hover:text-red-600 font-medium">
                Bekor qilish
              </button>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Joy nomi" name="name" value={formData.name} onChange={handleInputChange}
                placeholder="Masalan: Minor masjidi" error={errors.name} />
              <Select label="Kategoriya" name="category" value={formData.category}
                onChange={handleInputChange} options={CATEGORY_OPTIONS} />
              <Select label="Shahar" name="city" value={formData.city}
                onChange={handleInputChange} options={CITY_OPTIONS} error={errors.city} />
              <Input label="O'rtacha vaqt (daqiqa)" name="averageTimeMinutes" type="number"
                min={1} max={480} value={formData.averageTimeMinutes} onChange={handleInputChange}
                error={errors.averageTimeMinutes} />
            </div>
            <TextArea label="Ta'rif" name="description" value={formData.description}
              onChange={handleInputChange} placeholder="Joy haqida qisqacha ma'lumot..."
              error={errors.description} />

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <i className="fa-solid fa-map"></i> Xaritada joylashuv
              </h4>
              <MapPicker latitude={formData.latitude} longitude={formData.longitude}
                onCoordinateChange={handleCoordinateChange} />
              {errors.latitude && <p className="text-xs text-red-500 mt-1.5">{errors.latitude}</p>}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Qo\'shish'}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Bekor qilish
                </Button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                <i className="fa-solid fa-search"></i>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Qidirish..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
              />
            </div>
            <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-gray-400">
              <option value="all">Barcha shaharlar</option>
              {CITY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-gray-400">
              <option value="all">Barcha kategoriyalar</option>
              {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <span className="text-sm text-gray-400 flex items-center px-2 whitespace-nowrap">
              {filteredLocations.length} / {locations.length}
            </span>
          </div>

          {/* Locations grid */}
          {filteredLocations.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-4xl block mb-3"><i className="fa-solid fa-inbox"></i></span>
              <p className="font-medium text-gray-500 dark:text-gray-400">Joylar topilmadi</p>
              <p className="text-sm mt-1">Yangi joy qo'shish uchun "Qo'shish" bo'limiga o'ting</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredLocations.map(loc => (
                <div key={loc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{loc.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">{loc.city}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                          {CATEGORY_OPTIONS.find(c => c.value === loc.category)?.label || loc.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{loc.description}</p>
                      <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-400">
                        <span><i className="fa-solid fa-clock"></i> {loc.averageTimeMinutes} daq</span>
                        <span><i className="fa-solid fa-location-dot"></i> {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</span>
                        <span><i className="fa-solid fa-calendar-days"></i> {new Date(loc.createdAt).toLocaleDateString('uz-UZ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => handleEdit(loc)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Tahrirlash">
                        <i className="fa-solid fa-pencil"></i>
                      </button>
                      <button onClick={() => handleDelete(loc.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                        title="O'chirish">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// USERS SECTION
// ============================================
const UsersSection: React.FC = () => {
  const users = loadUsers()
  const store = loadStoreData()
  const storeUser: AppUser | null = store.user || null
  const [expandedUser, setExpandedUser] = useState<number | null>(null)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="fa-solid fa-users text-gray-500"></i>
          Foydalanuvchilar
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {users.length} ta ro'yxatdan o'tgan foydalanuvchi
        </p>
      </div>

      {/* Current user card */}
      {storeUser && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-gray-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {storeUser.avatar || storeUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white">{storeUser.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{storeUser.email}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">Lv.{storeUser.level}</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">{storeUser.coins} <i className="fa-solid fa-coins"></i></span>
              <span className="text-gray-500">{storeUser.tripsPlanned} ta sayohat</span>
            </div>
          </div>
          {/* XP bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{storeUser.experience} / {storeUser.experienceToNextLevel} XP</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 dark:bg-gray-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((storeUser.experience / storeUser.experienceToNextLevel) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Registered users list */}
      {users.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-4xl block mb-3"><i className="fa-solid fa-users-slash"></i></span>
          <p className="font-medium text-gray-500 dark:text-gray-400">Foydalanuvchilar mavjud emas</p>
          <p className="text-sm mt-1">Ro'yxatdan o'tgan foydalanuvchilar bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Foydalanuvchi</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Ro'yxatdan o'tgan</th>
                  <th className="text-right px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user: any, idx: number) => (
                  <React.Fragment key={idx}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{user.name || 'Nomsiz'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{new Date().toLocaleDateString('uz-UZ')}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setExpandedUser(expandedUser === idx ? null : idx)}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {expandedUser === idx ? 'Yopish' : 'Batafsil'}
                        </button>
                      </td>
                    </tr>
                    {expandedUser === idx && (
                      <tr className="bg-gray-50 dark:bg-gray-700/20">
                        <td colSpan={4} className="px-5 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p><span className="text-gray-400 font-medium">Parol (hash):</span> {user.password ? '••••••' : '—'}</p>
                            <p><span className="text-gray-400 font-medium">ID:</span> {user.email?.split('@')[0] || '—'}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// ANALYTICS SECTION
// ============================================
const AnalyticsSection: React.FC = () => {
  const locations = loadLocations()
  const users = loadUsers()
  const store = loadStoreData()
  const storeUser: AppUser | null = store.user || null

  const totalLocations = locations.length
  const totalUsers = users.length
  const totalCities = new Set(locations.map(l => l.city)).size
  const totalDuration = locations.reduce((sum, l) => sum + l.averageTimeMinutes, 0)

  const categoryCounts = locations.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const cityCounts = locations.reduce((acc, l) => {
    acc[l.city] = (acc[l.city] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1)
  const maxCityCount = Math.max(...Object.values(cityCounts), 1)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-gray-500"></i>
          Analitika
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Ma'lumotlar tahlili va statistika
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLocations}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Jami joylar</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCities}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Shaharlar</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Foydalanuvchilar</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDuration}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Jami daqiqa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie"></i>
            Kategoriyalar bo'yicha
          </h3>
          {sortedCategories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Ma'lumot mavjud emas</p>
          ) : (
            <div className="space-y-3.5">
              {sortedCategories.map(([cat, count]) => {
                const label = CATEGORY_OPTIONS.find(c => c.value === cat)?.label || cat
                const percent = Math.round((count / totalLocations) * 100)
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600 dark:text-gray-300">{label}</span>
                      <span className="text-gray-500 font-medium">{count} ta ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 dark:bg-gray-500 rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* City chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-city"></i>
            Shaharlar bo'yicha
          </h3>
          {sortedCities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Ma'lumot mavjud emas</p>
          ) : (
            <div className="space-y-3.5">
              {sortedCities.map(([city, count]) => (
                <div key={city}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-300">{city}</span>
                    <span className="text-gray-500 font-medium">{count} ta</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 dark:bg-gray-500 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxCityCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User stats */}
      {storeUser && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-user"></i>
            Foydalanuvchi statistikasi
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{storeUser.level}</p>
              <p className="text-xs text-gray-500 mt-0.5">Daraja</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{storeUser.experience}</p>
              <p className="text-xs text-gray-500 mt-0.5">Tajriba (XP)</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{storeUser.coins}</p>
              <p className="text-xs text-gray-500 mt-0.5">Tangalar</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{storeUser.tripsPlanned}</p>
              <p className="text-xs text-gray-500 mt-0.5">Sayohatlar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// SETTINGS SECTION
// ============================================
const SettingsSection: React.FC<{
  showToast: (type: 'success' | 'error' | 'info', message: string) => void
}> = ({ showToast }) => {
  const [importData, setImportData] = useState<string>('')
  const [showImport, setShowImport] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleExportAll = () => {
    const data = {
      locations: loadLocations(),
      users: loadUsers(),
      store: loadStoreData(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xazna-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', 'Ma\'lumotlar muvaffaqiyatli eksport qilindi!')
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importData)
      if (data.locations) {
        saveLocations(data.locations)
        showToast('success', `${data.locations.length} ta joy import qilindi!`)
      }
      if (data.users) {
        localStorage.setItem('xazna_users', JSON.stringify(data.users))
      }
      if (data.store) {
        localStorage.setItem('xazina_store', JSON.stringify(data.store))
      }
      setImportData('')
      setShowImport(false)
    } catch {
      showToast('error', 'Noto\'g\'ri JSON format! Ma\'lumotlarni tekshiring.')
    }
  }

  const handleResetAll = () => {
    localStorage.removeItem('admin_locations')
    localStorage.removeItem('xazna_users')
    localStorage.removeItem('xazina_store')
    localStorage.removeItem('xazna_admin_hash')
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_token')
    showToast('info', 'Barcha ma\'lumotlar o\'chirildi. Sahifani qayta yuklang.')
    setTimeout(() => window.location.reload(), 1500)
  }

  const handleExportLocations = () => {
    const blob = new Blob([JSON.stringify(loadLocations(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'xazna-locations.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('success', 'Joylar ma\'lumotlari eksport qilindi!')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="fa-solid fa-gear text-gray-500"></i>
          Sozlamalar
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Ma'lumotlarni boshqarish va tizim sozlamalari
        </p>
      </div>

      {/* Data management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i className="fa-solid fa-database"></i>
            Ma'lumotlar boshqaruvi
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={handleExportAll}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700 transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-gray-900 dark:bg-gray-600 flex items-center justify-center text-white flex-shrink-0">
                <i className="fa-solid fa-download"></i>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white text-sm">To'liq backup</p>
                <p className="text-xs text-gray-400 mt-0.5">Barcha ma'lumotlarni JSON formatida yuklab olish</p>
              </div>
            </button>
            <button onClick={handleExportLocations}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700 transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white text-sm">Joylar eksporti</p>
                <p className="text-xs text-gray-400 mt-0.5">Faqat joylar ma'lumotlarini eksport qilish</p>
              </div>
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <button onClick={() => setShowImport(!showImport)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors">
              <i className="fa-solid fa-upload"></i>
              Ma'lumotlarni import qilish
            </button>
            {showImport && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={importData}
                  onChange={e => setImportData(e.target.value)}
                  placeholder="JSON ma'lumotlarini joylashtiring..."
                  rows={6}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 text-sm font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={handleImport} variant="primary" disabled={!importData.trim()}>
                    Import qilish
                  </Button>
                  <Button onClick={() => { setImportData(''); setShowImport(false) }} variant="secondary">
                    Bekor qilish
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/40 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            Xavfli zona
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Bu amalni bajarish orqali barcha ma'lumotlar (joylar, foydalanuvchilar, tizim holati) qayta tiklanmas darajada o'chiriladi.
          </p>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all">
              <i className="fa-solid fa-trash-can"></i> Barcha ma'lumotlarni o'chirish
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Haqiqatan ham barcha ma'lumotlarni o'chirishni xohlaysizmi?
              </p>
              <div className="flex gap-2">
                <button onClick={handleResetAll}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all">
                  Ha, o'chirish
                </button>
                <button onClick={() => setConfirmReset(false)}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all">
                  Bekor qilish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
