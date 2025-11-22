'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { LatLngBounds, Icon, DivIcon } from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import type { Conference, ConferenceEventWithVenue } from '@/types/conference'
import { getCategoryColor, getProgrammingLanguageColor, formatDateRange } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

// クラスターのインターフェースを定義
interface MarkerClusterType {
  getChildCount(): number
}

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
  events: ConferenceEventWithVenue[]
  conferences: Conference[]
  highlightVenueId?: string
}

function MapUpdater({ events, highlightVenueId }: { events: ConferenceEventWithVenue[], highlightVenueId?: string }) {
  const map = useMap()

  useEffect(() => {
    if (highlightVenueId) {
      const targetEvent = events.find(event => event.venue.id === highlightVenueId)
      if (targetEvent) {
        map.setView([targetEvent.venue.lat, targetEvent.venue.lng], 12)
        return
      }
    }

    if (events.length > 0) {
      const bounds = new LatLngBounds(
        events.map((event) => [event.venue.lat, event.venue.lng])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [events, map, highlightVenueId])

  return null
}

export default function ConferenceMap({
  events,
  conferences,
  highlightVenueId,
}: ConferenceMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors">
        <p className="text-gray-500 dark:text-gray-400">地図を読み込み中...</p>
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
      <MapUpdater events={events} highlightVenueId={highlightVenueId} />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={(cluster: MarkerClusterType) => {
          const count = cluster.getChildCount()
          let className = 'marker-cluster-small'
          
          if (count > 5) {
            className = 'marker-cluster-medium'
          }
          if (count > 10) {
            className = 'marker-cluster-large'
          }

          return new DivIcon({
            html: `<div><span>${count}</span></div>`,
            className: `marker-cluster ${className}`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })
        }}
      >
        {events.map((event, index) => {
          const conference = getConferenceById(event.conferenceId)
          if (!conference) return null

          const primaryCategory = conference.category[0]
          const isHighlighted = highlightVenueId === event.venue.id
          const color = isHighlighted ? '#FF0000' : getCategoryColor(primaryCategory)
          const icon = createColoredIcon(color)

          return (
            <Marker
              key={`${event.conferenceId}-${event.year}-${index}`}
              position={[event.venue.lat, event.venue.lng]}
              icon={icon}
            >
              <Popup maxWidth={300} className="custom-popup">
                <div className="p-2 min-w-[180px] sm:min-w-[200px]">
                  <h3 className="font-bold text-sm sm:text-lg mb-1 leading-tight">{conference.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{event.year}年</p>
                  <p className="text-xs sm:text-sm mb-1">
                    {formatDateRange(event.startDate, event.endDate)}
                  </p>
                  <p className="text-xs sm:text-sm mb-1">{event.venue.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    {event.venue.prefecture}
                  </p>
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
      </MarkerClusterGroup>
    </MapContainer>
  )
}
