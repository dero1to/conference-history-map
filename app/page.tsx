import { getConferences, getEvents } from '@/lib/data'
import ConferenceMapPage from '@/components/ConferenceMapPage'

export default async function Home() {
  const conferences = await getConferences()
  const events = await getEvents()

  return <ConferenceMapPage conferences={conferences} events={events} />
}
