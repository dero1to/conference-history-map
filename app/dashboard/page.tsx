import { getConferences, getEventsWithVenues } from '@/lib/data'
import DashboardCharts from '@/components/DashboardCharts'

export const metadata = {
    title: 'Dashboard | Conference History Map',
    description: 'Statistics about tech conferences in Japan',
}

export default async function DashboardPage() {
    const conferences = await getConferences()
    const events = await getEventsWithVenues()

    // Calculate Statistics
    const totalConferences = conferences.length
    const totalEvents = events.length

    // Unique venues
    const uniqueVenues = new Set(events.map(e => e.venueId)).size

    // Events per Year
    const eventsPerYearMap = new Map<number, number>()
    events.forEach(e => {
        const count = eventsPerYearMap.get(e.year) || 0
        eventsPerYearMap.set(e.year, count + 1)
    })
    const eventsPerYear = Array.from(eventsPerYearMap.entries())
        .map(([year, count]) => ({ name: year.toString(), value: count }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name))

    // Events per Prefecture
    const eventsPerPrefectureMap = new Map<string, number>()
    events.forEach(e => {
        const pref = e.venue.prefecture
        const count = eventsPerPrefectureMap.get(pref) || 0
        eventsPerPrefectureMap.set(pref, count + 1)
    })
    const eventsPerPrefecture = Array.from(eventsPerPrefectureMap.entries())
        .map(([pref, count]) => ({ name: pref, value: count }))
        .sort((a, b) => b.value - a.value)

    // Category Distribution
    const categoryMap = new Map<string, number>()
    conferences.forEach(c => {
        c.category.forEach(cat => {
            const count = categoryMap.get(cat) || 0
            categoryMap.set(cat, count + 1)
        })
    })
    const categoryDistribution = Array.from(categoryMap.entries())
        .map(([cat, count]) => ({ name: cat, value: count }))
        .sort((a, b) => b.value - a.value)

    // Language Distribution
    const languageMap = new Map<string, number>()
    conferences.forEach(c => {
        c.programmingLanguages.forEach(lang => {
            const count = languageMap.get(lang) || 0
            languageMap.set(lang, count + 1)
        })
    })
    const languageDistribution = Array.from(languageMap.entries())
        .map(([lang, count]) => ({ name: lang, value: count }))
        .sort((a, b) => b.value - a.value)

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Total Conferences</h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalConferences}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Total Events</h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalEvents}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase">Active Venues</h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{uniqueVenues}</p>
                </div>
            </div>

            {/* Charts */}
            <DashboardCharts
                eventsPerYear={eventsPerYear}
                eventsPerPrefecture={eventsPerPrefecture}
                categoryDistribution={categoryDistribution}
                languageDistribution={languageDistribution}
            />
        </div>
    )
}
