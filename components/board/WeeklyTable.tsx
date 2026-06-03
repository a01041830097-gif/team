import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WorkItemCard } from './WorkItemCard'
import { AttendanceRow } from './AttendanceRow'
import { EmptyCell } from './EmptyCell'
import type { WeekDay, WorkReportWithAuthor, AttendanceWithAuthor } from '@/lib/types'

type Props = {
  weekDays: WeekDay[]
  workItemsByDate: Record<string, WorkReportWithAuthor[]>
  attendanceByDate: Record<string, AttendanceWithAuthor[]>
}

export function WeeklyTable({ weekDays, workItemsByDate, attendanceByDate }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[700px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="w-16 border-r border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              구분
            </th>
            {weekDays.map((day) => (
              <th
                key={day.date}
                className={cn(
                  'border-r border-border px-3 py-2 text-left last:border-r-0',
                  day.isToday && 'bg-primary/5'
                )}
              >
                <Link
                  href={`/report/${day.date}`}
                  className={cn(
                    'block text-xs font-semibold hover:text-primary transition-colors',
                    day.isToday ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {day.weekdayKo}
                  <span className="block text-[11px] font-normal text-muted-foreground">
                    {day.date.slice(5).replace('-', '/')}
                  </span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Work reports row */}
          <tr className="border-b border-border align-top">
            <td className="border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
              업무
            </td>
            {weekDays.map((day) => {
              const items = workItemsByDate[day.date] ?? []
              return (
                <td
                  key={day.date}
                  className={cn(
                    'border-r border-border px-2 py-2 last:border-r-0 min-h-[60px]',
                    day.isToday && 'bg-primary/5'
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    {items.map((item) => (
                      <WorkItemCard key={item.id} item={item} />
                    ))}
                    <EmptyCell date={day.date} />
                  </div>
                </td>
              )
            })}
          </tr>

          {/* Attendance row */}
          <tr className="align-top">
            <td className="border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
              출장·근태
            </td>
            {weekDays.map((day) => {
              const items = attendanceByDate[day.date] ?? []
              return (
                <td
                  key={day.date}
                  className={cn(
                    'border-r border-border px-2 py-2 last:border-r-0',
                    day.isToday && 'bg-primary/5'
                  )}
                >
                  <AttendanceRow items={items} />
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
