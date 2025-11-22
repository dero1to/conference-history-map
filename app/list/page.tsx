import { Suspense } from 'react'
import { getConferences, getEventsWithVenues } from '@/lib/data'
import ConferenceListPage from '@/components/ConferenceListPage'

export default async function ListPage() {
  const conferences = await getConferences()
  const events = await getEventsWithVenues()

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">読み込み中...</div>}>
      <ConferenceListPage conferences={conferences} events={events} />
    </Suspense>
  )
}