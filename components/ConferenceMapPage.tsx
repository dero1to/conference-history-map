'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import type { Conference, ConferenceEvent, Category, ProgrammingLanguages } from '@/types/conference'
import FilterPanel from './FilterPanel'
import { filterEvents, getYears, getPrefectures } from '@/lib/utils'
import { parseUrlParams, updateUrlWithParams, type FilterParams } from '@/lib/url-params'

const ConferenceMap = dynamic(() => import('./ConferenceMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-500">地図を読み込み中...</p>
    </div>
  ),
})

interface ConferenceMapPageProps {
  conferences: Conference[]
  events: ConferenceEvent[]
}

export default function ConferenceMapPage({
  conferences,
  events,
}: ConferenceMapPageProps) {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterParams>({
    years: [],
    categories: [],
    programmingLanguages: [],
    prefectures: [],
    onlineOnly: false,
    offlineOnly: false,
    searchQuery: '',
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

  const availableYears = useMemo(() => getYears(events), [events])
  const availablePrefectures = useMemo(() => getPrefectures(events), [events])

  const allCategories: Category[] = [
    // 技術領域
    'Web',
    'Mobile',
    'Backend',
    'Frontend',
    'DevOps',
    'AI/ML',
    'Data',
    'Security',
    'Cloud',
    'General',
    
  ]
  const availableProgrammingLanguages: ProgrammingLanguages[] = [
    // プログラミング言語
    'JavaScript',
    'TypeScript',
    'PHP',
    'Ruby'
    // 'Python',
    // 'Go',
    // 'Rust',
    // 'Java',
    // 'Kotlin',
    // 'Swift',
    // 'C#',
    // 'C++',
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]">
      {/* サイドバー */}
      <div className="lg:w-80 flex-shrink-0 overflow-y-auto max-h-[40vh] lg:max-h-full">
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
        <div className="mt-3 sm:mt-4 bg-white rounded-lg shadow-md p-3 sm:p-4">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">統計情報</h3>
          <div className="space-y-1 text-xs sm:text-sm">
            <p>総イベント数: {events.length}</p>
            <p>表示中: {filteredEvents.length}</p>
            <p>カンファレンス数: {conferences.length}</p>
          </div>
        </div>
      </div>

      {/* 地図エリア */}
      <div className="flex-1 rounded-lg overflow-hidden shadow-md min-h-[60vh] lg:min-h-0">
        <ConferenceMap events={filteredEvents} conferences={conferences} />
      </div>
    </div>
  )
}
