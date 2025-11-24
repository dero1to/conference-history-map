'use client'

import { useMemo, useState } from 'react'
import { Trophy, MapPin } from 'lucide-react'
import type { ConferenceEventWithVenue } from '@/types/conference'

interface VenuePopularityRankingProps {
  events: ConferenceEventWithVenue[]
}

type CountMode = 'events' | 'conferences'

export default function VenuePopularityRanking({ events }: VenuePopularityRankingProps) {
  const [countMode, setCountMode] = useState<CountMode>('events')

  const rankings = useMemo(() => {
    // 会場ごとのイベント数とカンファレンス数を集計
    const venueMap = new Map<string, {
      venue: ConferenceEventWithVenue['venue']
      eventCount: number
      conferenceCount: number
      conferences: Set<string>
      events: { name: string; year: number; conferenceId: string }[]
    }>()

    events.forEach(event => {
      const venueId = event.venueId
      if (!venueMap.has(venueId)) {
        venueMap.set(venueId, {
          venue: event.venue,
          eventCount: 0,
          conferenceCount: 0,
          conferences: new Set(),
          events: []
        })
      }
      const data = venueMap.get(venueId)!
      data.eventCount++
      data.conferences.add(event.conferenceId)
      data.events.push({ name: event.name, year: event.year, conferenceId: event.conferenceId })
    })

    // conferenceCountを計算
    venueMap.forEach(data => {
      data.conferenceCount = data.conferences.size
    })

    // ランキング形式に変換してソート
    const sortKey = countMode === 'events' ? 'eventCount' : 'conferenceCount'
    return Array.from(venueMap.values())
      .sort((a, b) => b[sortKey] - a[sortKey])
      .slice(0, 10)
      .map((item, index) => ({
        rank: index + 1,
        venue: item.venue,
        eventCount: item.eventCount,
        conferenceCount: item.conferenceCount,
        events: item.events.sort((a, b) => b.year - a.year)
      }))
  }, [events, countMode])

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-gray-500'
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700'
    if (rank === 2) return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-300 dark:border-gray-600'
    if (rank === 3) return 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700'
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          会場人気ランキング
        </h3>
        <p className="text-gray-600 dark:text-gray-400">データがありません</p>
      </div>
    )
  }

  const maxCount = countMode === 'events' ? rankings[0].eventCount : rankings[0].conferenceCount

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          会場人気ランキング Top 10
        </h3>
      </div>

      {/* 切り替えボタン */}
      <div className="mb-4">
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setCountMode('events')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              countMode === 'events'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            イベント数
          </button>
          <button
            onClick={() => setCountMode('conferences')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
              countMode === 'conferences'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            ユニークなカンファレンス数
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {countMode === 'events' ? '開催された全イベント数' : '異なるカンファレンスの数（同じカンファレンスは1回としてカウント）'}
        </p>
      </div>

      <div className="space-y-3">
        {rankings.map(({ rank, venue, eventCount, conferenceCount, events: venueEvents }) => {
          const count = countMode === 'events' ? eventCount : conferenceCount
          const barWidth = (count / maxCount) * 100

          return (
            <div
              key={venue.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getRankBg(rank)}`}
            >
              <div className="flex items-start gap-3">
                {/* ランク */}
                <div className="flex-shrink-0">
                  <div className={`text-2xl font-bold ${getRankColor(rank)}`}>
                    {rank === 1 && '🥇'}
                    {rank === 2 && '🥈'}
                    {rank === 3 && '🥉'}
                    {rank > 3 && `#${rank}`}
                  </div>
                </div>

                {/* 会場情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {venue.name}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{venue.prefecture}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {count}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {countMode === 'events' ? '回開催' : 'カンファレンス'}
                      </div>
                      {countMode === 'conferences' && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          ({eventCount}イベント)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* プログレスバー */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 最近のイベント */}
                  <details className="group">
                    <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 list-none">
                      <span className="inline-flex items-center gap-1">
                        <span className="transform transition-transform group-open:rotate-90">▶</span>
                        最近のイベント {Math.min(5, venueEvents.length)}件を表示
                      </span>
                    </summary>
                    <div className="mt-2 pl-4 space-y-1">
                      {venueEvents.slice(0, 5).map((event, idx) => (
                        <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="text-gray-500 dark:text-gray-500">{event.year}</span>
                          {' - '}
                          <span>{event.name}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
