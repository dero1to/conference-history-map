import type { Category, ProgrammingLanguages } from '@/types/conference'

export interface FilterParams {
  years: number[]
  categories: Category[]
  programmingLanguages: ProgrammingLanguages[]
  prefectures: string[]
  onlineOnly: boolean
  offlineOnly: boolean
  searchQuery: string
}

const ALLOWED_CATEGORIES: Category[] = [
  'Web', 'Mobile', 'Backend', 'Frontend', 'DevOps', 'AI/ML', 
  'Data', 'Security', 'Cloud', 'General', 'Design', 'Testing', 'IoT', 'Game'
]

const ALLOWED_LANGUAGES: ProgrammingLanguages[] = [
  'JavaScript', 'TypeScript', 'PHP', 'Ruby'
]

function sanitizeString(value: string): string {
  if (typeof value !== 'string') return ''
  
  return value
    .replace(/[<>&"']/g, (char) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      }
      return escapeMap[char] || char
    })
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 100)
}

function parseYears(value: string | string[] | null): number[] {
  if (!value) return []
  
  const yearStrings = Array.isArray(value) ? value : [value]
  const years: number[] = []
  
  for (const yearStr of yearStrings) {
    const year = parseInt(yearStr, 10)
    if (!isNaN(year) && year >= 2000 && year <= 2030) {
      years.push(year)
    }
  }
  
  return [...new Set(years)].sort()
}

function parseCategories(value: string | string[] | null): Category[] {
  if (!value) return []
  
  const categoryStrings = Array.isArray(value) ? value : [value]
  const categories: Category[] = []
  
  for (const categoryStr of categoryStrings) {
    const sanitized = sanitizeString(categoryStr) as Category
    if (ALLOWED_CATEGORIES.includes(sanitized)) {
      categories.push(sanitized)
    }
  }
  
  return [...new Set(categories)]
}

function parseProgrammingLanguages(value: string | string[] | null): ProgrammingLanguages[] {
  if (!value) return []
  
  const languageStrings = Array.isArray(value) ? value : [value]
  const languages: ProgrammingLanguages[] = []
  
  for (const langStr of languageStrings) {
    const sanitized = sanitizeString(langStr) as ProgrammingLanguages
    if (ALLOWED_LANGUAGES.includes(sanitized)) {
      languages.push(sanitized)
    }
  }
  
  return [...new Set(languages)]
}

function parsePrefectures(value: string | string[] | null): string[] {
  if (!value) return []
  
  const prefectureStrings = Array.isArray(value) ? value : [value]
  const prefectures: string[] = []
  
  for (const prefStr of prefectureStrings) {
    const sanitized = sanitizeString(prefStr)
    if (sanitized && sanitized.length <= 10) {
      prefectures.push(sanitized)
    }
  }
  
  return [...new Set(prefectures)]
}

function parseBoolean(value: string | null): boolean {
  if (!value) return false
  return value.toLowerCase() === 'true' || value === '1'
}

export function parseUrlParams(searchParams: URLSearchParams): FilterParams {
  return {
    years: parseYears(searchParams.getAll('years')),
    categories: parseCategories(searchParams.getAll('categories')),
    programmingLanguages: parseProgrammingLanguages(searchParams.getAll('languages')),
    prefectures: parsePrefectures(searchParams.getAll('prefectures')),
    onlineOnly: parseBoolean(searchParams.get('online')),
    offlineOnly: parseBoolean(searchParams.get('offline')),
    searchQuery: sanitizeString(searchParams.get('search') || ''),
  }
}

export function createUrlParams(filters: FilterParams): URLSearchParams {
  const params = new URLSearchParams()
  
  if (filters.years.length > 0) {
    filters.years.forEach(year => params.append('years', year.toString()))
  }
  
  if (filters.categories.length > 0) {
    filters.categories.forEach(category => params.append('categories', category))
  }
  
  if (filters.programmingLanguages.length > 0) {
    filters.programmingLanguages.forEach(lang => params.append('languages', lang))
  }
  
  if (filters.prefectures.length > 0) {
    filters.prefectures.forEach(prefecture => params.append('prefectures', prefecture))
  }
  
  if (filters.onlineOnly) {
    params.set('online', 'true')
  }
  
  if (filters.offlineOnly) {
    params.set('offline', 'true')
  }
  
  if (filters.searchQuery.trim()) {
    params.set('search', filters.searchQuery.trim())
  }
  
  return params
}

export function updateUrlWithParams(filters: FilterParams, replace = false): void {
  if (typeof window === 'undefined') return
  
  const params = createUrlParams(filters)
  const url = new URL(window.location.href)
  url.search = params.toString()
  
  if (replace) {
    window.history.replaceState({}, '', url.toString())
  } else {
    window.history.pushState({}, '', url.toString())
  }
}