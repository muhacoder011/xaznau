import React from 'react'
import type { ChatMessage as ChatMessageType } from '../../types'

interface Props {
  message: ChatMessageType
  onOptionSelect?: (option: { label: string; value: string }) => void
  isSelected?: boolean
}

export const ChatMessage: React.FC<Props> = ({
  message,
  onOptionSelect,
  isSelected,
}) => {
  const isBot = message.type === 'bot'

  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
          isBot
            ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
            : 'bg-gradient-to-br from-gold-400 to-gold-600 text-white'
        }`}
      >
        {isBot ? '🤖' : '👤'}
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isBot ? '' : 'items-end'} max-w-[85%]`}>
        <div className={isBot ? 'chat-bubble-bot' : 'chat-bubble-user'}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>

        {/* Options tugmalari */}
        {isBot && message.options && onOptionSelect && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.options.map((opt) => {
              const selected = isSelected && message.selectedOption === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => onOptionSelect(opt)}
                  className={`option-btn flex items-center gap-1.5 text-sm ${
                    selected ? 'option-btn-selected' : ''
                  }`}
                >
                  {opt.icon && <span>{opt.icon}</span>}
                  {opt.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
