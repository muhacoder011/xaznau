import React, { useState } from 'react'
import { useAppStore } from '../../hooks/useAppStore'
import { getExperienceForLevel } from '../../data/userData'

const ProfilePage: React.FC = () => {
  const { user, updateUser, inventory, missions } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editEmail, setEditEmail] = useState(user.email)
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'settings'>('profile')

  const completedMissions = missions.filter(m => m.status === 'completed' || m.status === 'claimed').length
  const totalMissions = missions.length
  const progressPercent = Math.round((user.experience / getExperienceForLevel(user.level)) * 100)

  const handleSaveProfile = () => {
    updateUser({
      name: editName,
      email: editEmail,
      avatar: editName.charAt(0).toUpperCase(),
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white"><i className="fa-solid fa-user"></i> Profil</h2>

      {/* Tablar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: 'profile', label: 'Profil', icon: '<i className="fa-solid fa-user"></i>' },
          { key: 'stats', label: 'Statistika', icon: '<i className="fa-solid fa-chart-simple"></i>' },
          { key: 'settings', label: 'Sozlamalar', icon: '<i className="fa-solid fa-gear"></i>' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Profil tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-4xl text-white font-bold shadow-lg mb-4">
              {user.avatar}
            </div>

            {isEditing ? (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center text-lg font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Ismingiz"
                />
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Email"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setEditName(user.name); setEditEmail(user.email) }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all active:scale-95 shadow-md"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>

                {/* Daraja va XP */}
                <div className="w-full mt-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <i className="fa-solid fa-star"></i> Daraja {user.level}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {user.experience} / {getExperienceForLevel(user.level)} XP
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tanga balansi */}
                <div className="mt-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-5 py-3 rounded-2xl">
                  <span className="text-2xl"><i className="fa-solid fa-coins"></i></span>
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">{user.coins}</span>
                  <span className="text-sm text-amber-600 dark:text-amber-400">tanga</span>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-all active:scale-95"
                >
                  <i className="fa-solid fa-pencil"></i> Profilni tahrirlash
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Statistika tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Rejalashtirilgan sayohatlar', value: user.tripsPlanned, icon: '<i className="fa-solid fa-map"></i>', color: 'from-blue-400 to-blue-600' },
            { label: "Tashrif buyurilgan joylar", value: user.destinationsVisited, icon: '<i className="fa-solid fa-location-dot"></i>', color: 'from-emerald-400 to-emerald-600' },
            { label: 'Bajarilgan missiyalar', value: completedMissions, icon: '<i className="fa-solid fa-trophy"></i>', color: 'from-amber-400 to-amber-600' },
            { label: 'Jami missiyalar', value: totalMissions, icon: '<i className="fa-solid fa-clipboard"></i>', color: 'from-purple-400 to-purple-600' },
            { label: 'Inventar buyumlari', value: inventory.length, icon: '<i className="fa-solid fa-backpack"></i>', color: 'from-pink-400 to-pink-600' },
            { label: 'Daraja', value: user.level, icon: '<i className="fa-solid fa-star"></i>', color: 'from-yellow-400 to-yellow-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg shadow-sm mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sozlamalar tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg"><i className="fa-solid fa-gear"></i> Sozlamalar</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Til</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">O'zbek tili</p>
              </div>
              <span className="text-gray-400">🇺🇿</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Xabarnomalar</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Missiya va yangiliklar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Qorong'i rejim</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tun uchun qulay rejim</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
