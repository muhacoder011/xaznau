// ============================================
// Backend API simulyatsiyasi — real shahar joylari
// ============================================

import type { ItineraryRequest, Itinerary, TimelineItem, LocationCategory } from '../types'

export async function generateItinerary(
  request: ItineraryRequest
): Promise<Itinerary> {
  // Backend chaqiruvini simulyatsiya qilish
  await new Promise((resolve) => setTimeout(resolve, 2500))

  return generateMockItinerary(request)
}

// ========== REAL CITY PLACES ==========

interface CityPlace {
  name: string
  description: string
  category: LocationCategory
  durationMinutes: number
  lat: number
  lng: number
}

const CITY_PLACES: Record<string, CityPlace[]> = {
  Toshkent: [
    { name: "Hazrati Imom majmuasi", description: "O'zbekistonning eng katta islom markazi. Qadimiy qo'lyozmalar va muhtasham masjid.", category: 'historical', durationMinutes: 90, lat: 41.3231, lng: 69.2394 },
    { name: "Minorai Xo'ja Ahror Valiy", description: "Tarixiy minora va ziyoratgoh. Shaharning qadimiy qismida joylashgan.", category: 'historical', durationMinutes: 60, lat: 41.3260, lng: 69.2420 },
    { name: "Oliy Majlis va Mustaqillik maydoni", description: "O'zbekistonning markaziy maydoni. Keng va obodonlashtirilgan hudud.", category: 'park', durationMinutes: 45, lat: 41.3131, lng: 69.2517 },
    { name: "Amir Temur muzeyi", description: "Buyuk sarkarda Amir Temur haqidagi noyob eksponatlar to'plami.", category: 'museum', durationMinutes: 75, lat: 41.3135, lng: 69.2787 },
    { name: "Navoiy teatri", description: "Alisher Navoiy nomidagi Davlat akademik katta teatri. Ajoyib me'morchilik.", category: 'museum', durationMinutes: 60, lat: 41.3095, lng: 69.2620 },
    { name: "TV minorasi", description: "Toshkentning eng baland nuqtasi. Shaharning ajoyib manzarasi.", category: 'park', durationMinutes: 60, lat: 41.3377, lng: 69.2845 },
    { name: "Chorsu bozori", description: "Eski shaharning qoq markazidagi an'anaviy bozor. Milliy ta'm va hidlar.", category: 'restaurant', durationMinutes: 90, lat: 41.3270, lng: 69.2397 },
    { name: "Magic City park", description: "Zamonaviy ko'ngilochar park va akvapark. Butun oila uchun.", category: 'park', durationMinutes: 120, lat: 41.2800, lng: 69.2930 },
    { name: "Botanika bog'i", description: "Keng va serhasham botanika bog'i. 5000 dan ortiq o'simlik turlari.", category: 'park', durationMinutes: 90, lat: 41.3370, lng: 69.2990 },
    { name: "Minor masjidi", description: "Toshkentdagi eng katta masjidlardan biri. 5000 kishiga mo'ljallangan.", category: 'masjid', durationMinutes: 60, lat: 41.3105, lng: 69.2580 },
  ],
  Samarqand: [
    { name: "Registon maydoni", description: "Samarqandning durdonasi. Uchta madrasa: Ulug'bek, Sherdor va Tillakori.", category: 'historical', durationMinutes: 120, lat: 39.6548, lng: 66.9758 },
    { name: "Bibixonim masjidi", description: "Amir Temur tomonidan qurdirilgan muhtasham masjid. O'rta asr me'morchiligi durdonasi.", category: 'masjid', durationMinutes: 75, lat: 39.6607, lng: 66.9794 },
    { name: "Shohizinda", description: "Qadimiy maqbaralar majmuasi. Ko'k rangli koshinlar bilan bezatilgan.", category: 'historical', durationMinutes: 90, lat: 39.6610, lng: 66.9870 },
    { name: "Ulug'bek rasadxonasi", description: "Buyuk astronom Ulug'bekning ilmiy markazi. Qadimiy asboblar.", category: 'museum', durationMinutes: 60, lat: 39.6747, lng: 66.9950 },
    { name: "Afrosiyob muzeyi", description: "Qadimiy Afrosiyob shahri xarobalari va tarixiy topilmalar.", category: 'museum', durationMinutes: 60, lat: 39.6730, lng: 66.9950 },
    { name: "Samarqand nonvoyxonasi", description: "An'anaviy Samarqand noni tayyorlash jarayonini tomosha qiling.", category: 'restaurant', durationMinutes: 45, lat: 39.6560, lng: 66.9760 },
    { name: "Siyob bozori", description: "Samarqandning rang-barang va mazali bozori. Milliy mahsulotlar.", category: 'restaurant', durationMinutes: 60, lat: 39.6580, lng: 66.9780 },
    { name: "Xo'ja Abdu Darun majmuasi", description: "XI asrga oid qadimiy ziyoratgoh va masjid.", category: 'masjid', durationMinutes: 45, lat: 39.6470, lng: 66.9720 },
    { name: "Samarqand bog'i", description: "Shaharning markaziy istirohat bog'i. Ko'l va attraksionlar.", category: 'park', durationMinutes: 60, lat: 39.6550, lng: 66.9700 },
    { name: "Konigil qog'oz fabrikasi", description: "Qadimiy usulda qog'oz ishlab chiqarish. O'zingiz qog'oz yasang!", category: 'historical', durationMinutes: 60, lat: 39.6720, lng: 66.9680 },
  ],
  Buxoro: [
    { name: "Minorai Kalon", description: "Buxoroning ramzi. XII asrda qurilgan baland minora.", category: 'historical', durationMinutes: 60, lat: 39.7784, lng: 64.4108 },
    { name: "Ark qal'asi", description: "Qadimiy Buxoro amirlarining qarorgohi. Tarixiy muzey.", category: 'museum', durationMinutes: 90, lat: 39.7775, lng: 64.4090 },
    { name: "Ismoil Somoniy maqbarasi", description: "X asrga oid noyob me'moriy yodgorlik. Islom me'morchiligining durdonasi.", category: 'historical', durationMinutes: 45, lat: 39.7778, lng: 64.4080 },
    { name: "Labi Hovuz", description: "Ko'l atrofidagi tarixiy majmua. Choyxona va madrasalar.", category: 'park', durationMinutes: 60, lat: 39.7744, lng: 64.4136 },
    { name: "Buxoro yahudiy mahallasi", description: "Qadimiy yahudiy mahallasi va sinagogalar.", category: 'historical', durationMinutes: 45, lat: 39.7720, lng: 64.4150 },
    { name: "Chor Bakr", description: "Qadimiy qabriston va ziyoratgoh. Buxorodan 5 km uzoqlikda.", category: 'masjid', durationMinutes: 90, lat: 39.7510, lng: 64.3880 },
    { name: "To'qi Telpakfurushon", description: "An'anaviy bazar gumbazi. Hunarmandchilik mahsulotlari.", category: 'restaurant', durationMinutes: 60, lat: 39.7760, lng: 64.4110 },
    { name: "Buxoro nonvoyxonasi", description: "Mashhur Buxoro noni tayyorlash mahoratini ko'ring.", category: 'restaurant', durationMinutes: 30, lat: 39.7780, lng: 64.4100 },
    { name: "Baland masjid", description: "XVI asrda qurilgan noyob ikki qavatli masjid.", category: 'masjid', durationMinutes: 45, lat: 39.7730, lng: 64.4140 },
    { name: "Sitorai Mohi Xosa", description: "Buxoro amirining yozgi saroyi. Noyob me'morchilik.", category: 'museum', durationMinutes: 75, lat: 39.7910, lng: 64.4230 },
  ],
  Xiva: [
    { name: "Ichan Qal'a", description: "O'rta asr shahri — ochiq osmon ostidagi muzey. UNESCO merosi.", category: 'historical', durationMinutes: 180, lat: 41.3775, lng: 60.3620 },
    { name: "Muhammad Aminxon madrasasi", description: "Eng katta madrasa. Hozir mehmonxona va muzey.", category: 'museum', durationMinutes: 60, lat: 41.3770, lng: 60.3610 },
    { name: "Juma masjidi", description: "X asrdagi qadimiy masjid. 218 ta yog'och ustun.", category: 'masjid', durationMinutes: 45, lat: 41.3778, lng: 60.3630 },
    { name: "Tosh Xovli saroyi", description: "Xonning shaxsiy saroyi. Noyob naqshinkor bezaklar.", category: 'historical', durationMinutes: 60, lat: 41.3765, lng: 60.3640 },
    { name: "Islom Xo'ja minorasi", description: "Xivaning eng balin minorasi. 57 metr balandlik.", category: 'historical', durationMinutes: 45, lat: 41.3780, lng: 60.3625 },
    { name: "Paxlavon Mahmud maqbarasi", description: "Xivaning homiy avliyosi maqbarasi. Noyob koshinlar.", category: 'masjid', durationMinutes: 45, lat: 41.3768, lng: 60.3628 },
    { name: "Xiva bozori", description: "An'anaviy Xiva bozori. Qo'lda tayyorlangan mahsulotlar.", category: 'restaurant', durationMinutes: 60, lat: 41.3800, lng: 60.3580 },
    { name: "Qihriq minora", description: "Nodir va nozik me'moriy usulda qurilgan minora.", category: 'historical', durationMinutes: 30, lat: 41.3773, lng: 60.3615 },
  ],
  Namangan: [
    { name: "Mullo Qirg'iz masjidi", description: "Namanganning eng katta masjidi. 3000 kishiga mo'ljallangan.", category: 'masjid', durationMinutes: 60, lat: 40.9983, lng: 71.6725 },
    { name: "Namangan shahar bog'i", description: "Shaharning markaziy bog'i. Ko'l, attraksionlar va sport maydonchalari.", category: 'park', durationMinutes: 60, lat: 40.9960, lng: 71.6710 },
    { name: "Oqtepa qo'riqxonasi", description: "Qadimiy arxeologik yodgorlik. Miloddan avvalgi IV asr.", category: 'historical', durationMinutes: 45, lat: 41.0100, lng: 71.6600 },
    { name: "Namangan o'lkashunoslik muzeyi", description: "Viloyat tarixi va madaniyatiga oid 50000 dan ortiq eksponat.", category: 'museum', durationMinutes: 60, lat: 40.9950, lng: 71.6700 },
    { name: "Chust bozori", description: "Mashhur Chust pichoqlari va milliy hunarmandchilik mahsulotlari.", category: 'restaurant', durationMinutes: 90, lat: 40.9980, lng: 71.6680 },
    { name: "Xo'ja Amin majmuasi", description: "Tarixiy ziyoratgoh va masjid majmuasi.", category: 'masjid', durationMinutes: 45, lat: 40.9930, lng: 71.6740 },
    { name: "Qorasuv bozori", description: "Namanganning eng katta bozori. Milliy taomlar va mahsulotlar.", category: 'restaurant', durationMinutes: 60, lat: 41.0020, lng: 71.6650 },
    { name: "Kosonsoy dovoni", description: "Go'zal tog' manzaralari. Piknik va dam olish uchun ideal joy.", category: 'park', durationMinutes: 120, lat: 41.0500, lng: 71.5500 },
  ],
  "Farg'ona": [
    { name: "Farg'ona shahar bog'i", description: "Shaharning eski va yangi qismi o'rtasidagi go'zal istirohat bog'i.", category: 'park', durationMinutes: 60, lat: 40.3850, lng: 71.7860 },
    { name: "Rishton kulolchilik markazi", description: "Mashhur Rishton sopol buyumlari ishlab chiqarish. O'zingiz yasang!", category: 'historical', durationMinutes: 90, lat: 40.3600, lng: 71.6500 },
    { name: "Marg'ilon ipak fabrikasi", description: "An'anaviy ipak ishlab chiqarish jarayonini ko'ring.", category: 'museum', durationMinutes: 60, lat: 40.4730, lng: 71.7250 },
    { name: "Quva qadimiy shahri", description: "Qadimiy Quva shahri xarobalari va arxeologik topilmalar.", category: 'historical', durationMinutes: 60, lat: 40.5200, lng: 71.7200 },
    { name: "Farg'ona viloyat muzeyi", description: "Farg'ona vodiysi tarixi va madaniyati haqida batafsil ma'lumot.", category: 'museum', durationMinutes: 60, lat: 40.3840, lng: 71.7880 },
    { name: "Sarbon masjidi", description: "Shaharning markaziy masjidi. Zamonaviy me'morchilik.", category: 'masjid', durationMinutes: 45, lat: 40.3870, lng: 71.7840 },
    { name: "Farg'ona bozori", description: "Vodiyning eng katta bozori. Meva-sabzavot va milliy mahsulotlar.", category: 'restaurant', durationMinutes: 60, lat: 40.3860, lng: 71.7850 },
    { name: "Qo'qon saroyi", description: "Xudoyorxon saroyi. XIX asr me'morchiligi durdonasi.", category: 'museum', durationMinutes: 75, lat: 40.5280, lng: 70.9420 },
  ],
  Andijon: [
    { name: "Bobo Oxun masjidi", description: "Shaharning eng katta va qadimiy masjidlaridan biri.", category: 'masjid', durationMinutes: 45, lat: 40.7800, lng: 72.3500 },
    { name: "Zahiriddin Muhammad Bobur muzeyi", description: "Buyuk boburiylar sulolasi asoschisi Bobur haqidagi muzey.", category: 'museum', durationMinutes: 60, lat: 40.7830, lng: 72.3480 },
    { name: "Andijon shahar bog'i", description: "Shaharning markaziy bog'i. Bobur haykali va go'zal gulzorlar.", category: 'park', durationMinutes: 60, lat: 40.7810, lng: 72.3470 },
    { name: "Oqtepa qo'riqxonasi", description: "Tarixiy arxeologik yodgorlik. Qadimiy shahar qoldiqlari.", category: 'historical', durationMinutes: 45, lat: 40.7900, lng: 72.3400 },
    { name: "Andijon bozori", description: "Vodiyning eng qadimiy bozorlaridan biri. Milliy taomlar.", category: 'restaurant', durationMinutes: 60, lat: 40.7790, lng: 72.3510 },
    { name: "Xo'ja Asomiddin masjidi", description: "Tarixiy ziyoratgoh va masjid.", category: 'masjid', durationMinutes: 45, lat: 40.7760, lng: 72.3550 },
    { name: "Andijon o'lkashunoslik muzeyi", description: "Viloyat tarixi va madaniyatiga oid boy eksponatlar.", category: 'museum', durationMinutes: 60, lat: 40.7820, lng: 72.3460 },
    { name: "Qo'rg'ontepa", description: "Qadimiy shahar qoldiqlari. Arxeologik qazishmalar hududi.", category: 'historical', durationMinutes: 60, lat: 40.7500, lng: 72.7600 },
  ],
  Nukus: [
    { name: "Savitskiy muzeyi", description: "Nukusning eng mashhur joyi. 90 000 dan ortiq eksponat. O'zbekistonning Louvri.", category: 'museum', durationMinutes: 120, lat: 42.4620, lng: 59.6170 },
    { name: "Mizdaxxon qal'asi", description: "Qadimiy qal'a va ziyoratgoh. Miloddan avvalgi IV asr.", category: 'historical', durationMinutes: 90, lat: 42.4100, lng: 59.6800 },
    { name: "Qoraqalpog'iston bog'i", description: "Shaharning markaziy dam olish bog'i.", category: 'park', durationMinutes: 45, lat: 42.4640, lng: 59.6150 },
    { name: "Nukus masjidi", description: "Shaharning markaziy masjidi.", category: 'masjid', durationMinutes: 45, lat: 42.4610, lng: 59.6190 },
    { name: "Orolbo'yi bozori", description: "Mahalliy mahsulotlar va qoraqalpoq milliy taomlari.", category: 'restaurant', durationMinutes: 60, lat: 42.4600, lng: 59.6200 },
    { name: "Qoraqalpog'iston tarix muzeyi", description: "Qoraqalpog'istonning boy tarixi va madaniyati.", category: 'museum', durationMinutes: 60, lat: 42.4630, lng: 59.6180 },
    { name: "Ko'kcha masjidi", description: "Tarixiy masjid va ziyoratgoh.", category: 'masjid', durationMinutes: 45, lat: 42.4580, lng: 59.6250 },
    { name: "Ustyurt platosi", description: "Noyob tabiat manzarasi. Tashlandiq kosmik kemalar maydoni.", category: 'park', durationMinutes: 180, lat: 42.5000, lng: 59.5000 },
  ],
  Guliston: [
    { name: "Guliston shahar bog'i", description: "Shaharning markaziy bog'i. Gul va daraxtlar bilan bezatilgan.", category: 'park', durationMinutes: 45, lat: 40.4810, lng: 68.7840 },
    { name: "Sirdaryo viloyati muzeyi", description: "Viloyat tarixi va madaniyati haqida ma'lumot.", category: 'museum', durationMinutes: 60, lat: 40.4820, lng: 68.7850 },
    { name: "Guliston masjidi", description: "Shaharning markaziy masjidi. Zamonaviy me'morchilik.", category: 'masjid', durationMinutes: 45, lat: 40.4830, lng: 68.7830 },
    { name: "Mirzacho'l bozori", description: "Mahalliy mahsulotlar va milliy taomlar.", category: 'restaurant', durationMinutes: 60, lat: 40.4800, lng: 68.7860 },
    { name: "Sirdaryo qirg'og'i", description: "Sirdaryo bo'yidagi go'zal dam olish maskani.", category: 'park', durationMinutes: 90, lat: 40.4700, lng: 68.7900 },
    { name: "Oqoltin qo'riqxonasi", description: "Noyob qushlar va tabiat qo'riqxonasi.", category: 'park', durationMinutes: 120, lat: 40.4000, lng: 68.7000 },
  ],
  Jizzax: [
    { name: "Zomin milliy bog'i", description: "O'zbekistonning eng katta milliy bog'i. Noyob tabiat va hayvonot dunyosi.", category: 'park', durationMinutes: 180, lat: 39.9600, lng: 68.4000 },
    { name: "Jizzax shahar bog'i", description: "Shaharning markaziy istirohat bog'i.", category: 'park', durationMinutes: 45, lat: 40.1120, lng: 67.8420 },
    { name: "Sangzor ko'li", description: "Go'zal ko'l bo'yida dam olish. Baliq ovlash va piknik.", category: 'park', durationMinutes: 120, lat: 40.0800, lng: 67.8000 },
    { name: "Jizzax o'lkashunoslik muzeyi", description: "Jizzax viloyati tarixi va madaniyati.", category: 'museum', durationMinutes: 60, lat: 40.1110, lng: 67.8430 },
    { name: "Jizzax masjidi", description: "Shaharning markaziy masjidi.", category: 'masjid', durationMinutes: 45, lat: 40.1130, lng: 67.8410 },
    { name: "Jizzax bozori", description: "Milliy taomlar va mahalliy mahsulotlar.", category: 'restaurant', durationMinutes: 60, lat: 40.1100, lng: 67.8440 },
    { name: "Mirzacho'l cho'li", description: "Qizilqumning bir qismi. Cho'l manzarasi va tuya safarlari.", category: 'historical', durationMinutes: 90, lat: 40.2000, lng: 67.5000 },
    { name: "Forish tumani", description: "Tog'li hudud. Alpinizm va ekoturizm uchun ideal.", category: 'park', durationMinutes: 240, lat: 40.0000, lng: 67.5000 },
  ],
}

function generateMockItinerary(request: ItineraryRequest): Itinerary {
  const places = CITY_PLACES[request.city]
  if (!places || places.length === 0) {
    // Agar shahar topilmasa, umumiy joylar
    return {
      id: crypto.randomUUID(),
      city: request.city,
      totalDuration: request.duration,
      budget: request.budget,
      transport: request.transport,
      items: [],
      createdAt: new Date(),
    }
  }

  // Byudjetga qarab joylar soni
  let count: number
  if (request.budget === 'premium') {
    count = Math.min(places.length, 8)
  } else {
    count = Math.min(places.length, 5)
  }

  // Transportga qarab tartib
  const shuffled = [...places].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)

  // Vaqtni hisobga olib sozlash
  const totalMinutes = parseInt(request.duration) || 240
  const avgDuration = Math.floor(totalMinutes / count)

  const items: TimelineItem[] = selected.map((place, idx) => ({
    id: crypto.randomUUID(),
    order: idx + 1,
    placeName: place.name,
    description: place.description,
    durationMinutes: Math.min(place.durationMinutes, avgDuration),
    distanceFromPreviousKm: idx === 0 ? 0 : Math.round(Math.random() * 3 + 1),
    category: place.category,
    coordinates: {
      lat: place.lat + (Math.random() - 0.5) * 0.005,
      lng: place.lng + (Math.random() - 0.5) * 0.005,
    },
  }))

  return {
    id: crypto.randomUUID(),
    city: request.city,
    totalDuration: request.duration,
    budget: request.budget,
    transport: request.transport,
    items,
    createdAt: new Date(),
  }
}
