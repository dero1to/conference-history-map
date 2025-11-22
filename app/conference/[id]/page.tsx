import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getConferences, getEventsWithVenues } from '@/lib/data'
import ConferenceHistoryPage from '@/components/ConferenceHistoryPage'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const conferences = await getConferences()
  const conference = conferences.find(c => c.id === id)
  
  if (!conference) {
    return {
      title: 'カンファレンスが見つかりません | JP Conference History Map',
    }
  }

  return {
    title: `${conference.name}の歴史 | JP Conference History Map`,
    description: `${conference.name}の開催履歴と詳細情報を確認できます。`,
  }
}

export async function generateStaticParams() {
  const conferences = await getConferences()
  return conferences.map(conference => ({
    id: conference.id,
  }))
}

export default async function ConferenceDetailPage({ params }: Props) {
  const { id } = await params
  
  const [conferences, eventsWithVenues] = await Promise.all([
    getConferences(),
    getEventsWithVenues(),
  ])

  const conference = conferences.find(c => c.id === id)
  
  if (!conference) {
    notFound()
  }

  const conferenceEvents = eventsWithVenues
    .filter(event => event.conferenceId === id)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  return (
    <ConferenceHistoryPage 
      conference={conference} 
      events={conferenceEvents} 
    />
  )
}