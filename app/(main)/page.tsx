import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { WeekNavigator } from '@/components/board/WeekNavigator'
import { WeeklyTable } from '@/components/board/WeeklyTable'
import { MobileDayAccordion } from '@/components/board/MobileDayAccordion'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCurrentWeekStart,
  getWeekStart,
  getWeekRange,
  isValidDate,
} from '@/lib/date/kst'
import type { WorkReportWithAuthor, AttendanceWithAuthor } from '@/lib/types'

type Props = {
  searchParams: Promise<{ week?: string }>
}

export default async function BoardPage({ searchParams }: Props) {
  const params = await searchParams
  const rawWeek = params.week
  const weekStart =
    rawWeek && isValidDate(rawWeek) ? getWeekStart(rawWeek) : getCurrentWeekStart()
  const currentWeekStart = getCurrentWeekStart()
  const isCurrentWeek = weekStart === currentWeekStart
  const weekRange = getWeekRange(weekStart)

  const supabase = await createClient()

  const [{ data: workReports }, { data: attendances }] = await Promise.all([
    supabase
      .from('work_reports')
      .select('id, author_id, work_date, content_text, content_html, created_at, updated_at, profiles(id, name), attachments(id)')
      .gte('work_date', weekRange.start)
      .lte('work_date', weekRange.end)
      .order('created_at'),
    supabase
      .from('attendances')
      .select('id, author_id, work_date, content, created_at, updated_at, profiles(id, name)')
      .gte('work_date', weekRange.start)
      .lte('work_date', weekRange.end),
  ])

  const workItemsByDate: Record<string, WorkReportWithAuthor[]> = {}
  const attendanceByDate: Record<string, AttendanceWithAuthor[]> = {}

  weekRange.days.forEach((d) => {
    workItemsByDate[d.date] = []
    attendanceByDate[d.date] = []
  })

  for (const r of (workReports ?? []) as unknown as WorkReportWithAuthor[]) {
    if (workItemsByDate[r.work_date]) {
      workItemsByDate[r.work_date].push(r)
    }
  }
  for (const a of (attendances ?? []) as unknown as AttendanceWithAuthor[]) {
    if (attendanceByDate[a.work_date]) {
      attendanceByDate[a.work_date].push(a)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">주간 종합 보드</h2>
        <WeekNavigator
          weekStart={weekStart}
          weekRange={weekRange}
          isCurrentWeek={isCurrentWeek}
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <WeeklyTable
          weekDays={weekRange.days}
          workItemsByDate={workItemsByDate}
          attendanceByDate={attendanceByDate}
        />
      </div>

      {/* Mobile accordion */}
      <div className="md:hidden">
        <MobileDayAccordion
          weekDays={weekRange.days}
          workItemsByDate={workItemsByDate}
          attendanceByDate={attendanceByDate}
        />
      </div>
    </div>
  )
}
