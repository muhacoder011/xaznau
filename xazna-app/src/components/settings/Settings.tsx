import React from 'react'
import { useTheme, THEME_COLORS } from '../../hooks/useTheme'
import { useAppStore } from '../../hooks/useAppStore'

const Settings: React.FC = () => {
  const { isDark, themeColor, toggleDarkMode, setThemeColor, setDarkMode } = useTheme()
  const { user } = useAppStore()

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-sliders"></i> Sozlamalar
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ilova tashqi ko'rinishini sozlang</p>
        </div>
      </div>

      {/* Tashqi ko'rinish */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-palette"></i> Tashqi ko'rinish
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Yorug'lik / Qorong'i rejim */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                {isDark ? <i className="fa-solid fa-moon text-gray-600 dark:text-amber-400"></i> : <i className="fa-solid fa-sun text-amber-500"></i>}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Qorong'i rejim</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Interfeys ranglarini o'zgartirish</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                isDark ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center text-xs ${
                  isDark ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {isDark ? <i className="fa-solid fa-moon text-primary-600 text-xs"></i> : <i className="fa-solid fa-sun text-amber-500 text-xs"></i>}
              </span>
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Rang mavzusi */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                <i className="fa-solid fa-droplet text-rose-500"></i>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Rang mavzusi</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Asosiy rangni tanlang</p>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {THEME_COLORS.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setThemeColor(theme.name)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    themeColor === theme.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md scale-105'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex gap-0.5">
                    {[400, 500, 600].map(shade => (
                      <div
                        key={shade}
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: theme.colors[shade as keyof typeof theme.colors] }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Tezkor rejim tugmalari */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                <i className="fa-solid fa-bolt text-green-500"></i>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Tezkor sozlash</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Bir tugma bilan rejimni o'zgartirish</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setDarkMode(true); setThemeColor('blue') }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  isDark && themeColor === 'blue'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <i className="fa-solid fa-moon"></i> Qorong'i (ko'k)
              </button>
              <button
                onClick={() => { setDarkMode(true); setThemeColor('violet') }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  isDark && themeColor === 'violet'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <i className="fa-solid fa-moon"></i> Qorong'i (binafsha)
              </button>
              <button
                onClick={() => { setDarkMode(true); setThemeColor('emerald') }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  isDark && themeColor === 'emerald'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <i className="fa-solid fa-moon"></i> Qorong'i (yashil)
              </button>
              <button
                onClick={() => { setDarkMode(false); setThemeColor('blue') }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  !isDark && themeColor === 'blue'
                    ? 'bg-amber-400 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <i className="fa-solid fa-sun"></i> Yorug' (ko'k)
              </button>
              <button
                onClick={() => { setDarkMode(false); setThemeColor('rose') }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  !isDark && themeColor === 'rose'
                    ? 'bg-amber-400 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <i className="fa-solid fa-sun"></i> Yorug' (pushti)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hisob ma'lumotlari */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-amber-50 dark:from-gray-800 dark:to-amber-900/20">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-circle-info"></i> Hisob
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Foydalanuvchi</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Email</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Daraja</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">Lv.{user.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Tangalar</span>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{user.coins} <i className="fa-solid fa-coins"></i></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Ilova versiyasi</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Ma'lumot */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-800/30 text-center">
        <p className="text-sm text-primary-700 dark:text-primary-300">
          <i className="fa-solid fa-heart text-red-500"></i> Xazina — Sayohat rejalash uchun aqlli yordamchi
        </p>
        <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">
          Barcha sozlamalar brauzeringizda saqlanadi
        </p>
      </div>
    </div>
  )
}

export default Settings
