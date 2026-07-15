import React from 'react'
import type { Itinerary, TimelineItem } from '../../types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../types'
import { formatDistance } from '../../utils/haversine'

interface Props {
  itinerary: Itinerary
}

const TimelineItemCard: React.FC<{ item: TimelineItem; isLast: boolean }> = ({
  item,
  isLast,
}) => {
  return (
    <div className="relative pl-8 pb-8">
      {/* Timeline chizig'i */}
      {!isLast && <div className="timeline-line" />}

      {/* Dot */}
      <div className="timeline-dot" />

      {/* Kartochka */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Kategoriya va tartib */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-400">
                {item.order}.
              </span>
              <span
                className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  CATEGORY_COLORS[item.category]
                }`}
              >
                {CATEGORY_LABELS[item.category]}
              </span>
            </div>

            {/* Joy nomi */}
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {item.placeName}
            </h3>

            {/* Ta'rif */}
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              {item.description}
            </p>

            {/* Vaqt va masofa */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item.durationMinutes} daqiqa
              </span>

              {item.distanceFromPreviousKm > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {formatDistance(item.distanceFromPreviousKm)}
                </span>
              )}
            </div>
          </div>

          {/* Koordinatalar */}
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-gray-400 font-mono">
              {item.coordinates.lat.toFixed(4)},{' '}
              {item.coordinates.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Timeline: React.FC<Props> = ({ itinerary }) => {
  return (
    <div className="mt-6">
      {/* Sarlavha */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          <i className="fa-solid fa-map"></i> {itinerary.city} bo'ylab sayohat
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {itinerary.items.length} ta joy · {itinerary.totalDuration} ·{' '}
          {itinerary.transport} · Byudjet: {itinerary.budget}
        </p>
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto">
        {itinerary.items.map((item, idx) => (
          <TimelineItemCard
            key={item.id}
            item={item}
            isLast={idx === itinerary.items.length - 1}
          />
        ))}
      </div>

      {/* Xulosa */}
      <div className="mt-6 bg-primary-50 rounded-2xl p-5 text-center max-w-2xl mx-auto">
        <p className="text-primary-800 text-sm font-medium">
          Jami{' '}
          <strong className="text-primary-900">
            {itinerary.items.reduce((sum, i) => sum + i.durationMinutes, 0)}{' '}
            daqiqa
          </strong>{' '}
          davom etadigan ajoyib sayohat! <i className="fa-solid fa-circle-check"></i>
        </p>
      </div>
    </div>
  )
}
