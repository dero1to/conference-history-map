'use client'

import { useMemo } from 'react'
import type { ConferenceEventWithVenue } from '@/types/conference'

interface TokyoConcentrationMeterProps {
  events: ConferenceEventWithVenue[]
}

export default function TokyoConcentrationMeter({ events }: TokyoConcentrationMeterProps) {
  const data = useMemo(() => {
    const tokyoEvents = events.filter(e => e.venue.prefecture === '東京都')
    const tokyoCount = tokyoEvents.length
    const totalCount = events.length
    const tokyoPercentage = totalCount > 0 ? (tokyoCount / totalCount) * 100 : 0
    const otherCount = totalCount - tokyoCount

    // 年次推移データ
    const yearlyData = new Map<number, { tokyo: number; other: number }>()
    events.forEach(event => {
      const year = event.year
      if (!yearlyData.has(year)) {
        yearlyData.set(year, { tokyo: 0, other: 0 })
      }
      const data = yearlyData.get(year)!
      if (event.venue.prefecture === '東京都') {
        data.tokyo++
      } else {
        data.other++
      }
    })

    const trend = Array.from(yearlyData.entries())
      .map(([year, { tokyo, other }]) => ({
        year,
        tokyoPercentage: (tokyo / (tokyo + other)) * 100
      }))
      .sort((a, b) => a.year - b.year)

    return {
      tokyoCount,
      otherCount,
      totalCount,
      tokyoPercentage,
      trend
    }
  }, [events])

  // ゲージの色を決定
  const getGaugeColor = (percentage: number) => {
    if (percentage >= 70) return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', label: '非常に高い' }
    if (percentage >= 50) return { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', label: '高い' }
    if (percentage >= 30) return { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', label: '中程度' }
    return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', label: '低い' }
  }

  const gaugeColor = getGaugeColor(data.tokyoPercentage)

  // 最新5年の平均
  const recentYears = data.trend.slice(-5)
  const recentAverage = recentYears.length > 0
    ? recentYears.reduce((sum, d) => sum + d.tokyoPercentage, 0) / recentYears.length
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        東京集中度メーター
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        全イベントに占める東京都開催の割合
      </p>

      {/* メインゲージ */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-48 h-48">
            {/* 背景円 */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* プログレス円 */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${data.tokyoPercentage * 2.51} 251`}
                className={gaugeColor.bg.replace('bg-', 'text-')}
                strokeLinecap="round"
              />
            </svg>
            {/* 中央のテキスト */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${gaugeColor.text}`}>
                {data.tokyoPercentage.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {gaugeColor.label}
              </span>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {data.tokyoCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">東京都</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.otherCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">その他</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.totalCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">総計</div>
          </div>
        </div>
      </div>

      {/* 年次推移 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          年次推移
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {data.trend.slice().reverse().slice(0, 10).map(({ year, tokyoPercentage }) => (
            <div key={year} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-12">
                {year}
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${getGaugeColor(tokyoPercentage).bg}`}
                  style={{ width: `${tokyoPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
                {tokyoPercentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          直近5年平均: {recentAverage.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
