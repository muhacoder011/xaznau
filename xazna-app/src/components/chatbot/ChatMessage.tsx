import React from 'react'
import type { ChatMessage as ChatMessageType } from '../../types'

interface Props {
  message: ChatMessageType
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
  const isBot = message.type === 'bot'

  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
          isBot
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
            : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
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
      </div>
    </div>
  )
}
