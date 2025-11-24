'use client'

import { useMemo } from 'react'
import type { ConferenceEventWithVenue } from '@/types/conference'

interface SeasonalityHeatmapProps {
  events: ConferenceEventWithVenue[]
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export default function SeasonalityHeatmap({ events }: SeasonalityHeatmapProps) {
  const heatmapData = useMemo(() => {
    // 年と月ごとのイベント数を集計
    const yearMonthMap = new Map<string, number>()
    
    events.forEach(event => {
      const date = new Date(event.startDate)
      const year = date.getFullYear()
      const month = date.getMonth() // 0-11
      const key = `${year}-${month}`
      yearMonthMap.set(key, (yearMonthMap.get(key) || 0) + 1)
    })

    // 年の範囲を取得
    const years = Array.from(new Set(events.map(e => new Date(e.startDate).getFullYear()))).sort()
    const minYear = Math.min(...years)
    const maxYear = Math.max(...years)

    // 最大値を計算（色のスケール用）
    const maxCount = Math.max(...Array.from(yearMonthMap.values()))

    // データを整形（新しい年を上に）
    const data = []
    for (let year = maxYear; year >= minYear; year--) {
      const yearData = {
        year,
        months: [] as { month: number; count: number; intensity: number }[]
      }
      for (let month = 0; month < 12; month++) {
        const key = `${year}-${month}`
        const count = yearMonthMap.get(key) || 0
        const intensity = maxCount > 0 ? count / maxCount : 0
        yearData.months.push({ month, count, intensity })
      }
      data.push(yearData)
    }

    return { data, maxCount }
  }, [events])

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (intensity < 0.2) return 'bg-blue-200 dark:bg-blue-900'
    if (intensity < 0.4) return 'bg-blue-300 dark:bg-blue-800'
    if (intensity < 0.6) return 'bg-blue-400 dark:bg-blue-700'
    if (intensity < 0.8) return 'bg-blue-500 dark:bg-blue-600'
    return 'bg-blue-600 dark:bg-blue-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        イベント開催の季節性
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        月別の開催イベント数をヒートマップで表示（濃い色ほど開催が多い）
      </p>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* 年のヘッダー */}
          <div className="flex mb-1 h-12">
            <div className="w-12 flex-shrink-0"></div>
            <div className="flex gap-1 items-end">
              {heatmapData.data.map(({ year }) => (
                <div
                  key={year}
                  className="w-8 h-12 flex items-end justify-center"
                >
                  <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap transform -rotate-45 origin-bottom-left translate-x-2">
                    {year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ヒートマップ本体（月を縦軸、年を横軸） */}
          <div className="space-y-1 mt-2">
            {MONTHS.map((monthLabel, monthIndex) => (
              <div key={monthIndex} className="flex items-center gap-1">
                <div className="w-12 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0 text-right pr-2">
                  {monthLabel.replace('月', '')}月
                </div>
                <div className="flex gap-1">
                  {heatmapData.data.map(({ year, months }) => {
                    const monthData = months[monthIndex]
                    return (
                      <div
                        key={year}
                        className={`w-8 h-8 rounded ${getColor(monthData.intensity)} transition-all hover:ring-2 hover:ring-blue-500 cursor-pointer group relative`}
                        title={`${year}年${monthIndex + 1}月: ${monthData.count}件`}
                      >
                        {/* ツールチップ */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {year}年{monthIndex + 1}月: {monthData.count}件
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 凡例 */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900 rounded"></div>
              <div className="w-4 h-4 bg-blue-300 dark:bg-blue-800 rounded"></div>
              <div className="w-4 h-4 bg-blue-400 dark:bg-blue-700 rounded"></div>
              <div className="w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded"></div>
              <div className="w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded"></div>
            </div>
            <span>多</span>
            <span className="ml-4">最大: {heatmapData.maxCount}件/月</span>
          </div>
        </div>
      </div>
    </div>
  )
}
