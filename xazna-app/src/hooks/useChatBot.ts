// ============================================
// ChatBot AI — Yaxshilangan, aqlli va jonli suhbat
// ============================================

import { useState, useCallback, useRef } from 'react'
import type {
  ChatMessage,
  ItineraryRequest,
  Itinerary,
} from '../types'
import { generateItinerary } from '../utils/api'

interface BotState {
  step: 'city' | 'duration' | 'budget' | 'transport' | 'prayer' | 'food' | 'done'
  answers: Partial<ItineraryRequest>
  history: string[] // oldingi qadamlar (orqaga qaytish uchun)
}

// ==================== MATN TAHLILI (kengaytirilgan) ====================

const CITIES = [
  { name: 'Toshkent', aliases: ['toshkent', 'tashkent', 'toshket', 'тoшкeнт', 'poytaxt', 'capital'] },
  { name: 'Samarqand', aliases: ['samarqand', 'samarkand', 'samarqand', 'самарканд'] },
  { name: 'Buxoro', aliases: ['buxoro', 'buxoro', 'bukhara', 'бухоро', 'бухара'] },
  { name: 'Xiva', aliases: ['xiva', 'khiva', 'хива', 'xива'] },
  { name: 'Namangan', aliases: ['namangan', 'namangan', 'наманган'] },
  { name: "Farg'ona", aliases: ["farg'ona", 'fargona', 'fergana', 'fərğana', 'фаргона'] },
  { name: 'Andijon', aliases: ['andijon', 'andijan', 'andijоn', 'андижон'] },
  { name: 'Nukus', aliases: ['nukus', 'nukus', 'нкус', 'нукус'] },
  { name: 'Guliston', aliases: ['guliston', 'gulistan', 'гyлистон', 'гулистон'] },
  { name: 'Jizzax', aliases: ['jizzax', 'jizzakh', 'jizzah', 'жиззах', 'джизак'] },
]

function extractCity(text: string): string | null {
  const lower = text.toLowerCase().replace(/['`]/g, '')
  for (const city of CITIES) {
    for (const alias of city.aliases) {
      if (lower.includes(alias.replace(/['`]/g, ''))) return city.name
    }
  }
  return null
}

function extractDuration(text: string): string | null {
  const lower = text.toLowerCase()

  // "2 soat", "3 kun", "5 soat" pattern
  const match = text.match(/(\d+)\s*(soat|kun|kuni|kunga|s)?\.?\s*(soat|kun|kuni)?/i)
  if (match) {
    const num = parseInt(match[1])
    const unit = (match[2] || match[3] || '').toLowerCase().replace(/^s$/, 'soat')

    if (unit === 'kun' || unit === 'kuni' || unit === 'kunga') {
      const hours = num * 8
      if (hours <= 4) return '4 soat'
      if (hours <= 8) return '8 soat'
      return `${Math.min(hours, 16)} soat`
    }
    // soat
    if (num <= 1) return '2 soat'
    if (num <= 2) return '2 soat'
    if (num <= 4) return '4 soat'
    if (num <= 6) return '6 soat'
    return '8 soat'
  }

  // So'zli ifodalar
  if (/\b(tezda?|qisqa|tezkor|1 soat|bir soat)\b/i.test(lower)) return '2 soat'
  if (/\b(to'liq|uzoq|butun|kun bo'yi|toliq|yarim kun)\b/i.test(lower)) return '8 soat'
  if (/\b(ikki|2|3|uch)\s*(soat)\b/i.test(lower)) return '4 soat'

  return null
}

function extractBudget(text: string): string | null {
  const lower = text.toLowerCase()
  if (/premium|qimmat|yuqori|eng zo'r|maxsus|hashamatli|eng yaxshi|elite/i.test(lower)) return 'premium'
  if (/\b(tejamkor|arzon|kam|pulni tejash|oz harajat|budjet)\b/i.test(lower)) return "o'rtacha"
  if (/\b(ortacha|ortacha|normal|oddiy|yetarli)\b/i.test(lower)) return "o'rtacha"
  return null
}

function extractTransport(text: string): string | null {
  const lower = text.toLowerCase()
  if (/piyoda|yayov|yurib|poyezd|yurish|yugurib|pearson/i.test(lower)) return 'piyoda'
  if (/taksi|mashina|avto|haydovchi|avtomobil|taksi|car/i.test(lower)) return 'taksi'
  if (/aralash|ham|ikkala|transport|bus|avtobus|metro/i.test(lower)) return 'aralash'
  return null
}

function extractPrayer(text: string): string | null {
  const lower = text.toLowerCase()
  // "ha" degan ma'noni anglatuvchi so'zlar
  if (/\b(ha|kerak|iloji|namoz|bilan|hisobga)\b/i.test(lower) && !/yo'q|kerakmas/i.test(lower)) return 'ha'
  if (/yo'q|kerakmas|shartmas|hohlamayman|ixtiyoriy/i.test(lower)) return "yo'q"
  return null
}

function extractFood(text: string): string | null {
  const lower = text.toLowerCase()
  if (/halol|musulmon|go'sht|milliy|taom|mol go'sht|qo'y/i.test(lower)) return 'halol'
  if (/vegetarian|vegan|sabzavot|meva|ko'kat|salat/i.test(lower)) return 'vegetarian'
  if (/har qanday|barchasi|ixtiyoriy|farqi yo'q|istalgan|hamma/i.test(lower)) return 'har_qanday'
  return null
}

// ==================== KENGAYTIRILGAN JAVOBLAR ====================

function getGreeting(): string {
  const saat = new Date().getHours()
  if (saat < 5) return 'Assalomu alaykum! Tun baraka topsin! 🌙'
  if (saat < 12) return 'Assalomu alaykum! Xayrli tong! 🌅 Bugun ajoyib sayohat kuni!'
  if (saat < 14) return 'Assalomu alaykum! Xayrli peshin! ☀️ Sayohatga chiqish vaqti!'
  if (saat < 18) return 'Assalomu alaykum! Xayrli kun! ☀️ Hali kop vaqt bor!'
  return 'Assalomu alaykum! Xayrli kech! 🌙 Kechki sayohat ham ajoyib!'
}

function getCityResponse(city: string): string {
  const responses: Record<string, string> = {
    'Toshkent': "Toshkent — poytaxtimiz! 🏙 Bu yerda zamonaviy va tarixiy joylar uyg'unlashgan. Hazrati Imom majmuasi, Chorsu bozori, TV minora — hamma narsa bor!",
    'Samarqand': "Samarqand — afsonaviy shahar! 🏛 Registon maydoni, Bibixonim, Shohizinda... Bu shaharning har bir toshi tarix. Juda ajoyib tanlov!",
    'Buxoro': "Buxoro — qadimiy shahar! 🕌 Minorai Kalon, Ark qal'asi, Labi Hovuz... Buxoroning sehrli muhiti sizni hayratga soladi!",
    'Xiva': "Xiva — ochiq osmon ostidagi muzey! 🏰 Ichan Qal'a, Muhammad Aminxon madrasasi... UNESCO merosi bo'lgan bu shahar bir marta ko'rishga arziydi!",
    'Namangan': "Namangan — go'zal shahar! 🌄 Mullo Qirg'iz masjidi, shahar bog'i va Chust bozori... Namanganda tinch va maftunkor joylar ko'p!",
    "Farg'ona": "Farg'ona — vodiyning marvaridi! 🌸 Rishton kulolchiligi, Marg'ilon ipagi, Quva qadimiy shahri... Farg'onada ko'p kashfiyotlar kutmoqda!",
    'Andijon': "Andijon — Bobur vatani! 👑 Bobur muzeyi, Oqtepa qo'riqxonasi... Bu shahar buyuk tarixga ega!",
    'Nukus': "Nukus — Qoraqalpog'istonning yuragi! 🎨 Savitskiy muzeyi (O'zbekistonning Louvri) dunyoga mashhur. Mizdaxxon qal'asi esa alohida!",
    'Guliston': "Guliston — Sirdaryo bo'yidagi go'zal shahar! 🌷 Sirdaryo qirg'og'i va Mirzacho'l bozori bilan tanishing.",
    'Jizzax': "Jizzax — tabiat qo'ynidagi shahar! 🏔 Zomin milliy bog'i, Sangzor ko'li, Forish tog'lari... Tabiatni sevuvchilar uchun ideal!",
  }
  return responses[city] || `${city} — ajoyib tanlov! 🎉 Bu shaharda juda ko'p qiziqarli joylar bor. Keling, sayohatni rejalashtiramiz!`
}

function getDurationResponse(duration: string): string {
  const d = duration.toLowerCase()
  if (d === '2 soat') return "2 soat — qisqa vaqt, lekin barakali! ⚡ Eng muhim joylarni ko'rsatamiz."
  if (d === '4 soat') return "4 soat — ajoyib! 🕐 Yaxshigina bir nechta joylarni ziyorat qilish mumkin."
  if (d === '6 soat') return "6 soat — yaxshi vaqt! 🌤 Ko'p joylarni ko'rishga ulgurasiz."
  if (d === '8 soat') return "8 soat — to'liq kun! 🎉 Shaharni to'liq kashf etish uchun yetarli vaqt."
  return `${duration} — yaxshi! 🕐 Shu vaqt ichida ko'p joylarga borish mumkin.`
}

function getBudgetResponse(budget: string): string {
  return budget === 'premium'
    ? 'Premium byudjet! 💎 Eng yaxshi restoranlar, VIP transport va hashamatli joylarni taklif qilamiz. Faqat eng yaxshisi!'
    : "O'rtacha byudjet — to'g'ri tanlov! 💰 Sifat bilan narx mutanosib. Eng yaxshi variantlarni topamiz."
}

function getTransportResponse(transport: string): string {
  const map: Record<string, string> = {
    'piyoda': 'Piyoda — zo\'r qaror! 🚶‍♂ Shaharni his qilib, har bir ko\'chani kashf etasiz. Sog\'liq uchun ham foydali!',
    'taksi': 'Taksi — tez va qulay! 🚗 Vaqtingizni tejang va qulaylikda sayohat qiling. Konditsioner bilan!',
    'aralash': 'Aralash — eng mos variant! 🔄 Qayerda kerak piyoda, qayerda taksi. Eng optimal yechim!',
  }
  return map[transport] || ''
}

function getPrayerResponse(prayer: string): string {
  return prayer === 'ha'
    ? "Namoz vaqtlarini to'liq hisobga olaman! 🕌 Har bir namoz vaqtida sizga masjidlarni tavsiya qilaman. Xavotir bo'lmang!"
    : "Mayli, namoz vaqtlarisiz reja tuzamiz. ⏰ Agar keyin kerak bo'lsa, o'zgartirish mumkin!"
}

function getFoodResponse(food: string): string {
  const map: Record<string, string> = {
    'halol': "Halol taomlar — biz uchun eng muhimi! 🍽 Halol sertifikatli joylarni tanlaymiz. Milliy taomlar sizni kutmoqda!",
    'vegetarian': "Vegetarian — sog'lom tanlov! 🥗 Sabzavotli va mevali taomlar bilan to'la. O'zbekistonning vegetarian taomlari ham ajoyib!",
    'har_qanday': "Har qanday taom — ko'p tanlov! 🍲 Eng yaxshi restoranlarni topamiz. Milliy va xalqaro taomlar sizni kutmoqda!",
  }
  return map[food] || ''
}

function getSmallTalkResponse(text: string): string | null {
  const lower = text.toLowerCase()
  if (/\b(salom|assalomu alaykum|salom alejkum|hayrli)\b/i.test(lower)) return getGreeting()
  if (/\brahmat|tashakkur|thanks|thank you|minnatdor\b/i.test(lower)) return 'Arzimaydi! 😊 Sizga yordam berishdan xursandman. Sayohatni rejalashtirishni davom ettiramizmi?'
  if (/\b(xayr|hayr|ko'rishguncha|bye|goodbye)\b/i.test(lower)) return 'Xayr! Sayohatlaringiz muborak bo\'lsin! 🧳 Qaytganingizda yangi marshrut yaratamiz.'
  if (/\b(yordam|help|yordam ber|qanday ishlaydi|nima qila olasiz)\b/i.test(lower)) return 'Men sayohat rejalashtirishga yordam beraman! 🧭 Shahar, vaqt, byudjet va boshqa ma\'lumotlarni so\'rab, sizga eng yaxshi marshrutni tuzib beraman. Faqat savollarga javob bering!'
  if (/\b(qanday|yaxshimisiz|ishlar|gap)\b/i.test(lower) && (/\b(siz|sen)\b/i.test(lower) || /\bqaley\b/i.test(lower))) return 'Men ajoyibman, rahmat! 🚀 Sizga sayohat rejalashtirishga yordam berishga tayyorman. Qaysi shaharga bormoqchisiz?'
  return null
}

// ==================== YORDAMCHI FUNKSIYALAR ====================

function getSummaryMessage(data: ItineraryRequest): string {
  return `📋 **Barcha ma'lumotlar yig'ildi!** Marshrut tayyorlanmoqda...

📍 Shahar: **${data.city}**
⏳ Vaqt: **${data.duration}**
💰 Byudjet: **${data.budget === 'premium' ? '💎 Premium' : "📊 O'rtacha"}**
🚗 Transport: **${data.transport === 'piyoda' ? '🚶 Piyoda' : data.transport === 'taksi' ? '🚗 Taksi' : '🔄 Aralash'}**
🕌 Namoz vaqtlari: **${data.prayerTimes === 'ha' ? 'Hisobga olinadi ✅' : "Hisobga olinmaydi"}**
🍽 Ovqat: **${data.foodPreference === 'halol' ? '🥩 Halol' : data.foodPreference === 'vegetarian' ? '🥗 Vegetarian' : '🍲 Har qanday'}**

Bir oz sabr qiling, eng yaxshi joylarni tanlayapman... ⏳`
}

function getCitySuggestion(): string {
  return `Mavjud shaharlar: Toshkent 🏙, Samarqand 🏛, Buxoro 🕌, Xiva 🏰, Namangan 🌄, Farg'ona 🌸, Andijon 👑, Nukus 🎨, Guliston 🌷, Jizzax 🏔`
}

function getDurationSuggestion(): string {
  return 'Misol: "2 soat" (tezkor), "4 soat" (yarim kun), "6 soat" (yaxshigina), "8 soat" (to\'liq kun) yoki "2 kun" ⏱'
}

// ==================== ASOSIY HOOK ====================

export function useChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: `${getGreeting()} Men **Xazina AI** yordamchisiman. 🧭 Sayohat rejalashtirishga yordam beraman.\n\nQaysi shaharga sayohat qilmoqchisiz? 🏙\n\n_${getCitySuggestion()}_`,
      timestamp: new Date(),
    },
  ])

  const [state, setState] = useState<BotState>({
    step: 'city',
    answers: {},
    history: [],
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
      // Barcha ma'lumotlar yig'ildi — marshrut yaratish
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
        setState(prev => ({ ...prev, step: 'done', answers }))

        const itemsText = result.items.length > 0
          ? `🎯 ${result.items.length} ta qiziqarli joy topildi!\n📍 Birinchi manzil: **${result.items[0].placeName}**\n⏳ Jami: ${result.items.reduce((s, i) => s + i.durationMinutes, 0)} daqiqa`
          : 'Afsuski, bu shahar uchun hozircha joylar ma\'lumotlari to\'liq emas. Tez orada qo\'shamiz!'

        const doneMsg: ChatMessage = {
          id: 'done',
          type: 'bot',
          text: `🎉 **${result.city} shahri uchun marshrut tayyor!**\n\n${itemsText}\n\nYangi sayohat rejalash uchun "Qaytadan boshlash" tugmasini bosing.`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, doneMsg])
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: 'error',
          type: 'bot',
          text: 'Marshrut yaratishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMsg])
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Keyingi savolga o'tish
    const nextStep = steps[nextIdx]
    setState(prev => ({ step: nextStep, answers, history: [...prev.history, currentStep] }))

    setTimeout(() => {
      const questions: Record<string, string> = {
        city: `Qaysi shaharga sayohat qilmoqchisiz? 🏙\n_${getCitySuggestion()}_`,
        duration: `Sayohat uchun qancha vaqt ajratasiz? 🕐\n_${getDurationSuggestion()}_`,
        budget: "Byudjetingiz qanday? 💰\n_\"O'rtacha\" (tejamkor) yoki \"Premium\" (hashamatli)_",
        transport: "Qanday harakat qilishni xohlaysiz? 🚶‍♂\n_Piyoda 🚶, Taksi 🚗 yoki Aralash 🔄_",
        prayer: "Namoz vaqtlarini hisobga olish kerakmi? 🕌\n_Ha yoki Yo'q_",
        food: "Oziq-ovqat afzalliklaringiz qanday? 🍽\n_Halol 🥩, Vegetarian 🥗 yoki Har qanday 🍲_",
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

      // Agar marshrut tayyor bo'lsa, yangi chat uchun resetni tavsiya qilish
      if (state.step === 'done') {
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          type: 'user',
          text: trimmed,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMsg])

        const reply: ChatMessage = {
          id: `bot-done-${Date.now()}`,
          type: 'bot',
          text: "Marshrut tayyor! 🎉 Yangi sayohat rejalash uchun yuqoridagi 'Qaytadan boshlash' tugmasini bosing.",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, reply])
        return
      }

      // Foydalanuvchi xabarini qo'shish
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        text: trimmed,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMsg])

      // Avval smalltalkni tekshirish
      const smallTalk = getSmallTalkResponse(trimmed)
      if (smallTalk && !extractCity(trimmed)) {
        const botReply: ChatMessage = {
          id: `bot-smalltalk-${Date.now()}`,
          type: 'bot',
          text: smallTalk,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botReply])
        return
      }

      // "orqaga" yoki "o'zgartir" komandalari
      if (/\b(orqaga|qaytish|boshqa|o'zgartir|o\'zgartir|qayta|yangidan)\b/i.test(trimmed) && state.history.length > 0) {
        const prevStep = state.history[state.history.length - 1]
        setState(prev => ({
          step: prevStep as BotState['step'],
          answers: prev.answers,
          history: prev.history.slice(0, -1),
        }))

        const steps = ['city', 'duration', 'budget', 'transport', 'prayer', 'food'] as const
        const questions: Record<string, string> = {
          city: `Mayli, qaytadan boshlaymiz! Qaysi shaharga sayohat qilmoqchisiz? 🏙\n_${getCitySuggestion()}_`,
          duration: `Vaqtni o'zgartiramiz. Qancha vaqt ajratasiz? 🕐\n_${getDurationSuggestion()}_`,
          budget: "Byudjetni o'zgartiramiz. Qanday byudjet? 💰",
          transport: "Transportni o'zgartiramiz. Qanday harakat qilamiz? 🚶‍♂",
          prayer: "Namoz vaqtlari haqida o'zgartiramiz. Kerakmi? 🕌",
          food: "Ovqat afzalligini o'zgartiramiz. Nima tanlaysiz? 🍽",
        }

        const botReply: ChatMessage = {
          id: `bot-back-${Date.now()}`,
          type: 'bot',
          text: `⬅️ Orqaga qaytdik!\n\n${questions[prevStep] || ''}`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botReply])
        return
      }

      const answers = { ...state.answers }

      // Joriy qadamga qarab ma'lumotni ajratib olish
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
            responseText = `Shahar nomini aniqlay olmadim. 😕\n\nIltimos, quyidagilardan birini yozing:\n${getCitySuggestion()}`
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
            responseText = `Vaqtni tushunmadim. 😕\n\n${getDurationSuggestion()}`
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
            responseText = 'Byudjetingizni tushunmadim. 😕\n\n"Iqtisodiy" yoki "Premium" deb yozing. Yoki "O\'rtacha" — bu eng yaxshi variant!'
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
            responseText = 'Transport turini tushunmadim. 😕\n\n"Piyoda" 🚶‍♂, "Taksi" 🚗 yoki "Aralash" 🔄 deb yozing.'
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
            responseText = 'Tushunmadim. 😕\n\nNamoz vaqtlarini hisobga olish kerakmi? "Ha" yoki "Yo\'q" deb yozing.'
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
            responseText = 'Taom afzalligingizni tushunmadim. 😕\n\n"Halol" 🥩, "Vegetarian" 🥗 yoki "Har qanday" 🍲 deb yozing.'
          }
          break
        }
        default:
          detected = false
          responseText = 'Assalomu alaykum! Sayohat rejalashga tayyormisiz? 🧭'
      }

      if (detected) {
        // Javob qo'shish
        const botReply: ChatMessage = {
          id: `bot-reply-${Date.now()}`,
          type: 'bot',
          text: responseText,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botReply])

        // Keyingi qadamga o'tish
        setTimeout(() => advanceStep(answers), 600)
      } else {
        // Tushunmadi — qayta so'rash
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
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        text: `${getGreeting()} Men **Xazina AI** yordamchisiman. 🧭 Sayohat rejalashtirishga yordam beraman.\n\nQaysi shaharga sayohat qilmoqchisiz? 🏙\n\n_${getCitySuggestion()}_`,
        timestamp: new Date(),
      },
    ])
    setState({ step: 'city', answers: {}, history: [] })
    setIsLoading(false)
    setItinerary(null)
  }, [])

  const getCurrentStep = useCallback(() => {
    return state.step
  }, [state.step])

  return {
    messages,
    isLoading,
    itinerary,
    handleUserMessage,
    resetChat,
    messagesEndRef,
    getCurrentStep,
  }
}
