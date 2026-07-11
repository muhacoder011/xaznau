import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useChatBot } from '../../hooks/useChatBot'
import { ChatMessage } from './ChatMessage'
import { Timeline } from './Timeline'
import { Button } from '../ui/Button'

// Tezkor javoblar — qadamga qarab
const QUICK_REPLIES: Record<string, { label: string; icon: string }[]> = {
  city: [
    { label: 'Toshkent', icon: '🏙' },
    { label: 'Samarqand', icon: '🏛' },
    { label: 'Buxoro', icon: '🕌' },
    { label: 'Xiva', icon: '🏰' },
    { label: 'Namangan', icon: '🌄' },
    { label: "Farg'ona", icon: '🌸' },
  ],
  duration: [
    { label: '2 soat', icon: '⚡' },
    { label: '4 soat', icon: '🕐' },
    { label: '6 soat', icon: '🌤' },
    { label: '8 soat', icon: '🎉' },
    { label: '2 kun', icon: '📆' },
  ],
  budget: [
    { label: "O'rtacha", icon: '💰' },
    { label: 'Premium', icon: '💎' },
  ],
  transport: [
    { label: 'Piyoda', icon: '🚶' },
    { label: 'Taksi', icon: '🚗' },
    { label: 'Aralash', icon: '🔄' },
  ],
  prayer: [
    { label: 'Ha', icon: '🕌' },
    { label: "Yo'q", icon: '⏰' },
  ],
  food: [
    { label: 'Halol', icon: '🥩' },
    { label: 'Vegetarian', icon: '🥗' },
    { label: 'Har qanday', icon: '🍲' },
  ],
}

export const ChatBot: React.FC = () => {
  const {
    messages,
    isLoading,
    itinerary,
    handleUserMessage,
    resetChat,
    messagesEndRef,
    getCurrentStep,
  } = useChatBot()

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Joriy qadamga mos tezkor javoblar
  const quickReplies = useMemo(() => {
    if (isLoading) return []
    const step = getCurrentStep()
    return QUICK_REPLIES[step] || []
  }, [getCurrentStep, isLoading])

  // Avtomatik skroll down
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    handleUserMessage(inputValue)
    setInputValue('')
  }

  const handleQuickReply = (text: string) => {
    handleUserMessage(text)
    setInputValue('')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-5 py-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
          🧭
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold text-lg truncate">AI Yordamchi</h2>
            {isLoading && (
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>
          <p className="text-primary-200 text-xs truncate">Xazina — sayohat rejalashtirish</p>
        </div>
        <button
          onClick={resetChat}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-all hover:scale-105"
          title="Qaytadan boshlash"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scroll-smooth"
        style={{ maxHeight: 'calc(100vh - 380px)' }}
      >
        {messages.map((msg, idx) => (
          <div key={msg.id} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
            <ChatMessage message={msg} />
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-3 h-3 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-3 h-3 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="animate-pulse">Marshrut yaratilmoqda</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tezkor javoblar */}
        {quickReplies.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 justify-center animate-slide-up">
            {quickReplies.map((reply) => (
              <button
                key={reply.label}
                onClick={() => handleQuickReply(reply.label)}
                className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                           rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 
                           hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 
                           hover:shadow-md active:scale-95 transition-all duration-200
                           flex items-center gap-2 shadow-sm"
              >
                <span className="text-lg">{reply.icon}</span>
                {reply.label}
              </button>
            ))}
            {/* "Orqaga" tugmasi */}
            <button
              onClick={() => handleQuickReply('orqaga')}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 
                         rounded-xl text-xs font-medium text-gray-400 dark:text-gray-500 
                         hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300
                         active:scale-95 transition-all duration-200 flex items-center gap-1"
            >
              ⬅️ Orqaga
            </button>
          </div>
        )}

        {/* Timeline natijasi */}
        {itinerary && <Timeline itinerary={itinerary} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Keyboard Input */}
      <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Xabaringizni yozing..."
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 
                         bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                         placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
              disabled={isLoading}
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 
                       transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                       active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-300
                       shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </form>
      </div>

      {/* Footer */}
      {itinerary && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 flex justify-center">
          <Button variant="outline" size="md" onClick={resetChat}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yangi sayohat rejalash
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}
