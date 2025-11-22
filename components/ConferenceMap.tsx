'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { LatLngBounds, Icon } from 'leaflet'
import type { Conference, ConferenceEvent } from '@/types/conference'
import { getCategoryColor, getProgrammingLanguageColor, formatDateRange } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

// デフォルトアイコンの設定（Leafletのアイコンパス問題の修正）
const createColoredIcon = (color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path fill="${color}" stroke="white" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

interface ConferenceMapProps {
  events: ConferenceEvent[]
  conferences: Conference[]
}

function MapUpdater({ events }: { events: ConferenceEvent[] }) {
  const map = useMap()

  useEffect(() => {
    if (events.length > 0) {
      const bounds = new LatLngBounds(
        events.map((event) => [event.location.lat, event.location.lng])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [events, map])

  return null
}

export default function ConferenceMap({
  events,
  conferences,
}: ConferenceMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">地図を読み込み中...</p>
      </div>
    )
  }

  const getConferenceById = (id: string) => {
    return conferences.find((c) => c.id === id)
  }

  return (
    <MapContainer
      center={[36.5, 138.0]} // 日本の中心
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
      touchZoom={true}
      doubleClickZoom={true}
      scrollWheelZoom={true}
      dragging={true}
    >
      <TileLayer
        attribution='Map data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater events={events} />
      {events.map((event, index) => {
        const conference = getConferenceById(event.conferenceId)
        if (!conference) return null

        const primaryCategory = conference.category[0]
        const color = getCategoryColor(primaryCategory)
        const icon = createColoredIcon(color)

        return (
          <Marker
            key={`${event.conferenceId}-${event.year}-${index}`}
            position={[event.location.lat, event.location.lng]}
            icon={icon}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2 min-w-[180px] sm:min-w-[200px]">
                <h3 className="font-bold text-sm sm:text-lg mb-1 leading-tight">{conference.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">{event.year}年</p>
                <p className="text-xs sm:text-sm mb-1">
                  {formatDateRange(event.startDate, event.endDate)}
                </p>
                <p className="text-xs sm:text-sm mb-1">{event.location.name}</p>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  {event.location.prefecture}
                </p>
                {event.attendees && (
                  <p className="text-xs sm:text-sm mb-1">参加者: {event.attendees}人</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {conference.category.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                      style={{
                        backgroundColor: getCategoryColor(cat),
                        color: 'white',
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                  {conference.programmingLanguages?.map((lang) => (
                    <span
                      key={lang}
                      className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
                      style={{
                        backgroundColor: getProgrammingLanguageColor(lang),
                        color: 'white',
                      }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                {event.isHybrid && (
                  <span className="inline-block text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded mt-2">
                    ハイブリッド開催
                  </span>
                )}
                {event.isOnline && !event.isHybrid && (
                  <span className="inline-block text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded mt-2">
                    オンライン開催
                  </span>
                )}
                {event.eventUrl && (
                  <a
                    href={event.eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-xs sm:text-sm text-blue-600 hover:underline"
                  >
                    イベントページ →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
