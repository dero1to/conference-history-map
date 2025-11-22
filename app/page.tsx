import { getConferences, getEventsWithVenues } from '@/lib/data'
import ConferenceMapWrapper from '@/components/ConferenceMapWrapper'

export default async function Home() {
  const conferences = await getConferences()
  const events = await getEventsWithVenues()

  return <ConferenceMapWrapper conferences={conferences} events={events} />
}
