import { type ClassValue, clsx } from 'clsx'
import { Conference, ConferenceEvent, Category, ProgrammingLanguages } from '@/types/conference'

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
    Cloud: '#14B8A6', // teal
    General: '#6B7280', // gray
    Design: '#F97316', // orange
    Testing: '#84CC16', // lime
    IoT: '#A855F7', // purple
    Game: '#F43F5E', // rose
  }
  return colorMap[category] || colorMap.General
}

export function getProgrammingLanguageColor(language: ProgrammingLanguages): string {
  const colorMap: Record<ProgrammingLanguages, string> = {
    // プログラミング言語
    JavaScript: '#F7DF1E', // yellow
    TypeScript: '#3178C6', // blue
    PHP: '#777BB4', // purple
    Ruby: '#CC342D' // red
    // Python: '#3776AB', // blue
    // Go: '#00ADD8', // cyan
    // Rust: '#CE422B', // orange-red
    // Java: '#007396', // blue
    // Kotlin: '#7F52FF', // purple
    // Swift: '#FA7343', // orange
    // 'C#': '#239120', // green
    // 'C++': '#00599C', // blue
  }
  return colorMap[language] || '#6B7280' // default gray
}

// 都道府県リストを取得
export function getPrefectures(events: ConferenceEvent[]): string[] {
  const prefectures = new Set<string>()
  events.forEach((event) => {
    prefectures.add(event.location.prefecture)
  })
  return Array.from(prefectures).sort()
}

// 年度リストを取得
export function getYears(events: ConferenceEvent[]): number[] {
  const years = new Set<number>()
  events.forEach((event) => {
    years.add(event.year)
  })
  return Array.from(years).sort((a, b) => b - a)
}

// フィルタリング処理
export function filterEvents(
  events: ConferenceEvent[],
  conferences: Conference[],
  filters: {
    years?: number[]
    categories?: Category[]
    programmingLanguages?: ProgrammingLanguages[]
    prefectures?: string[]
    onlineOnly?: boolean
    offlineOnly?: boolean
  }
): ConferenceEvent[] {
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
      if (!filters.prefectures.includes(event.location.prefecture)) return false
    }

    // オンライン/オフラインフィルター
    if (filters.onlineOnly && !event.isOnline && !event.isHybrid) return false
    if (filters.offlineOnly && event.isOnline) return false

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
