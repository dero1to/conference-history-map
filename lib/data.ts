import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import {
  Conference,
  ConferenceEvent,
  ConferenceSchema,
  ConferenceEventSchema,
} from '@/types/conference'

// カンファレンスデータを読み込む
export async function getConferences(): Promise<Conference[]> {
  const conferencesDir = join(process.cwd(), 'data', 'conferences')

  try {
    const files = await readdir(conferencesDir)
    const jsonFiles = files.filter((file) => file.endsWith('.json'))

    const conferences = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = join(conferencesDir, file)
        const content = await readFile(filePath, 'utf-8')
        const data = JSON.parse(content)
        return ConferenceSchema.parse(data)
      })
    )

    return conferences
  } catch (error) {
    console.error('Failed to load conferences:', error)
    return []
  }
}

// イベントデータを読み込む
export async function getEvents(): Promise<ConferenceEvent[]> {
  const eventsDir = join(process.cwd(), 'data', 'events')

  try {
    const files = await readdir(eventsDir)
    const jsonFiles = files.filter((file) => file.endsWith('.json'))

    const allEvents: ConferenceEvent[] = []

    for (const file of jsonFiles) {
      const filePath = join(eventsDir, file)
      const content = await readFile(filePath, 'utf-8')
      const data = JSON.parse(content)

      if (Array.isArray(data)) {
        const events = data.map((event) => ConferenceEventSchema.parse(event))
        allEvents.push(...events)
      }
    }

    return allEvents
  } catch (error) {
    console.error('Failed to load events:', error)
    return []
  }
}

// 特定のカンファレンスのイベント履歴を取得
export async function getConferenceHistory(
  conferenceId: string
): Promise<ConferenceEvent[]> {
  const events = await getEvents()
  return events
    .filter((event) => event.conferenceId === conferenceId)
    .sort((a, b) => b.year - a.year)
}

// 特定の年のイベントを取得
export async function getEventsByYear(year: number): Promise<ConferenceEvent[]> {
  const events = await getEvents()
  return events.filter((event) => event.year === year)
}
