import { z } from 'zod'

// カテゴリーのEnum（技術領域 + プログラミング言語）
export const CategorySchema = z.enum([
  // 技術領域
  'Web',
  // 'Mobile',
  'Backend',
  'Frontend',
  'DevOps',
  // 'AI/ML',
  // 'Data',
  // 'Security',
  'Cloud',
  'SRE',
  'Other',
])

export type Category = z.infer<typeof CategorySchema>

// プログラミング言語
export const ProgrammingLanguagesSchema = z.enum([
  'JavaScript',
  'TypeScript',
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
  'Other',
])

export type ProgrammingLanguages = z.infer<typeof ProgrammingLanguagesSchema>

// 会場情報
export const VenueSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  prefecture: z.string(),
})

export type Venue = z.infer<typeof VenueSchema>

// カンファレンスの基本情報
export const ConferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.array(CategorySchema),
  programmingLanguages: z.array(ProgrammingLanguagesSchema),
  website: z.string().url().optional(),
  twitter: z.string().optional(),
})

export type Conference = z.infer<typeof ConferenceSchema>

// 開催イベント情報
export const ConferenceEventSchema = z.object({
  conferenceId: z.string(),
  name: z.string(),
  year: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  venueId: z.string(),
  isHybrid: z.boolean().default(false),
  eventUrl: z.string().url().optional(),
})

export type ConferenceEvent = z.infer<typeof ConferenceEventSchema>

// 拡張されたイベント情報（会場情報を含む）
export type ConferenceEventWithVenue = ConferenceEvent & {
  venue: Venue
}

// 利用可能な値を取得するヘルパー関数
export const getAvailableCategories = (): Category[] => {
  return CategorySchema.options
}

export const getAvailableProgrammingLanguages = (): ProgrammingLanguages[] => {
  return ProgrammingLanguagesSchema.options
}

