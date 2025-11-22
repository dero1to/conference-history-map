'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            イベント一覧
          </h2>
          <ConferenceList events={filteredEvents} conferences={conferences} />
        </div>
      </div>
    </div>
  )
}