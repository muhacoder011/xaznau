// ============================================
// ChatBot AI — erkin matnli, tanlovsiz suhbat
// ============================================

import { useState, useCallback, useRef } from 'react'
import type {
  ChatMessage,
  ItineraryRequest,
  Itinerary,
} from '../types'
import { generateItinerary } from '../utils/api'

interface BotState {
  step: 'greeting' | 'city' | 'duration' | 'budget' | 'transport' | 'prayer' | 'food' | 'done'
  answers: Partial<ItineraryRequest>
}

// --- Matn tahlili uchun yordamchi funksiyalar ---

function extractCity(text: string): string | null {
  const lower = text.toLowerCase()
  const cities = ['Toshkent', 'Namangan', 'Samarqand', 'Buxoro', 'Xiva', "Farg'ona", 'Andijon', 'Nukus', 'Guliston', 'Jizzax']
  for (const city of cities) {
    if (lower.includes(city.toLowerCase().replace("'", ""))) return city
  }
  return null
}

function extractDuration(text: string): string | null {
  const match = text.match(/(\d+)\s*(soat|kun)/i)
  if (match) {
    const num = parseInt(match[1])
    const unit = match[2].toLowerCase()
    if (unit === 'kun') return `${num * 8} soat`
    if (num <= 1) return '2 soat'
    if (num <= 3) return '4 soat'
    if (num <= 5) return '6 soat'
    return '8 soat'
  }
  if (/\b(tez|qisqa|tezda)\b/i.test(text)) return '2 soat'
  if (/\b(to'liq|uzoq|butun kun)\b/i.test(text)) return '8 soat'
  return null
}

function extractBudget(text: string): string | null {
  const lower = text.toLowerCase()
  if (/premium|qimmat|yuqori|eng zo'r|maxsus/i.test(lower)) return 'premium'
  if (/\b(tejamkor|arzon|kam harajat|pul)\b/i.test(lower)) return "o'rtacha"
  return null
}

function extractTransport(text: string): string | null {
  const lower = text.toLowerCase()
  if (/piyoda|yayov|yurib|poyezd/i.test(lower)) return 'piyoda'
  if (/taksi|mashina|avto|haydovchi/i.test(lower)) return 'taksi'
  if (/aralash|ham|ikkala|transport/i.test(lower)) return 'aralash'
  return null
}

function extractPrayer(text: string): string | null {
  const lower = text.toLowerCase()
  if (/ha|kerak|iloji|namoz|\bha\b/i.test(lower)) return 'ha'
  if (/yo'q|kerakmas|shartmas/i.test(lower)) return "yo'q"
  return null
}

function extractFood(text: string): string | null {
  const lower = text.toLowerCase()
  if (/halol|musulmon|go'sht|milliy|taom/i.test(lower)) return 'halol'
  if (/vegetarian|vegan|sabzavot|meva/i.test(lower)) return 'vegetarian'
  if (/har qanday|barchasi|ixtiyoriy/i.test(lower)) return 'har_qanday'
  return null
}

// --- Chiroyli javoblar ---

function getGreeting(): string {
  const saat = new Date().getHours()
  if (saat < 12) return 'Assalomu alaykum! Xayrli tong! 🌅'
  if (saat < 18) return 'Assalomu alaykum! Xayrli kun! ☀️'
  return 'Assalomu alaykum! Xayrli kech! 🌙'
}

function getCityResponse(city: string): string {
  const responses: Record<string, string> = {
    'Toshkent': 'Toshkent — ajoyib tanlov! 🏙 Poytaxtimizda kop tarixiy va zamonaviy joylar bor.',
    'Namangan': 'Namangan — gozal shahar! 🌄 Bu yerda tinch va maftunkor maskanlar bor.',
    'Samarqand': 'Samarqand — afsonaviy shahar! 🏛 Registon, Bibixonim... har bir tosh tarix.',
    'Buxoro': 'Buxoro — qadimiy shahar! 🕌 Minorai Kalon, Ark... sehrli muhit!',
  }
  return responses[city] || `${city} — ajoyib tanlov! 🎉 Bu shaharda kop qiziqarli joylar bor.`
}

function getDurationResponse(duration: string): string {
  return `${duration} — yaxshi! 🕐 Shu vaqt ichida kop joylarga borish mumkin.`
}

function getBudgetResponse(budget: string): string {
  return budget === 'premium'
    ? 'Premium byudjet! 💎 Eng yaxshi xizmatlarni taklif qilamiz.'
    : "O'rtacha byudjet — togri tanlov! 💰 Sifat bilan narx mutanosib."
}

function getTransportResponse(transport: string): string {
  const map: Record<string, string> = {
    'piyoda': 'Piyoda — soglikka foydali! 🚶‍♂ Shaharni his qilib yuring.',
    'taksi': 'Taksi — tez va qulay! 🚗 Vaqtingizni tejang.',
    'aralash': 'Aralash — eng mos variant! 🔄 Qayerda kerak piyoda, qayerda mashina.',
  }
  return map[transport] || ''
}

function getPrayerResponse(prayer: string): string {
  return prayer === 'ha'
    ? "Namoz vaqtlarini hisobga olaman, xavotir bolmang! 🕌"
    : "Mayli, namoz vaqtlarisiz reja tuzamiz. ⏰"
}

function getFoodResponse(food: string): string {
  const map: Record<string, string> = {
    'halol': "Halol taomlar — biz uchun muhim! 🍽 Halol sertifikatli joylarni tanlaymiz.",
    'vegetarian': "Vegetarian — sog'lom tanlov! 🥗 Sabzavotli taomlar bilan to'la.",
    'har_qanday': "Har qanday taom — kop tanlov! 🍲 Eng yaxshi variantlarni topamiz.",
  }
  return map[food] || ''
}

function getSummaryMessage(data: ItineraryRequest): string {
  return `Barcha malumotlar yigildi! Marshrut tayyorlanmoqda...
  
Shahar: ${data.city}
Vaqt: ${data.duration}
Byudjet: ${data.budget}
Transport: ${data.transport}
Namoz vaqtlari: ${data.prayerTimes === 'ha' ? 'Hisobga olinadi' : 'Hisobga olinmaydi'}
Ovqat: ${data.foodPreference}

Bir oz sabr qiling... ⏳`
}

// --- Asosiy hook ---

export function useChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: `${getGreeting()} Men Xazina AI yordamchisiman. Sayohat rejalashtirishga yordam beraman.\n\nQaysi shaharga sayohat qilmoqchisiz? 🏙`,
      timestamp: new Date(),
    },
  ])

  const [state, setState] = useState<BotState>({
    step: 'city',
    answers: {},
  })
  const [isLoading, setIsLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const advanceStep = useCallback(async (answers: Partial<ItineraryRequest>) => {
    const steps = ['city', 'duration', 'budget', 'transport', 'prayer', 'food'] as const
    const currentStep = state.step
    const currentIdx = steps.indexOf(currentStep as typeof steps[number])
    const nextIdx = currentIdx + 1

    if (nextIdx >= steps.length) {
      // Barcha malumotlar yigildi — marshrut yaratish
      setIsLoading(true)
      const itineraryRequest: ItineraryRequest = {
        city: answers.city || 'Toshkent',
        duration: answers.duration || '4 soat',
        budget: answers.budget || "o'rtacha",
        transport: answers.transport || 'piyoda',
        prayerTimes: answers.prayerTimes || 'ha',
        foodPreference: answers.foodPreference || 'halol',
      }

      const summaryMsg: ChatMessage = {
        id: `summary-${Date.now()}`,
        type: 'bot',
        text: getSummaryMessage(itineraryRequest),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, summaryMsg])

      try {
        const result = await generateItinerary(itineraryRequest)
        setItinerary(result)
        setState({ step: 'done', answers })

        const doneMsg: ChatMessage = {
          id: 'done',
          type: 'bot',
          text: `🎉 **${result.city} shahri uchun marshrut tayyor!**\n\n${result.items.length} ta qiziqarli joyni oz ichiga oladi. ${result.items.length > 0 ? `Birinchi manzil: **${result.items[0].placeName}**` : ''}\n\nYangi sayohat rejalash uchun "Qaytadan boshlash" tugmasini bosing.`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, doneMsg])
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: 'error',
          type: 'bot',
          text: 'Marshrut yaratishda xatolik yuz berdi. Iltimos, qaytadan urinib koring.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMsg])
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Keyingi savolga otish
    const nextStep = steps[nextIdx]
    setState({ step: nextStep, answers })

    setTimeout(() => {
      const questions: Record<string, string> = {
        city: 'Qaysi shaharga sayohat qilmoqchisiz? 🏙',
        duration: 'Sayohat uchun qancha vaqt ajratasiz? (masalan: 4 soat yoki 2 kun) 🕐',
        budget: "Byudjetingiz qanday? (ortacha yoki premium) 💰",
        transport: 'Qanday harakat qilishni xohlaysiz? (piyoda, taksi yoki aralash) 🚶‍♂',
        prayer: 'Namoz vaqtlarini hisobga olish kerakmi? (ha yoki yoq) 🕌',
        food: "Oziq-ovqat afzalliklaringiz qanday? (halol, vegetarian yoki har qanday) 🍽",
      }

      const botMsg: ChatMessage = {
        id: `bot-${nextStep}-${Date.now()}`,
        type: 'bot',
        text: questions[nextStep] || '',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMsg])
    }, 800)
  }, [state.step])

  const handleUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return
      if (state.step === 'done') return

      // Foydalanuvchi xabarini qoshish
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        text: trimmed,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMsg])

      const answers = { ...state.answers }

      // Joriy qadamga qarab malumotni ajratib olish
      let responseText = ''
      let detected = true

      switch (state.step) {
        case 'city': {
          const city = extractCity(trimmed)
          if (city) {
            answers.city = city
            responseText = getCityResponse(city)
          } else {
            detected = false
            responseText = 'Shahar nomini aniqlay olmadim. Qaysi shaharga bormoqchisiz? Masalan: Toshkent, Namangan, Samarqand...'
          }
          break
        }
        case 'duration': {
          const duration = extractDuration(trimmed)
          if (duration) {
            answers.duration = duration
            responseText = getDurationResponse(duration)
          } else {
            detected = false
            responseText = 'Vaqtni tushunmadim. Necha soat yoki kun sayohat qilmoqchisiz? Masalan: "4 soat" yoki "2 kun"'
          }
          break
        }
        case 'budget': {
          const budget = extractBudget(trimmed)
          if (budget) {
            answers.budget = budget
            responseText = getBudgetResponse(budget)
          } else {
            detected = false
            responseText = 'Byudjetingizni tushunmadim. "Ortacha" yoki "Premium" yozing.'
          }
          break
        }
        case 'transport': {
          const transport = extractTransport(trimmed)
          if (transport) {
            answers.transport = transport
            responseText = getTransportResponse(transport)
          } else {
            detected = false
            responseText = 'Transport turini tushunmadim. "Piyoda", "Taksi" yoki "Aralash" deb yozing.'
          }
          break
        }
        case 'prayer': {
          const prayer = extractPrayer(trimmed)
          if (prayer) {
            answers.prayerTimes = prayer
            responseText = getPrayerResponse(prayer)
          } else {
            detected = false
            responseText = 'Tushunmadim. Namoz vaqtlarini hisobga olish kerakmi? "Ha" yoki "Yoq" deb yozing.'
          }
          break
        }
        case 'food': {
          const food = extractFood(trimmed)
          if (food) {
            answers.foodPreference = food
            responseText = getFoodResponse(food)
          } else {
            detected = false
            responseText = 'Taom afzalligingizni tushunmadim. "Halol", "Vegetarian" yoki "Har qanday" deb yozing.'
          }
          break
        }
        default:
          detected = false
          responseText = 'Salom! Sayohat rejalashga tayyormisiz?'
      }

      if (detected) {
        // Javob qoshish
        const botReply: ChatMessage = {
          id: `bot-reply-${Date.now()}`,
          type: 'bot',
          text: responseText,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botReply])

        // Keyingi qadamga otish
        setTimeout(() => advanceStep(answers), 600)
      } else {
        // Tushunmadi — qayta sorash
        const botReply: ChatMessage = {
          id: `bot-retry-${Date.now()}`,
          type: 'bot',
          text: responseText,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botReply])
      }
    },
    [state, isLoading, advanceStep]
  )

  const resetChat = useCallback(() => {
    const saat = new Date().getHours()
    const greeting = saat < 12 ? 'Xayrli tong! 🌅' : saat < 18 ? 'Xayrli kun! ☀️' : 'Xayrli kech! 🌙'
    
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        text: `${greeting} Men Xazina AI yordamchisiman. Sayohat rejalashtirishga yordam beraman.\n\nQaysi shaharga sayohat qilmoqchisiz? 🏙`,
        timestamp: new Date(),
      },
    ])
    setState({ step: 'city', answers: {} })
    setIsLoading(false)
    setItinerary(null)
  }, [])

  return {
    messages,
    isLoading,
    itinerary,
    handleUserMessage,
    resetChat,
    messagesEndRef,
  }
}
