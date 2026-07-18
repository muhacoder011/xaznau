// ============================================
// ChatBot AI — Yaxshilangan, aqlli va jonli suhbat
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react'
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

// ==================== LOCALSTORAGE (chat xotirasi) ====================

const STORAGE_KEY = 'xazina_chat_history'

function loadChatHistory(): { messages: ChatMessage[]; state: BotState | null } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Parse timestamps
      if (parsed.messages) {
        parsed.messages = parsed.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }
      return { messages: parsed.messages || [], state: parsed.state || null }
    }
  } catch (e) {
    console.warn('Chat xotirasini yuklashda xatolik:', e)
  }
  return { messages: [], state: null }
}

function saveChatHistory(messages: ChatMessage[], state: BotState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, state }))
  } catch (e) {
    console.warn('Chat xotirasini saqlashda xatolik:', e)
  }
}

function clearChatHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('Chat xotirasini tozalashda xatolik:', e)
  }
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
  if (saat < 5) return 'Assalomu alaykum! Tun baraka topsin! <i class="fa-solid fa-moon"></i>'
  if (saat < 12) return 'Assalomu alaykum! Xayrli tong! <i class="fa-solid fa-sun"></i> Bugun ajoyib sayohat kuni!'
  if (saat < 14) return 'Assalomu alaykum! Xayrli peshin! <i class="fa-solid fa-sun"></i> Sayohatga chiqish vaqti!'
  if (saat < 18) return 'Assalomu alaykum! Xayrli kun! <i class="fa-solid fa-sun"></i> Hali kop vaqt bor!'
  return 'Assalomu alaykum! Xayrli kech! <i class="fa-solid fa-moon"></i> Kechki sayohat ham ajoyib!'
}

function getCityResponse(city: string): string {
  const responses: Record<string, string> = {
    'Toshkent': `Toshkent — poytaxtimiz! <i class="fa-solid fa-city"></i> Bu yerda zamonaviy va tarixiy joylar uyg'unlashgan. Hazrati Imom majmuasi, Chorsu bozori, TV minora — hamma narsa bor!`,
    'Samarqand': `Samarqand — afsonaviy shahar! <i class="fa-solid fa-landmark"></i> Registon maydoni, Bibixonim, Shohizinda... Bu shaharning har bir toshi tarix. Juda ajoyib tanlov!`,
    'Buxoro': `Buxoro — qadimiy shahar! <i class="fa-solid fa-mosque"></i> Minorai Kalon, Ark qal'asi, Labi Hovuz... Buxoroning sehrli muhiti sizni hayratga soladi!`,
    'Xiva': `Xiva — ochiq osmon ostidagi muzey! <i class="fa-solid fa-chess-rook"></i> Ichan Qal'a, Muhammad Aminxon madrasasi... UNESCO merosi bo'lgan bu shahar bir marta ko'rishga arziydi!`,
    'Namangan': `Namangan — go'zal shahar! <i class="fa-solid fa-sunrise"></i> Mullo Qirg'iz masjidi, shahar bog'i va Chust bozori... Namanganda tinch va maftunkor joylar ko'p!`,
    "Farg'ona": `Farg'ona — vodiyning marvaridi! <i class="fa-solid fa-flower"></i> Rishton kulolchiligi, Marg'ilon ipagi, Quva qadimiy shahri... Farg'onada ko'p kashfiyotlar kutmoqda!`,
    'Andijon': `Andijon — Bobur vatani! <i class="fa-solid fa-crown"></i> Bobur muzeyi, Oqtepa qo'riqxonasi... Bu shahar buyuk tarixga ega!`,
    'Nukus': `Nukus — Qoraqalpog'istonning yuragi! <i class="fa-solid fa-palette"></i> Savitskiy muzeyi (O'zbekistonning Louvri) dunyoga mashhur. Mizdaxxon qal'asi esa alohida!`,
    'Guliston': `Guliston — Sirdaryo bo'yidagi go'zal shahar! <i class="fa-solid fa-flower"></i> Sirdaryo qirg'og'i va Mirzacho'l bozori bilan tanishing.`,
    'Jizzax': `Jizzax — tabiat qo'ynidagi shahar! <i class="fa-solid fa-mountain"></i> Zomin milliy bog'i, Sangzor ko'li, Forish tog'lari... Tabiatni sevuvchilar uchun ideal!`,
  }
  return responses[city] || `${city} — ajoyib tanlov! <i class="fa-solid fa-circle-check"></i> Bu shaharda juda ko'p qiziqarli joylar bor. Keling, sayohatni rejalashtiramiz!`
}

function getDurationResponse(duration: string): string {
  const d = duration.toLowerCase()
  if (d === '2 soat') return `2 soat — qisqa vaqt, lekin barakali! <i class="fa-solid fa-bolt"></i> Eng muhim joylarni ko'rsatamiz.`
  if (d === '4 soat') return `4 soat — ajoyib! <i class="fa-solid fa-clock"></i> Yaxshigina bir nechta joylarni ziyorat qilish mumkin.`
  if (d === '6 soat') return `6 soat — yaxshi vaqt! <i class="fa-solid fa-cloud-sun"></i> Ko'p joylarni ko'rishga ulgurasiz.`
  if (d === '8 soat') return `8 soat — to'liq kun! <i class="fa-solid fa-circle-check"></i> Shaharni to'liq kashf etish uchun yetarli vaqt.`
  return `${duration} — yaxshi! <i class="fa-solid fa-clock"></i> Shu vaqt ichida ko'p joylarga borish mumkin.`
}

function getBudgetResponse(budget: string): string {
  return budget === 'premium'
    ? `Premium byudjet! <i class="fa-solid fa-gem"></i> Eng yaxshi restoranlar, VIP transport va hashamatli joylarni taklif qilamiz. Faqat eng yaxshisi!`
    : `O'rtacha byudjet — to'g'ri tanlov! <i class="fa-solid fa-coins"></i> Sifat bilan narx mutanosib. Eng yaxshi variantlarni topamiz.`
}

function getTransportResponse(transport: string): string {
  const map: Record<string, string> = {
    'piyoda': 'Piyoda — zo\'r qaror! <i class="fa-solid fa-person-walking"></i> Shaharni his qilib, har bir ko\'chani kashf etasiz. Sog\'liq uchun ham foydali!',
    'taksi': 'Taksi — tez va qulay! <i class="fa-solid fa-car"></i> Vaqtingizni tejang va qulaylikda sayohat qiling. Konditsioner bilan!',
    'aralash': 'Aralash — eng mos variant! <i class="fa-solid fa-rotate"></i> Qayerda kerak piyoda, qayerda taksi. Eng optimal yechim!',
  }
  return map[transport] || ''
}

function getPrayerResponse(prayer: string): string {
  return prayer === 'ha'
    ? `Namoz vaqtlarini to'liq hisobga olaman! <i class="fa-solid fa-mosque"></i> Har bir namoz vaqtida sizga masjidlarni tavsiya qilaman. Xavotir bo'lmang!`
    : `Mayli, namoz vaqtlarisiz reja tuzamiz. <i class="fa-solid fa-clock"></i> Agar keyin kerak bo'lsa, o'zgartirish mumkin!`
}

function getFoodResponse(food: string): string {
  const map: Record<string, string> = {
    'halol': `Halol taomlar — biz uchun eng muhimi! <i class="fa-solid fa-utensils"></i> Halol sertifikatli joylarni tanlaymiz. Milliy taomlar sizni kutmoqda!`,
    'vegetarian': `Vegetarian — sog'lom tanlov! <i class="fa-solid fa-leaf"></i> Sabzavotli va mevali taomlar bilan to'la. O'zbekistonning vegetarian taomlari ham ajoyib!`,
    'har_qanday': `Har qanday taom — ko'p tanlov! <i class="fa-solid fa-utensils"></i> Eng yaxshi restoranlarni topamiz. Milliy va xalqaro taomlar sizni kutmoqda!`,
  }
  return map[food] || ''
}

function getSmallTalkResponse(text: string): string | null {
  const lower = text.toLowerCase()
  if (/\b(salom|assalomu alaykum|salom alejkum|hayrli)\b/i.test(lower)) return getGreeting()
  if (/\brahmat|tashakkur|thanks|thank you|minnatdor|savolingiz uchun tashakkur\b/i.test(lower)) return 'Arzimaydi! <i class="fa-solid fa-face-smile"></i> Sizga yordam berishdan xursandman. Sayohatni rejalashtirishni davom ettiramizmi?'
  if (/\b(xayr|hayr|ko\'rishguncha|bye|goodbye|xayr salomat)\b/i.test(lower)) return 'Xayr! Sayohatlaringiz muborak bo\'lsin! <i class="fa-solid fa-suitcase"></i> Qaytganingizda yangi marshrut yaratamiz.'
  if (/\b(yordam|help|yordam ber|qanday ishlaydi|nima qila olasiz|imkoniyatlar)\b/i.test(lower)) return 'Men sayohat rejalashtirishga yordam beraman! <i class="fa-solid fa-compass"></i> \n\n**Mening imkoniyatlarim:**\n<i class="fa-solid fa-location-dot"></i> Shahar bo\'yicha marshrut tuzish\n<i class="fa-solid fa-hourglass"></i> Vaqtni hisobga olish\n<i class="fa-solid fa-coins"></i> Byudjetga mos joylar tanlash\n<i class="fa-solid fa-person-walking"></i> Transport turini tanlash\n<i class="fa-solid fa-mosque"></i> Namoz vaqtlarini hisobga olish\n<i class="fa-solid fa-utensils"></i> Ovqat afzalliklarini inobatga olish\n\nFaqat savollarga javob bering, men eng yaxshi marshrutni tuzib beraman! <i class="fa-solid fa-wand-magic-sparkles"></i>'
  if (/\b(qanday|yaxshimisiz|ishlar|gap|ahvol)\b/i.test(lower) && (/\b(siz|sen)\b/i.test(lower) || /\bqaley\b/i.test(lower))) return 'Men ajoyibman, rahmat! <i class="fa-solid fa-rocket"></i> Sizga sayohat rejalashtirishga yordam berishga tayyorman. Qaysi shaharga bormoqchisiz?'
  
  // "Mashhur joylar" yoki "nima qilish mumkin"
  if (/\b(mashhur|tavsiya|nima qilish mumkin|qiziqarli|ko\'rishga arziydi|eng zo\'r|bormoqchi)\b/i.test(lower)) {
    return `O'zbekistonning eng mashhur joylari: <i class="fa-solid fa-star"></i>\n\n` +
      `<i class="fa-solid fa-landmark"></i> **Samarqand** — Registon, Bibixonim, Shohizinda\n` +
      `<i class="fa-solid fa-mosque"></i> **Buxoro** — Minorai Kalon, Ark qal'asi, Labi Hovuz\n` +
      `<i class="fa-solid fa-chess-rook"></i> **Xiva** — Ichan Qal'a, Muhammad Aminxon madrasasi\n` +
      `<i class="fa-solid fa-city"></i> **Toshkent** — Hazrati Imom, Chorsu bozori, TV minora\n` +
      `<i class="fa-solid fa-palette"></i> **Nukus** — Savitskiy muzeyi (O'zbekiston Louvri)\n\n` +
      `Qaysi shahar sizni ko'proq qiziqtirdi? <i class="fa-solid fa-city"></i>`
  }
  
  // Ob-havo so'rash
  if (/\b(ob-havo|ob havo|havo|harorat|issiq|sovuq)\b/i.test(lower)) {
    return 'Ob-havo haqida aniq ma\'lumotni Google yoki AccuWeather orqali bilib olishingiz mumkin. <i class="fa-solid fa-cloud-sun"></i> Ammo men sizga eng yaxshi marshrutni tuzib beraman! Qaysi shaharga bormoqchisiz? <i class="fa-solid fa-city"></i>'
  }
  
  // Pul/valyuta so'rash
  if (/\b(pul|valyuta|so\'m|dollar|ayirboshlash|narx)\b/i.test(lower)) {
    return 'Valyuta kurslari doimiy o\'zgarib turadi. Eng so\'nggi kursni banking ilovalari yoki Google orqali tekshiring. <i class="fa-solid fa-coins"></i> Men sizga sayohat marshrutini tuzishda yordam bera olaman! <i class="fa-solid fa-compass"></i>'
  }
  
  return null
}

// ==================== YORDAMCHI FUNKSIYALAR ====================

function getSummaryMessage(data: ItineraryRequest): string {
  return `<i class="fa-solid fa-clipboard"></i> **Barcha ma'lumotlar yig'ildi!** Marshrut tayyorlanmoqda...

<i class="fa-solid fa-location-dot"></i> Shahar: **${data.city}**
<i class="fa-solid fa-hourglass"></i> Vaqt: **${data.duration}**
<i class="fa-solid fa-coins"></i> Byudjet: **${data.budget === 'premium' ? '<i class="fa-solid fa-gem"></i> Premium' : `<i class="fa-solid fa-chart-simple"></i> O'rtacha`}**
<i class="fa-solid fa-car"></i> Transport: **${data.transport === 'piyoda' ? '<i class="fa-solid fa-person-walking"></i> Piyoda' : data.transport === 'taksi' ? '<i class="fa-solid fa-car"></i> Taksi' : '<i class="fa-solid fa-rotate"></i> Aralash'}**
<i class="fa-solid fa-mosque"></i> Namoz vaqtlari: **${data.prayerTimes === 'ha' ? 'Hisobga olinadi <i class="fa-solid fa-check"></i>' : "Hisobga olinmaydi"}**
<i class="fa-solid fa-utensils"></i> Ovqat: **${data.foodPreference === 'halol' ? '<i class="fa-solid fa-drumstick-bite"></i> Halol' : data.foodPreference === 'vegetarian' ? '<i class="fa-solid fa-leaf"></i> Vegetarian' : '<i class="fa-solid fa-utensils"></i> Har qanday'}**

Bir oz sabr qiling, eng yaxshi joylarni tanlayapman... <i class="fa-solid fa-hourglass"></i>`
}

function getCitySuggestion(): string {
  return `Mavjud shaharlar: Toshkent <i class="fa-solid fa-city"></i>, Samarqand <i class="fa-solid fa-landmark"></i>, Buxoro <i class="fa-solid fa-mosque"></i>, Xiva <i class="fa-solid fa-chess-rook"></i>, Namangan <i class="fa-solid fa-sunrise"></i>, Farg'ona <i class="fa-solid fa-flower"></i>, Andijon <i class="fa-solid fa-crown"></i>, Nukus <i class="fa-solid fa-palette"></i>, Guliston <i class="fa-solid fa-flower"></i>, Jizzax <i class="fa-solid fa-mountain"></i>`
}

function getDurationSuggestion(): string {
  return 'Misol: "2 soat" (tezkor), "4 soat" (yarim kun), "6 soat" (yaxshigina), "8 soat" (to\'liq kun) yoki "2 kun" <i class="fa-solid fa-stopwatch"></i>'
}

// ==================== ASOSIY HOOK ====================

export function useChatBot() {
  // Load saved chat history or create new
  const savedHistory = loadChatHistory()
  const initialMessages: ChatMessage[] = savedHistory.messages.length > 0
    ? savedHistory.messages
    : [{
        id: 'welcome',
        type: 'bot',
        text: `${getGreeting()} Men **Xazina AI** yordamchisiman. <i class="fa-solid fa-compass"></i> Sayohat rejalashtirishga yordam beraman.\n\nQaysi shaharga sayohat qilmoqchisiz? <i class="fa-solid fa-city"></i>\n\n_${getCitySuggestion()}_`,
        timestamp: new Date(),
      }]

  const initialStep = savedHistory.state?.step || 'city'
  const initialAnswers = savedHistory.state?.answers || {}
  const initialHistory = savedHistory.state?.history || []

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [state, setState] = useState<BotState>({
    step: initialStep as BotState['step'],
    answers: initialAnswers,
    history: initialHistory,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-save chat history when messages or state change
  useEffect(() => {
    saveChatHistory(messages, state)
  }, [messages, state])

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
          ? `<i class="fa-solid fa-bullseye"></i> ${result.items.length} ta qiziqarli joy topildi!\n<i class="fa-solid fa-location-dot"></i> Birinchi manzil: **${result.items[0].placeName}**\n<i class="fa-solid fa-hourglass"></i> Jami: ${result.items.reduce((s, i) => s + i.durationMinutes, 0)} daqiqa`
          : 'Afsuski, bu shahar uchun hozircha joylar ma\'lumotlari to\'liq emas. Tez orada qo\'shamiz!'

        const doneMsg: ChatMessage = {
          id: 'done',
          type: 'bot',
          text: `<i class="fa-solid fa-circle-check"></i> **${result.city} shahri uchun marshrut tayyor!**\n\n${itemsText}\n\nYangi sayohat rejalash uchun "Qaytadan boshlash" tugmasini bosing.`,
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
        city: `Qaysi shaharga sayohat qilmoqchisiz? <i class="fa-solid fa-city"></i>\n_${getCitySuggestion()}_`,
        duration: `Sayohat uchun qancha vaqt ajratasiz? <i class="fa-solid fa-clock"></i>\n_${getDurationSuggestion()}_`,
        budget: `Byudjetingiz qanday? <i class="fa-solid fa-coins"></i>\n_"O'rtacha" (tejamkor) yoki "Premium" (hashamatli)_`,
        transport: `Qanday harakat qilishni xohlaysiz? <i class="fa-solid fa-person-walking"></i>\n_Piyoda <i class="fa-solid fa-person-walking"></i>, Taksi <i class="fa-solid fa-car"></i> yoki Aralash <i class="fa-solid fa-rotate"></i>_`,
        prayer: `Namoz vaqtlarini hisobga olish kerakmi? <i class="fa-solid fa-mosque"></i>\n_Ha yoki Yo'q_`,
        food: `Oziq-ovqat afzalliklaringiz qanday? <i class="fa-solid fa-utensils"></i>\n_Halol <i class="fa-solid fa-drumstick-bite"></i>, Vegetarian <i class="fa-solid fa-leaf"></i> yoki Har qanday <i class="fa-solid fa-utensils"></i>_`,
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
          text: `Marshrut tayyor! <i class="fa-solid fa-circle-check"></i> Yangi sayohat rejalash uchun yuqoridagi 'Qaytadan boshlash' tugmasini bosing.`,
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
          city: `Mayli, qaytadan boshlaymiz! Qaysi shaharga sayohat qilmoqchisiz? <i class="fa-solid fa-city"></i>\n_${getCitySuggestion()}_`,
          duration: `Vaqtni o'zgartiramiz. Qancha vaqt ajratasiz? <i class="fa-solid fa-clock"></i>\n_${getDurationSuggestion()}_`,
          budget: `Byudjetni o'zgartiramiz. Qanday byudjet? <i class="fa-solid fa-coins"></i>`,
          transport: `Transportni o'zgartiramiz. Qanday harakat qilamiz? <i class="fa-solid fa-person-walking"></i>`,
          prayer: `Namoz vaqtlari haqida o'zgartiramiz. Kerakmi? <i class="fa-solid fa-mosque"></i>`,
          food: `Ovqat afzalligini o'zgartiramiz. Nima tanlaysiz? <i class="fa-solid fa-utensils"></i>`,
        }

        const botReply: ChatMessage = {
          id: `bot-back-${Date.now()}`,
          type: 'bot',
          text: `<i class="fa-solid fa-arrow-left"></i> Orqaga qaytdik!\n\n${questions[prevStep] || ''}`,
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
            responseText = `Shahar nomini aniqlay olmadim. <i class="fa-solid fa-face-confused"></i>\n\nIltimos, quyidagi shaharlardan birini yozing:\n${getCitySuggestion()}\n\nYoki "mashhur joylar" deb yozib, O'zbekistondagi eng qiziqarli joylar haqida bilib oling! <i class="fa-solid fa-eye"></i>`
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
            responseText = `Vaqtni tushunmadim. <i class="fa-solid fa-face-confused"></i>\n\nMisol uchun:\n• "2 soat" — tezkor sayohat <i class="fa-solid fa-bolt"></i>\n• "4 soat" — yarim kunlik <i class="fa-solid fa-clock"></i>\n• "8 soat" — to'liq kun <i class="fa-solid fa-circle-check"></i>\n• "2 kun" — ikki kunlik <i class="fa-solid fa-calendar-check"></i>\n\nQancha vaqt ajrata olasiz?`
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
            responseText = 'Byudjetingizni tushunmadim. <i class="fa-solid fa-face-confused"></i>\n\nQuyidagilardan birini tanlang:\n• "O\'rtacha" — sifatli va tejamkor <i class="fa-solid fa-coins"></i>\n• "Premium" — eng yaxshi, hashamatli <i class="fa-solid fa-gem"></i>\n\nQaysi byudjet sizga mos keladi?'
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
            responseText = 'Transport turini tushunmadim. <i class="fa-solid fa-face-confused"></i>\n\nQuyidagilardan birini yozing:\n• "Piyoda" — shaharni his qilish uchun <i class="fa-solid fa-person-walking"></i>\n• "Taksi" — tez va qulay <i class="fa-solid fa-car"></i>\n• "Aralash" — eng optimal <i class="fa-solid fa-rotate"></i>\n\nQaysi tur sizga mos?'
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
            responseText = 'Tushunmadim. <i class="fa-solid fa-face-confused"></i>\n\nNamoz vaqtlarini hisobga olish kerakmi?\n• "Ha" — barcha namoz vaqtlarini hisobga olaman <i class="fa-solid fa-mosque"></i>\n• "Yo\'q" — kerakmas, vaqtni tejaymiz <i class="fa-solid fa-clock"></i>\n\nIltimos, "Ha" yoki "Yo\'q" deb javob bering.'
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
            responseText = 'Taom afzalligingizni tushunmadim. <i class="fa-solid fa-face-confused"></i>\n\nQuyidagilardan birini tanlang:\n• "Halol" — halol sertifikatli taomlar <i class="fa-solid fa-drumstick-bite"></i>\n• "Vegetarian" — sabzavotli taomlar <i class="fa-solid fa-leaf"></i>\n• "Har qanday" — barcha turdagi taomlar <i class="fa-solid fa-utensils"></i>\n\nQaysi biri sizga mos?'
          }
          break
        }
        default:
          detected = false
          responseText = 'Assalomu alaykum! Sayohat rejalashga tayyormisiz? <i class="fa-solid fa-compass"></i>'
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
    clearChatHistory()
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        text: `${getGreeting()} Men **Xazina AI** yordamchisiman. <i class="fa-solid fa-compass"></i> Sayohat rejalashtirishga yordam beraman.\n\nQaysi shaharga sayohat qilmoqchisiz? <i class="fa-solid fa-city"></i>\n\n_${getCitySuggestion()}_`,
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
