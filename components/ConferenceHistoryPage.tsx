'use client'

import Link from 'next/link'
import { Calendar, MapPin, Globe, Twitter, ArrowLeft, ExternalLink, Users } from 'lucide-react'
import { Conference, ConferenceEventWithVenue } from '@/types/conference'

interface ConferenceHistoryPageProps {
  conference: Conference
  events: ConferenceEventWithVenue[]
}

export default function ConferenceHistoryPage({
  conference,
  events
}: ConferenceHistoryPageProps) {
  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (startDate === endDate) {
      return start.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else {
      return `${start.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} - ${end.toLocaleDateString('ja-JP', {
        month: 'long',
        day: 'numeric'
      })}`
    }
  }

  const getEventStats = () => {
    const totalEvents = events.length
    const years = events.map(e => e.year)
    const firstYear = Math.min(...years)
    const lastYear = Math.max(...years)
    const prefectures = [...new Set(events.map(e => e.venue.prefecture))]
    
    return {
      totalEvents,
      yearRange: totalEvents > 0 ? `${firstYear} - ${lastYear}` : '-',
      prefectures: prefectures.length
    }
  }

  const stats = getEventStats()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            マップに戻る
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {conference.name}
                </h1>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{stats.yearRange}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="w-5 h-5 mr-2" />
                    <span>{stats.totalEvents}回開催</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{stats.prefectures}都道府県</span>
                  </div>
                </div>

                {/* カテゴリータグ */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {conference.category.map(cat => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {cat}
                    </span>
                  ))}
                  {conference.programmingLanguages.map(lang => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* 外部リンク */}
              <div className="flex flex-col gap-3">
                {conference.website && (
                  <a
                    href={conference.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    公式サイト
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}
                {conference.twitter && (
                  <a
                    href={`https://twitter.com/${conference.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 開催履歴 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              開催履歴
            </h2>
          </div>
          
          {events.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              開催履歴がありません
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((event) => (
                <div key={event.name} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {event.name}
                        </h3>
                        {event.isHybrid && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                            ハイブリッド
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(event.startDate, event.endDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.venue.name}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {event.venue.address}
                      </p>
                    </div>
                    
                    {event.eventUrl && (
                      <div className="flex-shrink-0">
                        <a
                          href={event.eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          イベントページ
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}