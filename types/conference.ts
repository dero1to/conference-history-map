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
  'Network',
  'Cloud',
  'SRE',
  'OS',
  'Framework',
  'Tooling',
  'General',
  'Other',
])

export type Category = z.infer<typeof CategorySchema>

// プログラミング言語
export const ProgrammingLanguagesSchema = z.enum([
  'JavaScript',
  'TypeScript',
  'PHP',
  'Ruby',
  'Python',
  'Go',
  'Rust',
  'Java',
  'Kotlin',
  'Swift',
  'C#',
  'C++',
  'Polyglot',
  'Other',
])

export type ProgrammingLanguages = z.infer<typeof ProgrammingLanguagesSchema>

export const PrefecturesSchema = z.enum([
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
])

export type Prefectures = z.infer<typeof PrefecturesSchema>

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

export const getAvailablePrefectures = (): Prefectures[] => {
  return PrefecturesSchema.options
}
