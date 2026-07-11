// ============================================
// ChatBot logikasi — so'rovlar va holat boshqaruvi
// ============================================

import { useState, useCallback, useRef } from 'react'
import type {
  ChatMessage,
  ChatOption,
  ChatAnswer,
  ItineraryRequest,
  Itinerary,
} from '../types'
import { generateItinerary } from '../utils/api'

// Chat savollari konfiguratsiyasi
interface QuestionConfig {
  id: number
  text: string
  options: ChatOption[]
  mapTo: keyof ItineraryRequest
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    text: 'Assalomu alaykum! Qaysi shaharda sayohat qilmoqchisiz?',
    options: [
      { label: 'Toshkent', value: 'Toshkent', icon: '🏙️' },
      { label: 'Namangan', value: 'Namangan', icon: '🌄' },
    ],
    mapTo: 'city',
  },
  {
    id: 2,
    text: 'Ajoyib! Sayohat uchun necha soatingiz bor?',
    options: [
      { label: '2 soat', value: '2 soat' },
      { label: '4 soat', value: '4 soat' },
      { label: '6 soat', value: '6 soat' },
      { label: '8 soat', value: '8 soat' },
    ],
    mapTo: 'duration',
  },
  {
    id: 3,
    text: 'Byudjet qanday?',
    options: [
      { label: "O'rtacha", value: "o'rtacha" },
      { label: 'Premium', value: 'premium' },
    ],
    mapTo: 'budget',
  },
  {
    id: 4,
    text: 'Qanday harakat qilasiz?',
    options: [
      { label: 'Piyoda', value: 'piyoda' },
      { label: 'Taksi', value: 'taksi' },
      { label: 'Aralash', value: 'aralash' },
    ],
    mapTo: 'transport',
  },
  {
    id: 5,
    text: 'Namoz vaqtlarini hisobga olishim kerakmi?',
    options: [
      { label: 'Ha, kerak', value: 'ha' },
      { label: "Yo'q", value: "yo'q" },
    ],
    mapTo: 'prayerTimes',
  },
  {
    id: 6,
    text: "Oziq-ovqat afzalliklaringiz?",
    options: [
      { label: 'Halol', value: 'halol' },
      { label: 'Vegetarian', value: 'vegetarian' },
      { label: 'Har qanday', value: 'har_qanday' },
    ],
    mapTo: 'foodPreference',
  },
]

export function useChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: QUESTIONS[0].text,
      options: QUESTIONS[0].options,
      timestamp: new Date(),
    },
  ])

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleOptionSelect = useCallback(
    async (option: ChatOption) => {
      const question = QUESTIONS[currentQuestionIndex]

      // Foydalanuvchi javobini qo'shish
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        text: option.label,
        timestamp: new Date(),
        selectedOption: option.value,
      }

      // Tanlangan variantni saqlash
      setSelectedOptions((prev) => ({ ...prev, [question.id]: option.value }))

      // Javobni saqlash
      const newAnswers = { ...answers, [question.id]: option.value } as Record<number, string>
      setAnswers(newAnswers)

      setMessages((prev) => [...prev, userMessage])

      // Keyingi savol bormi?
      const nextIndex = currentQuestionIndex + 1

      if (nextIndex < QUESTIONS.length) {
        // Keyingi savolni qo'shish
        const nextQuestion = QUESTIONS[nextIndex]
        setCurrentQuestionIndex(nextIndex)

        setTimeout(() => {
          const botMessage: ChatMessage = {
            id: `bot-${nextQuestion.id}`,
            type: 'bot',
            text: nextQuestion.text,
            options: nextQuestion.options,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
        }, 600)
      } else {
        // Barcha savollarga javob berildi — marshrut yaratish
        setIsLoading(true)

        const itineraryRequest: ItineraryRequest = {
          city: newAnswers[1] || 'Toshkent',
          duration: newAnswers[2] || '4 soat',
          budget: newAnswers[3] || "o'rtacha",
          transport: newAnswers[4] || 'piyoda',
          prayerTimes: newAnswers[5] || 'ha',
          foodPreference: newAnswers[6] || 'halol',
        }

        try {
          const result = await generateItinerary(itineraryRequest)
          setItinerary(result)

          const doneMessage: ChatMessage = {
            id: 'done',
            type: 'bot',
            text: `✅ ${result.city} shahri uchun marshrut tayyor! ${result.items.length} ta joyni o'z ichiga oladi.`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, doneMessage])
        } catch (err) {
          const errorMessage: ChatMessage = {
            id: 'error',
            type: 'bot',
            text: '❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setIsLoading(false)
        }
      }
    },
    [currentQuestionIndex, answers]
  )

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        text: QUESTIONS[0].text,
        options: QUESTIONS[0].options,
        timestamp: new Date(),
      },
    ])
    setCurrentQuestionIndex(0)
    setAnswers({})
    setIsLoading(false)
    setItinerary(null)
    setSelectedOptions({})
  }, [])

  const handleTextMessage = useCallback(
    async (text: string) => {
      // Foydalanuvchi matnli xabarini qo'shish
      const userMessage: ChatMessage = {
        id: `user-text-${Date.now()}`,
        type: 'user',
        text: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Agar hali savollar tugamagan bo'lsa, keyingi savolga o'tish
      const nextIndex = currentQuestionIndex + 1
      if (nextIndex < QUESTIONS.length) {
        const nextQuestion = QUESTIONS[nextIndex]
        setCurrentQuestionIndex(nextIndex)

        setTimeout(() => {
          const botMessage: ChatMessage = {
            id: `bot-${nextQuestion.id}`,
            type: 'bot',
            text: nextQuestion.text,
            options: nextQuestion.options,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
        }, 600)
      } else {
        // Bot javob beradi
        const botMessage: ChatMessage = {
          id: `bot-text-${Date.now()}`,
          type: 'bot',
          text: "Tushunarli! Keling, sayohatingizni rejalashtirishda davom etamiz. 😊 Yuqoridagi variantlardan birini tanlang yoki o'z fikringizni yozing.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    },
    [currentQuestionIndex]
  )

  return {
    messages,
    isLoading,
    itinerary,
    selectedOptions,
    handleOptionSelect,
    handleTextMessage,
    resetChat,
    messagesEndRef,
  }
}
