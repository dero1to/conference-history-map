/**
 * 日本の祝日を計算するユーティリティ
 * 「国民の祝日に関する法律」に基づく
 */

interface Holiday {
  date: string // YYYY-MM-DD
  name: string
}

/**
 * 春分日の近似計算
 */
function getVernalEquinoxDay(year: number): number {
  if (year <= 1947) return 21
  if (year <= 1979) return Math.floor(20.8357 + 0.242194 * (year - 1980) - Math.floor((year - 1983) / 4))
  if (year <= 2099) return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
  return Math.floor(21.851 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
}

/**
 * 秋分日の近似計算
 */
function getAutumnalEquinoxDay(year: number): number {
  if (year <= 1947) return 23
  if (year <= 1979) return Math.floor(23.2588 + 0.242194 * (year - 1980) - Math.floor((year - 1983) / 4))
  if (year <= 2099) return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
  return Math.floor(24.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
}

/**
 * 第N月曜日の日付を返す
 */
function getNthMonday(year: number, month: number, n: number): number {
  const first = new Date(year, month, 1)
  // 最初の月曜日までの日数
  const firstMonday = ((8 - first.getDay()) % 7) || 7
  return firstMonday + (n - 1) * 7
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * 指定した年の日本の祝日一覧を返す
 */
export function getJapaneseHolidays(year: number): Map<string, string> {
  const holidays: Holiday[] = []

  // 元日 (1/1)
  holidays.push({ date: formatDateKey(year, 0, 1), name: '元日' })

  // 成人の日 (1月第2月曜日) ※2000年～
  if (year >= 2000) {
    holidays.push({ date: formatDateKey(year, 0, getNthMonday(year, 0, 2)), name: '成人の日' })
  } else if (year >= 1949) {
    holidays.push({ date: formatDateKey(year, 0, 15), name: '成人の日' })
  }

  // 建国記念の日 (2/11)
  if (year >= 1967) {
    holidays.push({ date: formatDateKey(year, 1, 11), name: '建国記念の日' })
  }

  // 天皇誕生日 (2/23) ※2020年～
  if (year >= 2020) {
    holidays.push({ date: formatDateKey(year, 1, 23), name: '天皇誕生日' })
  }

  // 春分の日
  if (year >= 1949) {
    holidays.push({ date: formatDateKey(year, 2, getVernalEquinoxDay(year)), name: '春分の日' })
  }

  // 昭和の日 (4/29)
  if (year >= 2007) {
    holidays.push({ date: formatDateKey(year, 3, 29), name: '昭和の日' })
  } else if (year >= 1989) {
    holidays.push({ date: formatDateKey(year, 3, 29), name: 'みどりの日' })
  } else if (year >= 1949) {
    holidays.push({ date: formatDateKey(year, 3, 29), name: '天皇誕生日' })
  }

  // 憲法記念日 (5/3)
  if (year >= 1949) {
    holidays.push({ date: formatDateKey(year, 4, 3), name: '憲法記念日' })
  }

  // みどりの日 (5/4) ※2007年～
  if (year >= 2007) {
    holidays.push({ date: formatDateKey(year, 4, 4), name: 'みどりの日' })
  }

  // こどもの日 (5/5)
  if (year >= 1949) {
    holidays.push({ date: formatDateKey(year, 4, 5), name: 'こどもの日' })
  }

  // 海の日 (7月第3月曜日) ※2003年～
  if (year === 2021) {
    holidays.push({ date: formatDateKey(year, 6, 22), name: '海の日' })
  } else if (year === 2020) {
    holidays.push({ date: formatDateKey(year, 6, 23), name: '海の日' })
  } else if (year >= 2003) {
    holidays.push({ date: formatDateKey(year, 6, getNthMonday(year, 6, 3)), name: '海の日' })
  } else if (year >= 1996) {
    holidays.push({ date: formatDateKey(year, 6, 20), name: '海の日' })
  }

  // 山の日 (8/11) ※2016年～
  if (year === 2021) {
    holidays.push({ date: formatDateKey(year, 7, 8), name: '山の日' })
  } else if (year === 2020) {
    holidays.push({ date: formatDateKey(year, 7, 10), name: '山の日' })
  } else if (year >= 2016) {
    holidays.push({ date: formatDateKey(year, 7, 11), name: '山の日' })
  }

  // 敬老の日 (9月第3月曜日) ※2003年～
  if (year >= 2003) {
    holidays.push({ date: formatDateKey(year, 8, getNthMonday(year, 8, 3)), name: '敬老の日' })
  } else if (year >= 1966) {
    holidays.push({ date: formatDateKey(year, 8, 15), name: '敬老の日' })
  }

  // 秋分の日
  if (year >= 1948) {
    holidays.push({ date: formatDateKey(year, 8, getAutumnalEquinoxDay(year)), name: '秋分の日' })
  }

  // スポーツの日 / 体育の日 (10月第2月曜日)
  if (year === 2021) {
    holidays.push({ date: formatDateKey(year, 6, 23), name: 'スポーツの日' })
  } else if (year === 2020) {
    holidays.push({ date: formatDateKey(year, 6, 24), name: 'スポーツの日' })
  } else if (year >= 2020) {
    holidays.push({ date: formatDateKey(year, 9, getNthMonday(year, 9, 2)), name: 'スポーツの日' })
  } else if (year >= 2000) {
    holidays.push({ date: formatDateKey(year, 9, getNthMonday(year, 9, 2)), name: '体育の日' })
  } else if (year >= 1966) {
    holidays.push({ date: formatDateKey(year, 9, 10), name: '体育の日' })
  }

  // 文化の日 (11/3)
  if (year >= 1948) {
    holidays.push({ date: formatDateKey(year, 10, 3), name: '文化の日' })
  }

  // 勤労感謝の日 (11/23)
  if (year >= 1948) {
    holidays.push({ date: formatDateKey(year, 10, 23), name: '勤労感謝の日' })
  }

  // 振替休日の計算: 祝日が日曜日の場合、次の平日が振替休日
  const holidayMap = new Map<string, string>()
  holidays.forEach(h => holidayMap.set(h.date, h.name))

  const substituteHolidays: Holiday[] = []
  holidays.forEach(h => {
    const d = new Date(h.date + 'T00:00:00')
    if (d.getDay() === 0) {
      // 日曜日 → 次の月曜日以降で祝日でない日を振替休日にする
      const sub = new Date(d)
      sub.setDate(sub.getDate() + 1)
      while (holidayMap.has(formatDateKey(sub.getFullYear(), sub.getMonth(), sub.getDate()))) {
        sub.setDate(sub.getDate() + 1)
      }
      substituteHolidays.push({
        date: formatDateKey(sub.getFullYear(), sub.getMonth(), sub.getDate()),
        name: '振替休日',
      })
    }
  })
  substituteHolidays.forEach(h => holidayMap.set(h.date, h.name))

  // 国民の休日: 祝日と祝日に挟まれた平日
  holidays.forEach(h1 => {
    const d1 = new Date(h1.date + 'T00:00:00')
    const between = new Date(d1)
    between.setDate(between.getDate() + 1)
    const betweenKey = formatDateKey(between.getFullYear(), between.getMonth(), between.getDate())
    if (!holidayMap.has(betweenKey) && between.getDay() !== 0) {
      const after = new Date(between)
      after.setDate(after.getDate() + 1)
      const afterKey = formatDateKey(after.getFullYear(), after.getMonth(), after.getDate())
      if (holidayMap.has(afterKey)) {
        holidayMap.set(betweenKey, '国民の休日')
      }
    }
  })

  return holidayMap
}
