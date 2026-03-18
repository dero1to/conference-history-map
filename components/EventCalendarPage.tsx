'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Conference, ConferenceEventWithVenue } from '@/types/conference'
import { formatDateRange } from '@/lib/utils'
import { getCategoryColor } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getJapaneseHolidays } from '@/lib/holidays'

const WEEKDAYS = ['火', '水', '木', '金', '土', '日', '月']
const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

interface Props {
  conferences: Conference[]
  events: ConferenceEventWithVenue[]
}

interface CalendarEvent {
  event: ConferenceEventWithVenue
  conference: Conference
}

interface EventBand {
  calendarEvent: CalendarEvent
  startCol: number
  endCol: number
  isStart: boolean
  isEnd: boolean
  lane: number
}

const MAX_VISIBLE_LANES = 3
const BAND_HEIGHT = 20
const BAND_GAP = 2

export default function EventCalendarPage({ conferences, events }: Props) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const conferenceMap = useMemo(() => {
    const map = new Map<string, Conference>()
    conferences.forEach(c => map.set(c.id, c))
    return map
  }, [conferences])

  // Build a map of date -> events for the current month
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()

    events.forEach(event => {
      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      const conference = conferenceMap.get(event.conferenceId)
      if (!conference) return

      // Iterate over each day the event spans
      const d = new Date(start)
      while (d <= end) {
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          const existing = map.get(key) || []
          // Avoid duplicates (same event on same day)
          if (!existing.some(e => e.event.conferenceId === event.conferenceId && e.event.startDate === event.startDate)) {
            existing.push({ event, conference })
          }
          map.set(key, existing)
        }
        d.setDate(d.getDate() + 1)
      }
    })

    return map
  }, [events, conferenceMap, currentYear, currentMonth])

  // Available years for the year selector
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    events.forEach(e => years.add(e.year))
    return Array.from(years).sort((a, b) => a - b)
  }, [events])

  // Calendar grid calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  // Convert Sunday=0 to Tuesday-based (Tue=0, Wed=1, ..., Mon=6)
  const startDayOfWeek = (firstDayOfMonth.getDay() + 5) % 7
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  // Split calendarDays into weeks
  const weeks = useMemo(() => {
    const result: (number | null)[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      const week = calendarDays.slice(i, i + 7)
      while (week.length < 7) week.push(null)
      result.push(week)
    }
    return result
  }, [calendarDays])

  // Compute event bands for each week
  const weekBands = useMemo(() => {
    // Collect unique events visible in this month
    const monthEvents: { ce: CalendarEvent; firstDay: number; lastDay: number; eventStart: Date; eventEnd: Date }[] = []
    const seen = new Set<string>()

    events.forEach(event => {
      const conference = conferenceMap.get(event.conferenceId)
      if (!conference) return
      const eventKey = `${event.conferenceId}-${event.startDate}`
      if (seen.has(eventKey)) return
      seen.add(eventKey)

      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      const monthFirst = new Date(currentYear, currentMonth, 1)
      const monthLast = new Date(currentYear, currentMonth + 1, 0)

      if (start > monthLast || end < monthFirst) return

      const visibleStart = start < monthFirst ? monthFirst : start
      const visibleEnd = end > monthLast ? monthLast : end

      monthEvents.push({
        ce: { event, conference },
        firstDay: visibleStart.getDate(),
        lastDay: visibleEnd.getDate(),
        eventStart: start,
        eventEnd: end,
      })
    })

    // Sort events: earlier start first, then longer spans first
    monthEvents.sort((a, b) => {
      if (a.firstDay !== b.firstDay) return a.firstDay - b.firstDay
      return (b.lastDay - b.firstDay) - (a.lastDay - a.firstDay)
    })

    return weeks.map(week => {
      const bands: EventBand[] = []

      monthEvents.forEach(({ ce, firstDay, lastDay, eventStart, eventEnd }) => {
        let startCol = -1
        let endCol = -1

        week.forEach((day, col) => {
          if (day !== null && day >= firstDay && day <= lastDay) {
            if (startCol === -1) startCol = col
            endCol = col
          }
        })

        if (startCol === -1) return

        const isStart = week[startCol] === eventStart.getDate() &&
                        currentMonth === eventStart.getMonth() &&
                        currentYear === eventStart.getFullYear()
        const isEnd = week[endCol] === eventEnd.getDate() &&
                      currentMonth === eventEnd.getMonth() &&
                      currentYear === eventEnd.getFullYear()

        bands.push({ calendarEvent: ce, startCol, endCol, isStart, isEnd, lane: 0 })
      })

      // Greedy lane assignment
      const laneEnds: number[] = []
      bands.forEach(band => {
        let lane = 0
        while (lane < laneEnds.length && laneEnds[lane] >= band.startCol) lane++
        band.lane = lane
        if (lane < laneEnds.length) laneEnds[lane] = band.endCol
        else laneEnds.push(band.endCol)
      })

      return bands
    })
  }, [weeks, events, conferenceMap, currentYear, currentMonth])

  // Events for the selected date
  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) || [] : []

  // Count of events in this month
  const monthEventCount = useMemo(() => {
    let count = 0
    eventsByDate.forEach(evts => { count += evts.length })
    return count
  }, [eventsByDate])

  // 日本の祝日マップ
  const holidays = useMemo(() => getJapaneseHolidays(currentYear), [currentYear])

  function goToPrevMonth() {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  function goToToday() {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDate(null)
  }

  function handleYearChange(year: number) {
    setCurrentYear(year)
    setSelectedDate(null)
  }

  function handleMonthChange(month: number) {
    setCurrentMonth(month)
    setSelectedDate(null)
  }

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            イベントカレンダー
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentYear}年{MONTH_NAMES[currentMonth]}のイベント: {monthEventCount}件
          </p>
        </div>
        <button
          onClick={goToToday}
          className="self-start px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          今日
        </button>
      </div>

      {/* Year/Month Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
            aria-label="前月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <select
              value={currentYear}
              onChange={e => handleYearChange(Number(e.target.value))}
              className="bg-transparent text-lg font-bold text-gray-900 dark:text-gray-100 border-none focus:ring-0 cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
            <select
              value={currentMonth}
              onChange={e => handleMonthChange(Number(e.target.value))}
              className="bg-transparent text-lg font-bold text-gray-900 dark:text-gray-100 border-none focus:ring-0 cursor-pointer"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
            aria-label="翌月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-t border-gray-200 dark:border-gray-700">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                i === 4 ? 'text-blue-500' : i === 5 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          {weeks.map((week, weekIdx) => {
            const bands = weekBands[weekIdx]
            const maxLane = bands.length > 0 ? Math.max(...bands.map(b => b.lane)) : -1
            const visibleLanes = Math.min(maxLane + 1, MAX_VISIBLE_LANES)
            const bandRows = visibleLanes > 0
              ? ` ${Array(visibleLanes).fill(`${BAND_HEIGHT + BAND_GAP}px`).join(' ')}`
              : ''

            return (
              <div
                key={weekIdx}
                className="grid grid-cols-7"
                style={{
                  gridTemplateRows: `auto${bandRows} 1fr`,
                  minHeight: 80,
                }}
              >
                {/* Day cell backgrounds & click targets - span all rows */}
                {week.map((day, col) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${weekIdx}-${col}`}
                        className="border-b border-r border-gray-100 dark:border-gray-700/50"
                        style={{ gridColumn: col + 1, gridRow: '1 / -1' }}
                      />
                    )
                  }

                  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isSelected = dateKey === selectedDate

                  return (
                    <button
                      key={`cell-${col}`}
                      onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                      className={`border-b border-r border-gray-100 dark:border-gray-700/50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      style={{ gridColumn: col + 1, gridRow: '1 / -1' }}
                    />
                  )
                })}

                {/* Date headers - row 1 only, layered on top */}
                {week.map((day, col) => {
                  if (day === null) return null

                  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isToday = dateKey === todayKey
                  const dayOfWeek = (startDayOfWeek + day - 1) % 7
                  const holidayName = holidays.get(dateKey)
                  const overflowCount = bands.filter(b => b.lane >= MAX_VISIBLE_LANES && col >= b.startCol && col <= b.endCol).length

                  return (
                    <div
                      key={`date-${col}`}
                      className="p-1 pointer-events-none"
                      style={{ gridColumn: col + 1, gridRow: 1 }}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${
                          isToday
                            ? 'bg-blue-500 text-white font-bold'
                            : holidayName
                              ? 'text-red-500'
                              : dayOfWeek === 4
                                ? 'text-blue-500'
                                : dayOfWeek === 5
                                  ? 'text-red-500'
                                  : 'text-gray-700 dark:text-gray-300'
                        }`}
                        title={holidayName}
                      >
                        {day}
                      </span>
                      {holidayName && (
                        <div className="text-[9px] sm:text-[10px] leading-tight text-red-500 truncate px-0.5">
                          {holidayName}
                        </div>
                      )}
                      {overflowCount > 0 && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1 mt-1">
                          +{overflowCount}件
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Event bands - rows 2+ */}
                {bands.filter(b => b.lane < MAX_VISIBLE_LANES).map((band, i) => {
                  const color = getCategoryColor(band.calendarEvent.conference.category[0])
                  return (
                    <div
                      key={`band-${i}`}
                      className="pointer-events-none text-[10px] sm:text-xs leading-[18px] text-white truncate px-1.5 mx-0.5 my-[1px]"
                      style={{
                        gridColumn: `${band.startCol + 1} / ${band.endCol + 2}`,
                        gridRow: band.lane + 2,
                        backgroundColor: color,
                        borderTopLeftRadius: band.isStart ? 4 : 0,
                        borderBottomLeftRadius: band.isStart ? 4 : 0,
                        borderTopRightRadius: band.isEnd ? 4 : 0,
                        borderBottomRightRadius: band.isEnd ? 4 : 0,
                      }}
                      title={band.calendarEvent.event.name}
                    >
                      {(band.isStart || band.startCol === 0) ? band.calendarEvent.event.name : '\u00A0'}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
            {holidays.get(selectedDate) && (
              <span className="ml-2 text-sm font-medium text-red-500">
                {holidays.get(selectedDate)}
              </span>
            )}
          </h2>
          {selectedEvents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">この日に開催されるイベントはありません</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((ce, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div
                    className="w-1 self-stretch rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(ce.conference.category[0]) }}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/conference/${ce.conference.id}`}
                      className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {ce.event.name}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDateRange(ce.event.startDate, ce.event.endDate)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ce.event.venue.name} ({ce.event.venue.prefecture})
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ce.conference.category.map(cat => (
                        <span
                          key={cat}
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: getCategoryColor(cat) }}
                        >
                          {cat}
                        </span>
                      ))}
                      {ce.event.isHybrid && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          Hybrid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
