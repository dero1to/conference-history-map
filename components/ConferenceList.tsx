'use client'

import Link from 'next/link'
import type { Conference, ConferenceEventWithVenue } from '@/types/conference'

interface ConferenceListProps {
  events: ConferenceEventWithVenue[]
  conferences: Conference[]
}

export default function ConferenceList({ events, conferences }: ConferenceListProps) {
  const getConferenceById = (id: string) => {
    return conferences.find(conf => conf.id === id)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP')
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        条件に一致するイベントが見つかりませんでした
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              カンファレンス
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              会場
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              開催日
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              形式
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {events.map((event) => {
            const conference = getConferenceById(event.conferenceId)
            if (!conference) return null

            return (
              <tr key={`${event.conferenceId}-${event.year}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {conference.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {event.year}年
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/?venue=${event.venue.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
                  >
                    {event.venue.name}
                  </Link>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {event.venue.prefecture}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(event.startDate)}
                  {event.startDate !== event.endDate && (
                    <span> - {formatDate(event.endDate)}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.isHybrid ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      ハイブリッド
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      オフライン
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}