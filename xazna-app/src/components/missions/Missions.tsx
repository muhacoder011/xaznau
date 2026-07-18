import React, { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '../../hooks/useAppStore'
import type { Mission, MissionType } from '../../types'

const MISSIONS_TYPE_LABELS: Record<MissionType, { label: string; icon: string }> = {
  daily: { label: 'Kunlik', icon: '<i class="fa-solid fa-calendar"></i>' },
  weekly: { label: 'Haftalik', icon: '<i class="fa-solid fa-calendar-check"></i>' },
  achievement: { label: 'Yutuqlar', icon: '<i class="fa-solid fa-trophy"></i>' },
}

const MISSIONS_TYPE_COLORS: Record<MissionType, string> = {
  daily: 'from-blue-400 to-blue-600',
  weekly: 'from-purple-400 to-purple-600',
  achievement: 'from-amber-400 to-amber-600',
}

const DIFFICULTY_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  easy: { label: 'Oson', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: '<i class="fa-solid fa-circle"></i>' },
  medium: { label: "O'rtacha", color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', icon: '<i class="fa-solid fa-circle"></i>' },
  hard: { label: 'Qiyin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: '<i class="fa-solid fa-circle"></i>' },
}

// Countdown timer hook
const useCountdown = (targetHour: number) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const target = new Date(now)
      target.setHours(targetHour, 0, 0, 0)
      if (now.getHours() >= targetHour) {
        target.setDate(target.getDate() + 1)
      }
      const diff = target.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${hours}h ${minutes}m ${secs}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetHour])

  return timeLeft
}

const MissionCard: React.FC<{
  mission: Mission
  onClaim: (id: string) => void
  onToggle: (id: string) => void
  isExpanded: boolean
}> = ({ mission, onClaim, onToggle, isExpanded }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${
        mission.status === 'completed'
          ? 'border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-100 dark:ring-emerald-900'
          : mission.status === 'claimed'
          ? 'border-gray-200 dark:border-gray-700 opacity-60'
          : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
      }`}
    >
      {/* Main content - always visible */}
      <div className="p-5 cursor-pointer" onClick={() => onToggle(mission.id)}>
        <div className="flex items-start gap-4">
          {/* Icon with pulse animation for completed */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${MISSIONS_TYPE_COLORS[mission.type]} flex items-center justify-center flex-shrink-0 shadow-md relative ${
            mission.status === 'completed' ? 'animate-pulse' : ''
          }`}>
            <span className="text-2xl" dangerouslySetInnerHTML={{ __html: mission.icon }} />
            {mission.status === 'completed' && (
              <span className="absolute -top-1 -right-1 text-sm"><i className="fa-solid fa-wand-magic-sparkles"></i></span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-800 dark:text-white">{mission.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_BADGES[mission.difficulty].color}`}>
                <span dangerouslySetInnerHTML={{ __html: DIFFICULTY_BADGES[mission.difficulty].icon }} /> {DIFFICULTY_BADGES[mission.difficulty].label}
              </span>
              {mission.status === 'completed' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium">
                  <i className="fa-solid fa-check"></i> Bajarildi
                </span>
              )}
              {mission.status === 'claimed' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-medium">
                  <i className="fa-solid fa-box"></i> Olindi
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{mission.description}</p>

            {/* Progress bar */}
            {mission.status !== 'claimed' && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="text-emerald-500"><i className="fa-solid fa-circle"></i></span>
                    {mission.requirements.current} / {mission.requirements.target}
                  </span>
                  <span className="font-medium">{mission.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      mission.progress >= 100
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        : 'bg-gradient-to-r from-amber-400 to-amber-600'
                    }`}
                    style={{ width: `${mission.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Reward preview */}
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                <i className="fa-solid fa-coins"></i> {mission.reward.coins}
              </span>
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                <i className="fa-solid fa-star"></i> {mission.reward.experience} XP
              </span>
              {mission.reward.item && (
                <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                  <i className="fa-solid fa-gift"></i> {mission.reward.item}
                </span>
              )}
            </div>
          </div>

          {/* Right side: status/action */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            {mission.status === 'completed' && (
              <button
                onClick={(e) => { e.stopPropagation(); onClaim(mission.id) }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-md hover:shadow-lg animate-bounce-in"
              >
                <i className="fa-solid fa-download"></i> Olish
              </button>
            )}
            {mission.status === 'in_progress' && (
              <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium">
                <i className="fa-solid fa-hourglass"></i> Bajarilmoqda
              </span>
            )}
            {mission.status === 'available' && (
              <span className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-xl text-sm font-medium">
                <i className="fa-solid fa-lock"></i> Mavjud
              </span>
            )}
            {mission.status === 'claimed' && (
              <span className="text-2xl"><i className="fa-solid fa-check"></i></span>
            )}
            {/* Expand indicator */}
            <span className={`text-gray-300 dark:text-gray-600 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <i className="fa-solid fa-chevron-down"></i>
            </span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 animate-slide-down">
          <div className="pt-4 space-y-3">
            {/* Mission details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Turi</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm mt-0.5">
                  <span dangerouslySetInnerHTML={{ __html: MISSIONS_TYPE_LABELS[mission.type].icon }} /> {MISSIONS_TYPE_LABELS[mission.type].label}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Qiyinlik</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm mt-0.5">
                  <span dangerouslySetInnerHTML={{ __html: DIFFICULTY_BADGES[mission.difficulty].icon }} /> {DIFFICULTY_BADGES[mission.difficulty].label}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Mukofot</p>
                <p className="font-semibold text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                  <i className="fa-solid fa-coins"></i> {mission.reward.coins}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Tajriba</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                  <i className="fa-solid fa-star"></i> {mission.reward.experience} XP
                </p>
              </div>
            </div>

            {/* Progress hint */}
            {mission.status !== 'claimed' && mission.progress < 100 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1"><i className="fa-solid fa-lightbulb"></i> Maslahat:</p>
                <p className="text-xs">
                  {mission.type === 'daily' && "Kunlik missiyalarni bajarish uchun har kuni yangi imkoniyatlar mavjud!"}
                  {mission.type === 'weekly' && "Haftalik missiyalarni bajarishga ko'proq vaqt ajrating!"}
                  {mission.type === 'achievement' && "Yutuqlarni bajarish uzoq muddatli maqsadlar uchun mo'ljallangan!"}
                  {!['daily', 'weekly', 'achievement'].includes(mission.type) && "Missiyani bajarishda davom eting!"}
                </p>
              </div>
            )}

            {/* Item reward highlight */}
            {mission.reward.item && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-sm text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <p className="font-medium"><i className="fa-solid fa-gift"></i> Maxsus mukofot: <strong>{mission.reward.item}</strong></p>
                <p className="text-xs mt-1">Ushbu missiyani bajarish orqali noyob mukofotga ega bo'ling!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const Missions: React.FC = () => {
  const { missions, claimMissionReward } = useAppStore()
  const [selectedType, setSelectedType] = useState<MissionType | 'all'>('all')
  const [claimedMessage, setClaimedMessage] = useState<{ text: string; coins: number; xp: number } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [animateItems, setAnimateItems] = useState<string[]>([])

  const countdown = useCountdown(24) // Reset at midnight (24:00)

  const types: (MissionType | 'all')[] = ['all', 'daily', 'weekly', 'achievement']

  // Count missions by type
  const missionCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {}
    types.forEach(t => {
      if (t === 'all') return
      const total = missions.filter(m => m.type === t).length
      const completed = missions.filter(m => m.type === t && m.status === 'claimed').length
      counts[t] = { total, completed }
    })
    return counts
  }, [missions, types])

  // Sort missions: available first, then in_progress, then completed, then claimed
  const sortMissions = (a: typeof missions[0], b: typeof missions[0]) => {
    const order = { available: 0, in_progress: 1, completed: 2, claimed: 3 }
    return order[a.status] - order[b.status]
  }

  const filteredMissions = useMemo(() => {
    return missions
      .filter(m => selectedType === 'all' || m.type === selectedType)
      .sort(sortMissions)
  }, [missions, selectedType])

  const handleClaim = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId)
    if (mission) {
      claimMissionReward(missionId)
      setClaimedMessage({
        text: mission.title,
        coins: mission.reward.coins,
        xp: mission.reward.experience,
      })
      
      // Add to animation queue
      setAnimateItems(prev => [...prev, missionId])
      setTimeout(() => {
        setAnimateItems(prev => prev.filter(id => id !== missionId))
      }, 2000)
      
      setTimeout(() => setClaimedMessage(null), 4000)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  // Available missions count
  const availableCount = missions.filter(m => m.status === 'available' || m.status === 'in_progress').length

  return (
    <div className="space-y-6">
      {/* Sarlavha va statistika */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white"><i className="fa-solid fa-bullseye"></i> Missiyalar</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vazifalarni bajarib, tanga va tajriba to'plang</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full self-start">
          <span className="text-lg"><i className="fa-solid fa-clipboard"></i></span>
          <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
            {availableCount} ta faol
          </span>
        </div>
      </div>

      {/* Daily countdown */}
      {selectedType === 'daily' || selectedType === 'all' ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-3 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg"><i className="fa-solid fa-clock"></i></span>
              <span className="text-gray-700 dark:text-gray-200 font-medium">Kunlik missiyalar yangilanadi:</span>
            </div>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm">
              {countdown}
            </span>
          </div>
        </div>
      ) : null}

      {/* Mukofot xabari */}
      {claimedMessage && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg animate-slide-down">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce-in"><i className="fa-solid fa-circle-check"></i></span>
            <div>
              <p className="font-semibold">"{claimedMessage.text}" bajarildi!</p>
              <p className="text-sm mt-0.5">
                <span className="font-bold">+{claimedMessage.coins} <i className="fa-solid fa-coins"></i></span>
                <span className="mx-1">|</span>
                <span className="font-bold">+{claimedMessage.xp} <i className="fa-solid fa-star"></i> XP</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtr */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {types.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all relative ${
              selectedType === type
                ? 'bg-emerald-600 text-white shadow-md scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {type === 'all' ? <span dangerouslySetInnerHTML={{ __html: '<i class="fa-solid fa-clipboard"></i> Barchasi' }} /> : <span dangerouslySetInnerHTML={{ __html: `${MISSIONS_TYPE_LABELS[type].icon} ${MISSIONS_TYPE_LABELS[type].label}` }} />}
            {type !== 'all' && missionCounts[type] && (
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                selectedType === type
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {missionCounts[type].completed}/{missionCounts[type].total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Missiyalar */}
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {filteredMissions.map((mission, index) => (
          <div
            key={mission.id}
            className={`transition-all duration-500 ${
              animateItems.includes(mission.id) ? 'scale-105' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <MissionCard
              mission={mission}
              onClaim={handleClaim}
              onToggle={toggleExpand}
              isExpanded={expandedId === mission.id}
            />
          </div>
        ))}

        {filteredMissions.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <span className="text-5xl block mb-3"><i className="fa-solid fa-inbox"></i></span>
            <p className="text-lg font-medium">Bu turdagi missiyalar hozircha mavjud emas</p>
            <p className="text-sm mt-1">Yangi missiyalar qo'shilishini kuting!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Missions
