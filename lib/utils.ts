import { Conference, ConferenceEventWithVenue, Category, ProgrammingLanguages, Prefectures } from '@/types/conference'
import { getAvailablePrefectures } from '@/types/conference'

// カテゴリー別の色を返す
export function getCategoryColor(category: Category): string {
  const colorMap: Record<Category, string> = {
    // 技術領域
    Web: '#3B82F6', // blue
    Mobile: '#8B5CF6', // violet
    Backend: '#06B6D4', // cyan
    Frontend: '#10B981', // green
    DevOps: '#F59E0B', // amber
    'AI/ML': '#EC4899', // pink
    Data: '#6366F1', // indigo
    Security: '#EF4444', // red
    Network: '#F59E0B', // amber
    Cloud: '#14B8A6', // teal
    SRE: '#F97316', // orange
    OS: '#22C55E', // lime
    Framework: '#8B5CF6', // violet
    Tooling: '#3B82F6', // blue
    Other: '#6B7280', // gray
  }
  return colorMap[category] || colorMap.Other
}

export function getProgrammingLanguageColor(language: ProgrammingLanguages): string {
  const colorMap: Record<ProgrammingLanguages, string> = {
    // プログラミング言語
    JavaScript: '#F7DF1E', // yellow
    TypeScript: '#3178C6', // blue
    PHP: '#777BB4', // purple
    Ruby: '#CC342D', // red
    Python: '#3776AB', // blue
    Go: '#00ADD8', // cyan
    Rust: '#CE422B', // orange-red
    Java: '#007396', // blue
    Kotlin: '#7F52FF', // purple
    Swift: '#FA7343', // orange
    'C#': '#239120', // green
    'C++': '#00599C', // blue
    Other: '#6B7280' // gray
  }
  return colorMap[language] || '#6B7280' // default gray
}

// 都道府県リストを取得（型定義の順序で、データがあるもののみ）
export function getPrefectures(events: ConferenceEventWithVenue[]): Prefectures[] {
  // 実際にイベントがある都道府県を収集
  const existingPrefectures = new Set<Prefectures>()
  events.forEach((event) => {
    existingPrefectures.add(event.venue.prefecture as Prefectures)
  })

  // 型定義の順序で、データがあるもののみを返す
  return getAvailablePrefectures().filter(prefecture =>
    existingPrefectures.has(prefecture)
  )
}

// 年度リストを取得
export function getYears(events: ConferenceEventWithVenue[]): number[] {
  const years = new Set<number>()
  events.forEach((event) => {
    years.add(event.year)
  })
  return Array.from(years).sort((a, b) => b - a)
}

// フィルタリング処理
export function filterEvents(
  events: ConferenceEventWithVenue[],
  conferences: Conference[],
  filters: {
    years?: number[]
    categories?: Category[]
    programmingLanguages?: ProgrammingLanguages[]
    prefectures?: Prefectures[]
    offlineOnly?: boolean
    hybridOnly?: boolean
    searchQuery?: string
    venueSearchQuery?: string
  }
): ConferenceEventWithVenue[] {
  return events.filter((event) => {
    // 年度フィルター
    if (filters.years && filters.years.length > 0) {
      if (!filters.years.includes(event.year)) return false
    }

    // カテゴリーフィルター
    if (filters.categories && filters.categories.length > 0) {
      const conference = conferences.find((c) => c.id === event.conferenceId)
      if (!conference) return false
      const hasMatchingCategory = conference.category.some((cat) =>
        filters.categories!.includes(cat)
      )
      if (!hasMatchingCategory) return false
    }

    // プログラミング言語フィルター
    if (filters.programmingLanguages && filters.programmingLanguages.length > 0) {
      const conference = conferences.find((c) => c.id === event.conferenceId)
      if (!conference) return false
      const hasMatchingLanguage = conference.programmingLanguages.some((lang) =>
        filters.programmingLanguages!.includes(lang)
      )
      if (!hasMatchingLanguage) return false
    }

    // 都道府県フィルター
    if (filters.prefectures && filters.prefectures.length > 0) {
      if (!filters.prefectures.includes(event.venue.prefecture as Prefectures)) return false
    }

    // カンファレンス名検索フィルター
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const conference = conferences.find((c) => c.id === event.conferenceId)
      if (!conference) return false

      const normalizedQuery = normalizeSearchQuery(filters.searchQuery)
      const normalizedConferenceName = normalizeSearchQuery(conference.name)
      const normalizedEventName = normalizeSearchQuery(event.name)

      if (!normalizedConferenceName.includes(normalizedQuery) && !normalizedEventName.includes(normalizedQuery)) {
        return false
      }
    }

    // 会場名検索フィルター
    if (filters.venueSearchQuery && filters.venueSearchQuery.trim()) {
      const normalizedVenueQuery = normalizeSearchQuery(filters.venueSearchQuery)
      const normalizedVenueName = normalizeSearchQuery(event.venue.name)

      if (!normalizedVenueName.includes(normalizedVenueQuery)) return false
    }

    // 開催形式フィルター
    if (filters.offlineOnly && event.isHybrid) return false
    if (filters.hybridOnly && !event.isHybrid) return false

    return true
  })
}

// 日付フォーマット
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// 日付範囲フォーマット
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start.getTime() === end.getTime()) {
    return formatDate(startDate)
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

// 検索クエリの正規化
export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[ー\-]/g, '')
    .replace(/[（）()]/g, '')
    .trim()
}

// カンファレンス名での検索
export function searchConferences(
  conferences: Conference[],
  searchQuery: string
): Conference[] {
  if (!searchQuery.trim()) {
    return conferences
  }

  const normalizedQuery = normalizeSearchQuery(searchQuery)

  return conferences.filter((conference) => {
    const normalizedName = normalizeSearchQuery(conference.name)
    return normalizedName.includes(normalizedQuery)
  })
}
