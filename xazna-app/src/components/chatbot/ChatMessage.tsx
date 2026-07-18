import React from 'react'
import type { ChatMessage as ChatMessageType } from '../../types'

interface Props {
  message: ChatMessageType
}

// Matndagi **bold**, _italic_ va HTML <i> taglarini render qilish
function renderText(text: string): string {
  // Convert **bold** to <strong>
  // Convert _italic_ to <em>
  // HTML <i> tags are already in the text and will be rendered by dangerouslySetInnerHTML
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
    .replace(/_(.+?)_/g, '<em class="italic text-gray-600 dark:text-gray-300">$1</em>')

  return html
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
        <span dangerouslySetInnerHTML={{
          __html: isBot ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>'
        }} />
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isBot ? '' : 'items-end'} max-w-[88%] lg:max-w-[75%]`}>
        <div
          className={`relative px-4 py-3 shadow-sm ${
            isBot
              ? 'chat-bubble-bot'
              : 'chat-bubble-user'
          }`}
        >
          <p
            className="text-[15px] leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderText(message.text) }}
          />
        </div>
        {/* Vaqt */}
        <span className="text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
