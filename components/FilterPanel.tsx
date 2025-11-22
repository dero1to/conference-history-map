'use client'

import { useState, useEffect } from 'react'
import type { Category, ProgrammingLanguages } from '@/types/conference'
import { getCategoryColor, getProgrammingLanguageColor } from '@/lib/utils'
import type { FilterParams } from '@/lib/url-params'

interface FilterPanelProps {
  availableYears: number[]
  availableCategories: Category[]
  availableProgrammingLanguages: ProgrammingLanguages[]
  availablePrefectures: string[]
  initialFilters: FilterParams
  isInitialized: boolean
  onFilterChange: (filters: FilterParams) => void
}

export default function FilterPanel({
  availableYears,
  availableCategories,
  availableProgrammingLanguages,
  availablePrefectures,
  initialFilters,
  isInitialized,
  onFilterChange,
}: FilterPanelProps) {
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [selectedProgrammingLanguages, setSelectedProgrammingLanguages] = useState<ProgrammingLanguages[]>([])
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([])
  const [offlineOnly, setOfflineOnly] = useState(false)
  const [hybridOnly, setHybridOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [venueSearchQuery, setVenueSearchQuery] = useState('')

  useEffect(() => {
    if (isInitialized) {
      setSelectedYears(initialFilters.years)
      setSelectedCategories(initialFilters.categories)
      setSelectedProgrammingLanguages(initialFilters.programmingLanguages)
      setSelectedPrefectures(initialFilters.prefectures)
      setOfflineOnly(initialFilters.offlineOnly)
      setHybridOnly(initialFilters.hybridOnly)
      setSearchQuery(initialFilters.searchQuery)
      setVenueSearchQuery(initialFilters.venueSearchQuery)
    }
  }, [initialFilters, isInitialized])

  const handleFilterUpdate = (updates: Partial<FilterParams>) => {
    const newFilters = {
      years: updates.years ?? selectedYears,
      categories: updates.categories ?? selectedCategories,
      programmingLanguages: updates.programmingLanguages ?? selectedProgrammingLanguages,
      prefectures: updates.prefectures ?? selectedPrefectures,
      offlineOnly: updates.offlineOnly ?? offlineOnly,
      hybridOnly: updates.hybridOnly ?? hybridOnly,
      searchQuery: updates.searchQuery ?? searchQuery,
      venueSearchQuery: updates.venueSearchQuery ?? venueSearchQuery,
    }
    onFilterChange(newFilters)
  }

  const toggleYear = (year: number) => {
    const newYears = selectedYears.includes(year)
      ? selectedYears.filter((y) => y !== year)
      : [...selectedYears, year]
    setSelectedYears(newYears)
    handleFilterUpdate({ years: newYears })
  }

  const toggleCategory = (category: Category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]
    setSelectedCategories(newCategories)
    handleFilterUpdate({ categories: newCategories })
  }

  const toggleProgrammingLanguage = (language: ProgrammingLanguages) => {
    const newLanguages = selectedProgrammingLanguages.includes(language)
      ? selectedProgrammingLanguages.filter((l) => l !== language)
      : [...selectedProgrammingLanguages, language]
    setSelectedProgrammingLanguages(newLanguages)
    handleFilterUpdate({ programmingLanguages: newLanguages })
  }

  const togglePrefecture = (prefecture: string) => {
    const newPrefectures = selectedPrefectures.includes(prefecture)
      ? selectedPrefectures.filter((p) => p !== prefecture)
      : [...selectedPrefectures, prefecture]
    setSelectedPrefectures(newPrefectures)
    handleFilterUpdate({ prefectures: newPrefectures })
  }

  const handleOfflineToggle = () => {
    const newValue = !offlineOnly
    setOfflineOnly(newValue)
    if (newValue) {
      setHybridOnly(false)
      handleFilterUpdate({ offlineOnly: newValue, hybridOnly: false })
    } else {
      handleFilterUpdate({ offlineOnly: newValue })
    }
  }

  const handleHybridToggle = () => {
    const newValue = !hybridOnly
    setHybridOnly(newValue)
    if (newValue) {
      setOfflineOnly(false)
      handleFilterUpdate({ hybridOnly: newValue, offlineOnly: false })
    } else {
      handleFilterUpdate({ hybridOnly: newValue })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value
    setSearchQuery(newSearchQuery)
    handleFilterUpdate({ searchQuery: newSearchQuery })
  }

  const handleVenueSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVenueSearchQuery = e.target.value
    setVenueSearchQuery(newVenueSearchQuery)
    handleFilterUpdate({ venueSearchQuery: newVenueSearchQuery })
  }

  const clearAllFilters = () => {
    const emptyFilters: FilterParams = {
      years: [],
      categories: [],
      programmingLanguages: [],
      prefectures: [],
      offlineOnly: false,
      hybridOnly: false,
      searchQuery: '',
      venueSearchQuery: '',
    }
    setSelectedYears(emptyFilters.years)
    setSelectedCategories(emptyFilters.categories)
    setSelectedProgrammingLanguages(emptyFilters.programmingLanguages)
    setSelectedPrefectures(emptyFilters.prefectures)
    setOfflineOnly(emptyFilters.offlineOnly)
    setHybridOnly(emptyFilters.hybridOnly)
    setSearchQuery(emptyFilters.searchQuery)
    setVenueSearchQuery(emptyFilters.venueSearchQuery)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters =
    selectedYears.length > 0 ||
    selectedCategories.length > 0 ||
    selectedProgrammingLanguages.length > 0 ||
    selectedPrefectures.length > 0 ||
    offlineOnly ||
    hybridOnly ||
    searchQuery.trim().length > 0 ||
    venueSearchQuery.trim().length > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 space-y-3 sm:space-y-4 transition-colors">
      <div className="flex justify-between items-center">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">フィルター</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded transition-colors"
          >
            クリア
          </button>
        )}
      </div>

      {/* カンファレンス名検索フィルター */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">カンファレンス名で検索</h3>
        <input
          type="text"
          placeholder="カンファレンス名を入力..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent min-h-[40px] transition-colors"
        />
      </div>

      {/* 会場名検索フィルター */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">会場名で検索</h3>
        <input
          type="text"
          placeholder="会場名を入力..."
          value={venueSearchQuery}
          onChange={handleVenueSearchChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent min-h-[40px] transition-colors"
        />
      </div>

      {/* 年度フィルター */}
      <div>
        <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-900 dark:text-gray-100">年度</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                selectedYears.includes(year)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* 技術領域フィルター */}
      <div>
        <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-900 dark:text-gray-100">技術領域</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {availableCategories
            .map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-all min-h-[36px] flex items-center justify-center ${
                  selectedCategories.includes(category)
                    ? 'text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
                style={
                  selectedCategories.includes(category)
                    ? { backgroundColor: getCategoryColor(category) }
                    : {}
                }
              >
                {category}
              </button>
            ))}
        </div>
      </div>

      {/* プログラミング言語フィルター */}
      <div>
        <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-900 dark:text-gray-100">プログラミング言語</h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {availableProgrammingLanguages
            .map((language) => (
              <button
                key={language}
                onClick={() => toggleProgrammingLanguage(language)}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-all min-h-[36px] flex items-center justify-center ${
                  selectedProgrammingLanguages.includes(language)
                    ? 'text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
                style={
                  selectedProgrammingLanguages.includes(language)
                    ? { backgroundColor: getProgrammingLanguageColor(language) }
                    : {}
                }
              >
                {language}
              </button>
            ))}
        </div>
      </div>

      {/* 都道府県フィルター */}
      <div>
        <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-900 dark:text-gray-100">都道府県</h3>
        <div className="max-h-32 sm:max-h-40 overflow-y-auto">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {availablePrefectures.map((prefecture) => (
              <button
                key={prefecture}
                onClick={() => togglePrefecture(prefecture)}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-colors min-h-[36px] flex items-center justify-center ${
                  selectedPrefectures.includes(prefecture)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {prefecture}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 開催形式フィルター */}
      <div>
        <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-900 dark:text-gray-100">開催形式</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={offlineOnly}
              onChange={handleOfflineToggle}
              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs sm:text-sm">オフライン開催</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hybridOnly}
              onChange={handleHybridToggle}
              className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-xs sm:text-sm">ハイブリッド開催</span>
          </label>
        </div>
      </div>
    </div>
  )
}
