'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { LatLngBounds, Icon, DivIcon } from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import MapSearchControl from './MapSearchControl'
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
      <MapSearchControl />
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60} // クラスター化する最大距離（デフォルト: 80）
        // disableClusteringAtZoom={12} // ズームレベル12以上でクラスター化を無効
        zoomToBoundsOnClick={true} // クラスタークリック時にズーム
        spiderfyOnMaxZoom={true} // 最大ズーム時にマーカーを扇状展開
        showCoverageOnHover={false} // ホバー時のカバレッジ表示を無効
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
              <Popup 
                maxWidth={320} 
                className="conference-popup"
                closeButton={false}
                autoPan={true}
              >
                <div className="min-w-[260px] sm:min-w-[280px] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-colors">
                  {/* ヘッダー部分 */}
                  <div 
                    className="px-3 py-2.5 text-white relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${getCategoryColor(primaryCategory)}, ${getCategoryColor(primaryCategory)}dd)`
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-10 dark:bg-opacity-20"></div>
                    <div className="relative">
                      <h3 className="font-bold text-base mb-1 leading-tight drop-shadow-sm">{event.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="bg-white bg-opacity-20 dark:bg-opacity-30 px-1.5 py-0.5 rounded text-xs font-medium">
                          {event.year}年
                        </span>
                        {event.isHybrid && (
                          <span className="bg-white bg-opacity-20 dark:bg-opacity-30 px-1.5 py-0.5 rounded text-xs font-medium">
                            ハイブリッド
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* コンテンツ部分 */}
                  <div className="p-3 bg-white dark:bg-gray-800">
                    {/* 日程と会場情報 */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1 m-1">
                        <div className="w-4 h-4 flex-shrink-0">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="text-gray-400 dark:text-gray-500">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{formatDateRange(event.startDate, event.endDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 m-1">
                        <div className="w-4 h-4 flex-shrink-0">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="text-gray-400 dark:text-gray-500">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-900 dark:text-gray-100 font-medium truncate">{event.venue.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* タグ */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {conference.category.map((cat) => (
                          <span
                            key={cat}
                            className="text-xs px-1.5 py-0.5 rounded font-medium"
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
                            className="text-xs px-1.5 py-0.5 rounded font-medium border"
                            style={{
                              backgroundColor: getProgrammingLanguageColor(lang) + '20',
                              borderColor: getProgrammingLanguageColor(lang),
                              color: getProgrammingLanguageColor(lang),
                            }}
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* リンク */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                      <Link
                        href={`/conference/${event.conferenceId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                      >
                        <span>歴史を見る</span>
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                      {event.eventUrl && (
                        <a
                          href={event.eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <span>詳細を見る</span>
                          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
