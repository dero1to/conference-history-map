'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'
import type { Conference, ConferenceEventWithVenue } from '@/types/conference'
import FilterPanel from './FilterPanel'
import ConferenceList from './ConferenceList'
import { filterEvents } from '@/lib/utils'
import { parseUrlParams, updateUrlWithParams, type FilterParams } from '@/lib/url-params'
import { useDynamicFilters } from '@/hooks/useDynamicFilters'

interface ConferenceListPageProps {
  conferences: Conference[]
  events: ConferenceEventWithVenue[]
}

export default function ConferenceListPage({
  conferences,
  events,
}: ConferenceListPageProps) {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterParams>({
    years: [],
    categories: [],
    programmingLanguages: [],
    prefectures: [],
    offlineOnly: false,
    hybridOnly: false,
    searchQuery: '',
    venueSearchQuery: '',
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (!isInitialized) {
      const initialFilters = parseUrlParams(searchParams)
      setFilters(initialFilters)
      setIsInitialized(true)
    }
  }, [searchParams, isInitialized])

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters)
    updateUrlWithParams(newFilters, true)
  }

  const filteredEvents = useMemo(
    () => filterEvents(events, conferences, filters),
    [events, conferences, filters]
  )

  // 開催日順に並べ替える（データの読み込み順に依存しないよう明示的にソートする）
  const sortedEvents = useMemo(() => {
    const direction = sortOrder === 'asc' ? 1 : -1

    return [...filteredEvents].sort((a, b) => {
      if (a.startDate !== b.startDate) {
        return a.startDate < b.startDate ? -direction : direction
      }
      // 同日開催は名前順で安定させる
      return a.name.localeCompare(b.name, 'ja')
    })
  }, [filteredEvents, sortOrder])

  // 動的フィルタリング機能を使用
  const {
    availableYears,
    availableCategories: allCategories,
    availableProgrammingLanguages,
    availablePrefectures,
  } = useDynamicFilters(events, conferences, filters)

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-8rem)]">
      {/* サイドバー */}
      <div className="lg:w-80 flex-shrink-0 overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
        <FilterPanel
          availableYears={availableYears}
          availableCategories={allCategories}
          availableProgrammingLanguages={availableProgrammingLanguages}
          availablePrefectures={availablePrefectures}
          initialFilters={filters}
          isInitialized={isInitialized}
          onFilterChange={handleFilterChange}
        />

        {/* 統計情報 */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">統計情報</h3>
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
            <p>総イベント数: {events.length}</p>
            <p>表示中: {filteredEvents.length}</p>
            <p>カンファレンス数: {conferences.length}</p>
          </div>
        </div>
      </div>

      {/* リスト表示エリア */}
      <div className="flex-1 lg:overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              イベント一覧
            </h2>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={`並び順を切り替える（現在: ${sortOrder === 'asc' ? '古い順' : '新しい順'}）`}
              title="並び順を切り替える"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'asc' ? '古い順' : '新しい順'}
            </button>
          </div>
          <ConferenceList events={sortedEvents} conferences={conferences} />
        </div>
      </div>
    </div>
  )
}