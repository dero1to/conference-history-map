import { useMemo } from 'react'
import type { Conference, ConferenceEventWithVenue, Category, ProgrammingLanguages } from '@/types/conference'
import { getAvailableCategories, getAvailableProgrammingLanguages } from '@/types/conference'
import { getYears, getPrefectures } from '@/lib/utils'
import type { FilterParams } from '@/lib/url-params'

/**
 * 動的フィルタリングのカスタムフック
 * 他のフィルター条件に基づいて利用可能なオプションを動的に更新する
 */
export function useDynamicFilters(
  events: ConferenceEventWithVenue[],
  conferences: Conference[],
  filters: FilterParams
) {
  // 現在のフィルター条件に基づいて利用可能なオプションを連動させる
  const getFilteredEventsForOptions = useMemo(() => {
    // 他の条件を適用したイベントを取得する関数
    return (excludeFilter: string) => {
      return events.filter((event) => {
        const conference = conferences.find(c => c.id === event.conferenceId)
        if (!conference) return false

        if (excludeFilter !== 'years' && filters.years.length > 0) {
          if (!filters.years.includes(event.year)) return false
        }
        if (excludeFilter !== 'categories' && filters.categories.length > 0) {
          const hasMatchingCategory = conference.category.some(cat => filters.categories.includes(cat))
          if (!hasMatchingCategory) return false
        }
        if (excludeFilter !== 'programmingLanguages' && filters.programmingLanguages.length > 0) {
          const hasMatchingLanguage = conference.programmingLanguages.some(lang => filters.programmingLanguages.includes(lang))
          if (!hasMatchingLanguage) return false
        }
        if (excludeFilter !== 'prefectures' && filters.prefectures.length > 0) {
          if (!filters.prefectures.includes(event.venue.prefecture as any)) return false
        }
        return true
      })
    }
  }, [events, conferences, filters])

  const availableYears = useMemo(() => getYears(getFilteredEventsForOptions('years')), [getFilteredEventsForOptions])
  const availablePrefectures = useMemo(() => getPrefectures(getFilteredEventsForOptions('prefectures')), [getFilteredEventsForOptions])
  
  const availableCategories = useMemo(() => {
    const filteredEvents = getFilteredEventsForOptions('categories')
    const existingCategories = new Set<Category>()
    filteredEvents.forEach(event => {
      const conference = conferences.find(c => c.id === event.conferenceId)
      conference?.category.forEach(cat => existingCategories.add(cat))
    })
    return getAvailableCategories().filter(cat => existingCategories.has(cat))
  }, [getFilteredEventsForOptions, conferences])
  
  const availableProgrammingLanguages = useMemo(() => {
    const filteredEvents = getFilteredEventsForOptions('programmingLanguages')
    const existingLanguages = new Set<ProgrammingLanguages>()
    filteredEvents.forEach(event => {
      const conference = conferences.find(c => c.id === event.conferenceId)
      conference?.programmingLanguages.forEach(lang => existingLanguages.add(lang))
    })
    return getAvailableProgrammingLanguages().filter(lang => existingLanguages.has(lang))
  }, [getFilteredEventsForOptions, conferences])

  return {
    availableYears,
    availableCategories,
    availableProgrammingLanguages,
    availablePrefectures,
  }
}