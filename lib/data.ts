import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import {
  Conference,
  ConferenceEvent,
  ConferenceEventWithVenue,
  Venue,
  ConferenceSchema,
  ConferenceEventSchema,
  VenueSchema,
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

// 会場データを読み込む
export async function getVenues(): Promise<Venue[]> {
  const venuesDir = join(process.cwd(), 'data', 'venues')

  try {
    const prefectureDirs = await readdir(venuesDir)
    const allVenues: Venue[] = []

    for (const prefectureDir of prefectureDirs) {
      const prefecturePath = join(venuesDir, prefectureDir)
      
      // ディレクトリかどうか確認
      const stat = await import('fs/promises').then(fs => fs.stat(prefecturePath))
      if (!stat.isDirectory()) continue

      const venuesFilePath = join(prefecturePath, 'venues.json')
      
      try {
        const content = await readFile(venuesFilePath, 'utf-8')
        const data = JSON.parse(content)
        
        if (Array.isArray(data)) {
          const venues = data.map((venue) => {
            // venueIdにprefecture prefixを追加
            const venueWithPrefix = {
              ...venue,
              id: `${prefectureDir}/${venue.id}`
            }
            return VenueSchema.parse(venueWithPrefix)
          })
          allVenues.push(...venues)
        }
      } catch (error) {
        console.warn(`Failed to load venues from ${prefectureDir}:`, error)
      }
    }

    return allVenues
  } catch (error) {
    console.error('Failed to load venues:', error)
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

// 会場情報を含むイベントデータを取得
export async function getEventsWithVenues(): Promise<ConferenceEventWithVenue[]> {
  const [events, venues] = await Promise.all([getEvents(), getVenues()])
  
  const venueMap = new Map<string, Venue>()
  venues.forEach(venue => {
    venueMap.set(venue.id, venue)
  })

  return events.map(event => {
    const venue = venueMap.get(event.venueId)
    if (!venue) {
      throw new Error(`Venue not found for venueId: ${event.venueId}`)
    }
    
    return {
      ...event,
      venue
    }
  })
}

