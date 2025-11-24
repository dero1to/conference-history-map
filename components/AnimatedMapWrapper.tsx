'use client'

import dynamic from 'next/dynamic'
import type { ConferenceEventWithVenue, Conference } from '@/types/conference'

const AnimatedMap = dynamic(() => import('@/components/AnimatedMap'), {
    ssr: false,
    loading: () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-[600px] flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">マップを読み込み中...</p>
        </div>
    )
})

interface AnimatedMapWrapperProps {
    events: ConferenceEventWithVenue[]
    conferences: Conference[]
}

export default function AnimatedMapWrapper({ events, conferences }: AnimatedMapWrapperProps) {
    return <AnimatedMap events={events} conferences={conferences} />
}
