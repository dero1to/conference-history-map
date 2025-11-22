import { Suspense } from 'react'
import ConferenceMapPage from './ConferenceMapPage'
import type { Conference, ConferenceEventWithVenue } from '@/types/conference'

interface ConferenceMapWrapperProps {
  conferences: Conference[]
  events: ConferenceEventWithVenue[]
}

function MapLoadingFallback() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* サイドバーのスケルトン */}
      <div className="lg:w-80 flex-shrink-0 space-y-4">
        {/* フィルターパネルのスケルトン */}
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {/* 検索フィールドのスケルトン */}
            <div>
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
            {/* フィルターオプションのスケルトン */}
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-8 w-16 bg-gray-100 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 統計情報のスケルトン */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 地図エリアのスケルトン */}
      <div className="flex-1 rounded-lg shadow-md bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">地図とフィルターを読み込み中...</p>
        </div>
      </div>
    </div>
  )
}

export default function ConferenceMapWrapper({
  conferences,
  events,
}: ConferenceMapWrapperProps) {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <ConferenceMapPage conferences={conferences} events={events} />
    </Suspense>
  )
}