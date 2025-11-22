import { getConferences, getEvents } from '@/lib/data'
import ConferenceMapWrapper from '@/components/ConferenceMapWrapper'

export default async function Home() {
  const conferences = await getConferences()
  const events = await getEvents()

  return <ConferenceMapWrapper conferences={conferences} events={events} />
}
