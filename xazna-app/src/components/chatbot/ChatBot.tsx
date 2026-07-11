import React, { useEffect, useRef } from 'react'
import { useChatBot } from '../../hooks/useChatBot'
import { ChatMessage } from './ChatMessage'
import { Timeline } from './Timeline'
import { Button } from '../ui/Button'

export const ChatBot: React.FC = () => {
  const {
    messages,
    isLoading,
    itinerary,
    selectedOptions,
    handleOptionSelect,
    resetChat,
    messagesEndRef,
  } = useChatBot()

  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Avtomatik skroll down
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-3xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
          🧭
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">AI Sayohat Yordamchisi</h2>
          <p className="text-primary-200 text-xs">Xazina — kashf etishga tayyormisiz?</p>
        </div>
        <button
          onClick={resetChat}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
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
        className="flex-1 overflow-y-auto px-4 py-6 space-y-5"
        style={{ maxHeight: 'calc(100vh - 320px)' }}
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onOptionSelect={handleOptionSelect}
            isSelected={!!selectedOptions[Number(msg.id.replace('bot-', ''))]}
          />
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-3 h-3 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-3 h-3 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-gray-500 font-medium animate-pulse">
                Marshrut yaratilmoqda...
              </p>
            </div>
          </div>
        )}

        {/* Timeline natijasi */}
        {itinerary && <Timeline itinerary={itinerary} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      {itinerary && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 flex justify-center">
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
