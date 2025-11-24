'use client'

import { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import L from 'leaflet'
import type { ConferenceEventWithVenue } from '@/types/conference'
import 'leaflet/dist/leaflet.css'

// マーカーアイコンの設定
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface AnimatedMapProps {
  events: ConferenceEventWithVenue[]
  conferences: Array<{
    id: string
    name: string
    category: string[]
    programmingLanguages: string[]
  }>
}

// マップビューを更新するコンポーネント
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 5, { animate: true })
  }, [center, map])
  return null
}

export default function AnimatedMap({ events, conferences }: AnimatedMapProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // ms

  // カンファレンスマップを作成
  const conferenceMap = useMemo(() => {
    return new Map(conferences.map(c => [c.id, c]))
  }, [conferences])

  // 年のリストを取得
  const years = useMemo(() => {
    const yearSet = new Set(events.map(e => e.year))
    return Array.from(yearSet).sort((a, b) => a - b)
  }, [events])

  // 初期年を設定
  useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0])
    }
  }, [years, selectedYear])

  // 選択された年のイベント
  const filteredEvents = useMemo(() => {
    if (selectedYear === null) return []
    return events.filter(e => e.year === selectedYear)
  }, [events, selectedYear])

  // 自動再生
  useEffect(() => {
    if (!isPlaying || selectedYear === null) return

    const currentIndex = years.indexOf(selectedYear)
    if (currentIndex === -1 || currentIndex >= years.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      setSelectedYear(years[currentIndex + 1])
    }, playbackSpeed)

    return () => clearTimeout(timer)
  }, [isPlaying, selectedYear, years, playbackSpeed])

  const handlePrevYear = () => {
    if (selectedYear === null) return
    const currentIndex = years.indexOf(selectedYear)
    if (currentIndex > 0) {
      setSelectedYear(years[currentIndex - 1])
      setIsPlaying(false)
    }
  }

  const handleNextYear = () => {
    if (selectedYear === null) return
    const currentIndex = years.indexOf(selectedYear)
    if (currentIndex < years.length - 1) {
      setSelectedYear(years[currentIndex + 1])
      setIsPlaying(false)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    if (years.length > 0) {
      setSelectedYear(years[0])
      setIsPlaying(false)
    }
  }

  // マップの中心を計算
  const mapCenter: [number, number] = useMemo(() => {
    if (filteredEvents.length === 0) return [36.5, 138] // 日本の中心
    const avgLat = filteredEvents.reduce((sum, e) => sum + e.venue.lat, 0) / filteredEvents.length
    const avgLng = filteredEvents.reduce((sum, e) => sum + e.venue.lng, 0) / filteredEvents.length
    return [avgLat, avgLng]
  }, [filteredEvents])

  if (years.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          開催地アニメーションマップ
        </h3>
        <p className="text-gray-600 dark:text-gray-400">データがありません</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        開催地アニメーションマップ
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        年ごとの開催地の変化をアニメーションで表示
      </p>

      {/* コントロールパネル */}
      <div className="mb-4 space-y-4">
        {/* 年表示 */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {selectedYear}年
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredEvents.length}件のイベント
          </div>
        </div>

        {/* 再生コントロール */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="最初に戻る"
          >
            <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handlePrevYear}
            disabled={selectedYear === years[0]}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="前の年"
          >
            <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
            title={isPlaying ? '一時停止' : '再生'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={handleNextYear}
            disabled={selectedYear === years[years.length - 1]}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="次の年"
          >
            <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setSelectedYear(years[years.length - 1])}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="最後に進む"
          >
            <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* 速度調整 */}
        <div className="flex items-center justify-center gap-4">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            再生速度:
          </label>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value={2000}>遅い (2秒)</option>
            <option value={1000}>普通 (1秒)</option>
            <option value={500}>速い (0.5秒)</option>
          </select>
        </div>

        {/* タイムラインスライダー */}
        <div className="px-2">
          <input
            type="range"
            min={0}
            max={years.length - 1}
            value={selectedYear ? years.indexOf(selectedYear) : 0}
            onChange={(e) => {
              setSelectedYear(years[Number(e.target.value)])
              setIsPlaying(false)
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>{years[0]}</span>
            <span>{years[years.length - 1]}</span>
          </div>
        </div>
      </div>

      {/* マップ */}
      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={[37.5, 137.5]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} />
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {filteredEvents.map((event, idx) => {
              const conference = conferenceMap.get(event.conferenceId)
              if (!conference) return null

              const formatDateRange = (start: string, end: string) => {
                const startDate = new Date(start)
                const endDate = new Date(end)
                if (start === end) {
                  return startDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
                }
                return `${startDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`
              }

              return (
                <Marker
                  key={`${event.conferenceId}-${event.year}-${idx}`}
                  position={[event.venue.lat, event.venue.lng]}
                  icon={defaultIcon}
                >
                  <Popup 
                    maxWidth={320} 
                    className="conference-popup"
                    closeButton={false}
                    autoPan={true}
                  >
                    <div className="min-w-[260px] sm:min-w-[280px] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                      {/* ヘッダー部分 */}
                      <div className="px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <h3 className="font-bold text-base mb-1 leading-tight">{event.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded text-xs font-medium">
                            {event.year}年
                          </span>
                          {event.isHybrid && (
                            <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded text-xs font-medium">
                              ハイブリッド
                            </span>
                          )}
                        </div>
                      </div>

                      {/* コンテンツ部分 */}
                      <div className="p-3 bg-white dark:bg-gray-800">
                        {/* 日程と会場情報 */}
                        <div className="mb-3">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-4 h-4 flex-shrink-0">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="text-gray-400 dark:text-gray-500">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{formatDateRange(event.startDate, event.endDate)}</p>
                          </div>

                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 flex-shrink-0">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="text-gray-400 dark:text-gray-500">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-xs text-gray-900 dark:text-gray-100 font-medium">{event.venue.name}</p>
                          </div>
                        </div>

                        {/* タグ */}
                        {(conference.category.length > 0 || conference.programmingLanguages.length > 0) && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {conference.category.slice(0, 3).map((cat) => (
                                <span
                                  key={cat}
                                  className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                >
                                  {cat}
                                </span>
                              ))}
                              {conference.programmingLanguages.slice(0, 2).map((lang) => (
                                <span
                                  key={lang}
                                  className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                >
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  )
}
