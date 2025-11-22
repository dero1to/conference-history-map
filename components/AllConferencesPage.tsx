'use client'

import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, Users } from 'lucide-react'
import { Conference, ConferenceEventWithVenue } from '@/types/conference'

interface ConferenceWithStats extends Conference {
  stats: {
    totalEvents: number
    firstYear: number | null
    lastYear: number | null
    prefectures: number
    latestEvent?: ConferenceEventWithVenue
  }
}

interface AllConferencesPageProps {
  conferences: ConferenceWithStats[]
}

export default function AllConferencesPage({ conferences }: AllConferencesPageProps) {
  const formatYearRange = (firstYear: number | null, lastYear: number | null) => {
    if (!firstYear || !lastYear) return '-'
    if (firstYear === lastYear) return `${firstYear}`
    return `${firstYear} - ${lastYear}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            カンファレンス一覧
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            日本全国のIT技術カンファレンスの開催履歴を確認できます
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {conferences.map((conference) => (
            <Link
              key={conference.id}
              href={`/conference/${conference.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {conference.name}
                  </h2>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {conference.category.slice(0, 2).map(cat => (
                    <span
                      key={cat}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                    >
                      {cat}
                    </span>
                  ))}
                  {conference.programmingLanguages.slice(0, 2).map(lang => (
                    <span
                      key={lang}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs"
                    >
                      {lang}
                    </span>
                  ))}
                  {(conference.category.length + conference.programmingLanguages.length) > 4 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      +{(conference.category.length + conference.programmingLanguages.length) - 4}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatYearRange(conference.stats.firstYear, conference.stats.lastYear)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{conference.stats.totalEvents}回開催</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{conference.stats.prefectures}都道府県</span>
                  </div>
                </div>

                {conference.stats.latestEvent && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      最新開催: {conference.stats.latestEvent.name} 
                      <span className="ml-1">
                        ({new Date(conference.stats.latestEvent.startDate).getFullYear()})
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {conferences.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              カンファレンスが見つかりませんでした
            </p>
          </div>
        )}
      </div>
    </div>
  )
}