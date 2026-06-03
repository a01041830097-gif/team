'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Plus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { WeekDay, WorkReportWithAuthor, AttendanceWithAuthor } from '@/lib/types'

type Props = {
  weekDays: WeekDay[]
  workItemsByDate: Record<string, WorkReportWithAuthor[]>
  attendanceByDate: Record<string, AttendanceWithAuthor[]>
}

export function MobileDayAccordion({ weekDays, workItemsByDate, attendanceByDate }: Props) {
  const todayDay = weekDays.find((d) => d.isToday)
  const [openDate, setOpenDate] = useState<string>(todayDay?.date ?? weekDays[0].date)

  return (
    <div className="flex flex-col gap-2">
      {/* Day chips */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weekDays.map((day) => (
          <button
            key={day.date}
            onClick={() => setOpenDate(day.date)}
            className={cn(
              'flex flex-col items-center rounded-lg px-3 py-1.5 text-xs shrink-0 transition-colors',
              openDate === day.date
                ? 'bg-primary text-primary-foreground'
                : day.isToday
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <span className="font-semibold">{day.weekdayKo}</span>
            <span className="text-[10px]">{day.date.slice(5).replace('-', '/')}</span>
          </button>
        ))}
      </div>

      {/* Content for selected day */}
      {weekDays.map((day) => {
        if (day.date !== openDate) return null
        const workItems = workItemsByDate[day.date] ?? []
        const attItems = attendanceByDate[day.date] ?? []

        return (
          <div key={day.date} className="rounded-lg border border-border overflow-hidden">
            {/* Work reports */}
            <div className="border-b border-border">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/40">
                업무
              </div>
              <div className="p-2 flex flex-col gap-2">
                {workItems.length === 0 ? (
                  <Link
                    href={`/report/${day.date}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-primary transition-colors py-1 px-1"
                  >
                    <Plus className="size-3" />
                    업무 추가
                  </Link>
                ) : (
                  workItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/report/${item.work_date}`}
                      className="flex items-start gap-2 rounded-md border border-border p-2.5 hover:bg-accent/50 transition-colors"
                    >
                      <Avatar className="size-6 mt-0.5 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {item.profiles.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-4 mb-1 font-normal">
                          {item.profiles.name}
                        </Badge>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.content_text.slice(0, 100)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
                {workItems.length > 0 && (
                  <Link
                    href={`/report/${day.date}`}
                    className="flex items-center gap-1 text-xs text-primary hover:underline transition-colors py-1 px-1"
                  >
                    <Plus className="size-3" />
                    업무 추가
                  </Link>
                )}
              </div>
            </div>

            {/* Attendance */}
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/40">
                출장·근태
              </div>
              <div className="p-2">
                {attItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 px-1 py-1">—</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {attItems.map((att) => (
                      <div key={att.id} className="flex items-start gap-1.5 px-1 py-0.5">
                        <Avatar className="size-4 mt-0.5 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                            {att.profiles.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground leading-snug">
                          <span className="font-medium text-foreground">{att.profiles.name}</span>{' '}
                          {att.content}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
