import React, { useState } from 'react'
import { useAppStore } from '../../hooks/useAppStore'
import type { MissionType } from '../../types'

const MISSIONS_TYPE_LABELS: Record<MissionType, { label: string; icon: string }> = {
  daily: { label: 'Kunlik', icon: '📅' },
  weekly: { label: 'Haftalik', icon: '📆' },
  achievement: { label: 'Yutuqlar', icon: '🏆' },
}

const MISSIONS_TYPE_COLORS: Record<MissionType, string> = {
  daily: 'from-blue-400 to-blue-600',
  weekly: 'from-purple-400 to-purple-600',
  achievement: 'from-amber-400 to-amber-600',
}

const DIFFICULTY_BADGES: Record<string, { label: string; color: string }> = {
  easy: { label: 'Oson', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  medium: { label: "O'rtacha", color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  hard: { label: 'Qiyin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

const Missions: React.FC = () => {
  const { missions, claimMissionReward, user } = useAppStore()
  const [selectedType, setSelectedType] = useState<MissionType | 'all'>('all')
  const [claimedMessage, setClaimedMessage] = useState<string | null>(null)

  const types: (MissionType | 'all')[] = ['all', 'daily', 'weekly', 'achievement']

  // Sort missions: available first, then in_progress, then completed, then claimed
  const sortMissions = (a: typeof missions[0], b: typeof missions[0]) => {
    const order = { available: 0, in_progress: 1, completed: 2, claimed: 3 }
    return order[a.status] - order[b.status]
  }

  const filteredMissions = missions
    .filter(m => selectedType === 'all' || m.type === selectedType)
    .sort(sortMissions)

  const handleClaim = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId)
    if (mission) {
      claimMissionReward(missionId)
      setClaimedMessage(`"${mission.title}" bajarildi! +${mission.reward.coins} 🪙 +${mission.reward.experience} ⭐`)
      setTimeout(() => setClaimedMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🎯 Missiyalar</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Vazifalarni bajarib, tanga va tajriba to'plang</p>
      </div>

      {/* Mukofot xabari */}
      {claimedMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium animate-fade-in">
          {claimedMessage}
        </div>
      )}

      {/* Filtr */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {types.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedType === type
                ? 'bg-emerald-600 text-white shadow-md scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {type === 'all' ? '📋 Barchasi' : `${MISSIONS_TYPE_LABELS[type].icon} ${MISSIONS_TYPE_LABELS[type].label}`}
          </button>
        ))}
      </div>

      {/* Missiyalar */}
      <div className="space-y-3">
        {filteredMissions.map(mission => (
          <div
            key={mission.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border transition-all duration-300 ${
              mission.status === 'completed'
                ? 'border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-100 dark:ring-emerald-900'
                : mission.status === 'claimed'
                ? 'border-gray-200 dark:border-gray-700 opacity-60'
                : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${MISSIONS_TYPE_COLORS[mission.type]} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <span className="text-2xl">{mission.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-800 dark:text-white">{mission.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_BADGES[mission.difficulty].color}`}>
                    {DIFFICULTY_BADGES[mission.difficulty].label}
                  </span>
                  {mission.status === 'completed' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium">
                      ✅ Bajarildi
                    </span>
                  )}
                  {mission.status === 'claimed' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-medium">
                      📦 Olindi
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{mission.description}</p>

                {/* Progress bar */}
                {mission.status !== 'claimed' && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{mission.requirements.current} / {mission.requirements.target}</span>
                      <span>{mission.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          mission.progress >= 100
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Reward */}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1">🪙 {mission.reward.coins}</span>
                  <span className="flex items-center gap-1">⭐ {mission.reward.experience} XP</span>
                  {mission.reward.item && (
                    <span className="flex items-center gap-1">🎁 {mission.reward.item}</span>
                  )}
                </div>
              </div>

              {/* Claim button */}
              {mission.status === 'completed' && (
                <button
                  onClick={() => handleClaim(mission.id)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-md hover:shadow-lg flex-shrink-0"
                >
                  📥 Olish
                </button>
              )}
              {mission.status === 'in_progress' && (
                <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium flex-shrink-0">
                  ⏳ Bajarilmoqda
                </span>
              )}
              {mission.status === 'claimed' && (
                <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-xl text-sm font-medium flex-shrink-0">
                  ✅
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredMissions.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <span className="text-4xl block mb-3">📭</span>
            <p>Bu turdagi missiyalar hozircha mavjud emas</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Missions
