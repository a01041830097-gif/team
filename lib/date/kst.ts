import {
  startOfWeek,
  addWeeks,
  addDays,
  format,
  isValid,
  parseISO,
} from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

const TZ = 'Asia/Seoul'

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토']

export type WeekDay = {
  date: string
  weekdayKo: string
  isToday: boolean
}

export function getKstToday(): string {
  return formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')
}

export function getWeekStart(dateStr: string): string {
  const d = toZonedTime(parseISO(dateStr), TZ)
  const monday = startOfWeek(d, { weekStartsOn: 1 })
  return format(monday, 'yyyy-MM-dd')
}

export function getCurrentWeekStart(): string {
  return getWeekStart(getKstToday())
}

export function shiftWeek(weekStart: string, delta: number): string {
  const d = toZonedTime(parseISO(weekStart), TZ)
  const shifted = addWeeks(d, delta)
  return format(shifted, 'yyyy-MM-dd')
}

export function getWeekRange(weekStart: string): {
  start: string
  end: string
  days: WeekDay[]
} {
  const today = getKstToday()
  const d = toZonedTime(parseISO(weekStart), TZ)
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(d, i)
    const date = format(day, 'yyyy-MM-dd')
    return {
      date,
      weekdayKo: WEEKDAY_KO[day.getDay()],
      isToday: date === today,
    }
  })
  return {
    start: days[0].date,
    end: days[6].date,
    days,
  }
}

export function formatDateLabel(dateStr: string): string {
  const d = toZonedTime(parseISO(dateStr), TZ)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const wd = WEEKDAY_KO[d.getDay()]
  return `${m}/${day}(${wd})`
}

export function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false
  const d = parseISO(dateStr)
  return isValid(d)
}
