import { z } from 'zod'

// カテゴリーのEnum（技術領域 + プログラミング言語）
export const CategorySchema = z.enum([
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
  'Design',
  'Testing',
  'IoT',
  'Game',
])

export type Category = z.infer<typeof CategorySchema>

// プログラミング言語
export const ProgrammingLanguagesSchema = z.enum([
  // 'JavaScript',
  // 'TypeScript',
  'PHP',
  'Ruby',
  // 'Python',
  // 'Go',
  // 'Rust',
  // 'Java',
  // 'Kotlin',
  // 'Swift',
  // 'C#',
  // 'C++',
])

export type ProgrammingLanguages = z.infer<typeof ProgrammingLanguagesSchema>

// 開催地情報
export const LocationSchema = z.object({
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  prefecture: z.string(),
})

export type Location = z.infer<typeof LocationSchema>

// カンファレンスの基本情報
export const ConferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.array(CategorySchema),
  programmingLanguages: z.array(ProgrammingLanguagesSchema),
  website: z.string().url().optional(),
  twitter: z.string().optional(),
})

export type Conference = z.infer<typeof ConferenceSchema>

// 開催イベント情報
export const ConferenceEventSchema = z.object({
  conferenceId: z.string(),
  year: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  location: LocationSchema,
  attendees: z.number().optional(),
  isOnline: z.boolean().default(false),
  isHybrid: z.boolean().default(false),
  eventUrl: z.string().url().optional(),
})

export type ConferenceEvent = z.infer<typeof ConferenceEventSchema>

// フィルター用の型
export interface ConferenceFilters {
  years: number[]
  categories: Category[]
  programmingLanguages: ProgrammingLanguages[]
  prefectures: string[]
  onlineOnly: boolean
  offlineOnly: boolean
}
