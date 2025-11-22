import { getConferences, getEventsWithVenues } from '@/lib/data'
import AllConferencesPage from '@/components/AllConferencesPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'カンファレンス一覧 | 日本IT技術カンファレンスマップ',
  description: '日本全国のIT技術カンファレンスの一覧と開催履歴を確認できます。',
}

export default async function ConferencesPage() {
  const [conferences, eventsWithVenues] = await Promise.all([
    getConferences(),
    getEventsWithVenues(),
  ])

  // カンファレンスごとの統計情報を計算
  const conferencesWithStats = conferences.map(conference => {
    const conferenceEvents = eventsWithVenues.filter(
      event => event.conferenceId === conference.id
    )
    
    const eventsByYear = conferenceEvents.map(e => e.year)
    const firstYear = eventsByYear.length > 0 ? Math.min(...eventsByYear) : null
    const lastYear = eventsByYear.length > 0 ? Math.max(...eventsByYear) : null
    const prefectures = [...new Set(conferenceEvents.map(e => e.venue.prefecture))]
    
    return {
      ...conference,
      stats: {
        totalEvents: conferenceEvents.length,
        firstYear,
        lastYear,
        prefectures: prefectures.length,
        latestEvent: conferenceEvents
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
      }
    }
  })
  
  // 名前順にソート
  conferencesWithStats.sort((a, b) => a.name.localeCompare(b.name, 'ja'))

  return <AllConferencesPage conferences={conferencesWithStats} />
}