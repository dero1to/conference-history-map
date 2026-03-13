import holiday_jp from '@holiday-jp/holiday_jp'

function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 指定した年の日本の祝日一覧を返す (date key -> 祝日名)
 */
export function getJapaneseHolidays(year: number): Map<string, string> {
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  const holidays = holiday_jp.between(start, end)

  const map = new Map<string, string>()
  for (const h of holidays) {
    const date = h.date as unknown as Date
    map.set(formatDateKey(date), h.name)
  }
  return map
}
