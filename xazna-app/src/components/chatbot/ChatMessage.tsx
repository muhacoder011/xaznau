import React from 'react'
import type { ChatMessage as ChatMessageType } from '../../types'

interface Props {
  message: ChatMessageType
}

// Matndagi **bold** va _italic_ ni render qilish
function renderText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|_(.+?)_)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Oddiy tekst
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index} className="font-bold text-gray-900 dark:text-white">{match[2]}</strong>)
    } else if (match[3]) {
      // _italic_
      parts.push(<em key={match.index} className="italic text-gray-600 dark:text-gray-300">{match[3]}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  // Qolgan tekst
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

function formatTimestamp(date: Date): string {
  const d = new Date(date)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
  const isBot = message.type === 'bot'

  return (
    <div className={`flex gap-3 group ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
          isBot
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
            : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
        }`}
      >
        {isBot ? '<i className="fa-solid fa-robot"></i>' : '<i className="fa-solid fa-user"></i>'}
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isBot ? '' : 'items-end'} max-w-[88%]`}>
        <div
          className={`relative px-4 py-3 shadow-sm ${
            isBot
              ? 'chat-bubble-bot'
              : 'chat-bubble-user'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {renderText(message.text)}
          </p>
        </div>
        {/* Vaqt */}
        <span className="text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
