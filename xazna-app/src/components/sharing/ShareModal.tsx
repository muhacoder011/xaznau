import React, { useState } from 'react'
import type { ShareData } from '../../types'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareData: ShareData
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareData }) => {
  const [copied, setCopied] = useState(false)
  const shareUrl = shareData.url || window.location.href

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareUrl,
        })
        onClose()
      } catch (err) {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareToTelegram = () => {
    const text = encodeURIComponent(`${shareData.title}\n\n${shareData.text}\n\n${shareUrl}`)
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareData.text)}`, '_blank')
  }

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareData.title}\n\n${shareData.text}\n\n${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${shareData.title} - ${shareData.text}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">📤 Ulashish</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">{shareData.title}</p>

        {/* Native share / Copy link */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">📱</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Ulashish</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{copied ? '✅' : '🔗'}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{copied ? 'Nusxalandi' : 'Havola'}</span>
          </button>

          <button
            onClick={shareToTelegram}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">✈️</span>
            <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">Telegram</span>
          </button>

          <button
            onClick={shareToWhatsApp}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">WhatsApp</span>
          </button>
        </div>

        {/* Share text preview */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{shareData.text}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Yopish
        </button>
      </div>
    </div>
  )
}

export default ShareModal
