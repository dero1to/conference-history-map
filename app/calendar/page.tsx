import { Suspense } from 'react'
import { getConferences, getEventsWithVenues } from '@/lib/data'
import EventCalendarPage from '@/components/EventCalendarPage'

export const metadata = {
  title: 'イベントカレンダー | JP Conference History Map',
  description: 'カレンダー形式で日本のIT技術カンファレンスの開催スケジュールを確認できます',
}

export default async function CalendarPage() {
  const conferences = await getConferences()
  const events = await getEventsWithVenues()

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">読み込み中...</div>}>
      <EventCalendarPage conferences={conferences} events={events} />
    </Suspense>
  )
}
