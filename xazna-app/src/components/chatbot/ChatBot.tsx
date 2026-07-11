import React, { useEffect, useRef, useState } from 'react'
import { useChatBot } from '../../hooks/useChatBot'
import { ChatMessage } from './ChatMessage'
import { Timeline } from './Timeline'

export const ChatBot: React.FC = () => {
  const {
    messages,
    isLoading,
    itinerary,
    selectedOptions,
    handleOptionSelect,
    handleTextMessage,
    resetChat,
    messagesEndRef,
  } = useChatBot()

  const [inputText, setInputText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSendText = () => {
    if (!inputText.trim() || isLoading) return
    handleTextMessage(inputText.trim())
    setInputText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

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

      {/* Footer - Keyboard Input */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Xabaringizni yozing..."
              disabled={isLoading}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                placeholder:text-gray-400 transition-all"
            />
            {inputText.length > 0 && (
              <button
                onClick={() => setInputText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSendText}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center
              hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          {itinerary && (
            <button
              onClick={resetChat}
              className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center
                hover:bg-gray-200 transition-colors active:scale-95"
              title="Qaytadan boshlash"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
