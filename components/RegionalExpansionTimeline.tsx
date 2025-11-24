'use client'

import { useState, useMemo } from 'react'
import type { Conference, ConferenceEventWithVenue } from '@/types/conference'

interface RegionalExpansionTimelineProps {
  conferences: Conference[]
  events: ConferenceEventWithVenue[]
}

export default function RegionalExpansionTimeline({ conferences, events }: RegionalExpansionTimelineProps) {
  const [selectedConference, setSelectedConference] = useState<string>('')

  // カンファレンスごとの地域展開データを計算
  const expansionData = useMemo(() => {
    return conferences.map(conf => {
      const confEvents = events
        .filter(e => e.conferenceId === conf.id)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

      // 年ごとの都道府県数を計算
      const yearPrefectures = new Map<number, Set<string>>()
      confEvents.forEach(event => {
        const year = event.year
        if (!yearPrefectures.has(year)) {
          yearPrefectures.set(year, new Set())
        }
        yearPrefectures.get(year)!.add(event.venue.prefecture)
      })

      const expansion = Array.from(yearPrefectures.entries())
        .map(([year, prefs]) => ({
          year,
          prefectureCount: prefs.size,
          prefectures: Array.from(prefs)
        }))
        .sort((a, b) => a.year - b.year)

      return {
        conference: conf,
        totalEvents: confEvents.length,
        totalPrefectures: new Set(confEvents.map(e => e.venue.prefecture)).size,
        expansion
      }
    })
    .filter(d => d.totalPrefectures > 1) // 複数都道府県で開催されているもののみ
    .sort((a, b) => b.totalPrefectures - a.totalPrefectures)
  }, [conferences, events])

  const selectedData = useMemo(() => {
    if (!selectedConference) return expansionData[0]
    return expansionData.find(d => d.conference.id === selectedConference) || expansionData[0]
  }, [selectedConference, expansionData])

  if (expansionData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          地域展開タイムライン
        </h3>
        <p className="text-gray-600 dark:text-gray-400">データがありません</p>
      </div>
    )
  }

  const maxPrefectures = Math.max(...selectedData.expansion.map(e => e.prefectureCount))

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        地域展開タイムライン
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        カンファレンスが年ごとにどの程度地域展開しているかを表示
      </p>

      {/* カンファレンス選択 */}
      <div className="mb-6">
        <label htmlFor="conference-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          カンファレンスを選択
        </label>
        <select
          id="conference-select"
          value={selectedData.conference.id}
          onChange={(e) => setSelectedConference(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {expansionData.map(({ conference, totalPrefectures, totalEvents }) => (
            <option key={conference.id} value={conference.id}>
              {conference.name} ({totalPrefectures}都道府県, {totalEvents}回開催)
            </option>
          ))}
        </select>
      </div>

      {/* タイムライン */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>総開催回数: <strong className="text-gray-900 dark:text-gray-100">{selectedData.totalEvents}回</strong></span>
          <span>開催都道府県: <strong className="text-gray-900 dark:text-gray-100">{selectedData.totalPrefectures}都道府県</strong></span>
        </div>

        <div className="relative">
          {/* タイムライン軸 */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600 ml-8"></div>

          {/* イベント */}
          <div className="space-y-6">
            {selectedData.expansion.map(({ year, prefectureCount, prefectures }) => {
              const width = (prefectureCount / maxPrefectures) * 100
              return (
                <div key={year} className="flex items-start gap-4">
                  <div className="w-16 text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {year}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800"></div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {prefectureCount}都道府県
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prefectures.map(pref => (
                          <span
                            key={pref}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
