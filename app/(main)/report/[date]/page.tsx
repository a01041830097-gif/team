import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { WorkEditorForm } from '@/components/report/WorkEditorForm'
import { ReadonlyWorkItem } from '@/components/report/ReadonlyWorkItem'
import { AttendanceForm } from '@/components/report/AttendanceForm'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { isValidDate, formatDateLabel } from '@/lib/date/kst'
import type { WorkReportWithAuthor, AttendanceWithAuthor, Attendance } from '@/lib/types'

type Props = {
  params: Promise<{ date: string }>
}

export default async function ReportDatePage({ params }: Props) {
  const { date } = await params

  if (!isValidDate(date)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [{ data: workReports }, { data: attendances }] = await Promise.all([
    supabase
      .from('work_reports')
      .select('id, author_id, work_date, content_html, content_text, created_at, updated_at, profiles(id, name), attachments(id)')
      .eq('work_date', date)
      .order('created_at'),
    supabase
      .from('attendances')
      .select('id, author_id, work_date, content, created_at, updated_at, profiles(id, name)')
      .eq('work_date', date),
  ])

  const typedReports = (workReports ?? []) as unknown as WorkReportWithAuthor[]
  const typedAttendances = (attendances ?? []) as unknown as AttendanceWithAuthor[]

  const myReports = typedReports.filter((r) => r.author_id === user.id)
  const othersReports = typedReports.filter((r) => r.author_id !== user.id)
  const myAttendance = (typedAttendances.find((a) => a.author_id === user.id) ?? null) as Attendance | null
  const othersAttendances = typedAttendances.filter((a) => a.author_id !== user.id)

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="size-4" />
            종합 보드
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <h2 className="text-base font-semibold">{formatDateLabel(date)}</h2>
        </div>
      </div>

      {/* My work reports */}
      <section className="rounded-lg border border-border p-4 bg-card flex flex-col gap-4">
        <WorkEditorForm date={date} myReports={myReports} />
      </section>

      {/* Others' work reports */}
      {othersReports.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground">팀원 업무</h3>
          {othersReports.map((report) => (
            <ReadonlyWorkItem key={report.id} item={report} />
          ))}
        </section>
      )}

      {/* Attendance section */}
      <section className="rounded-lg border border-border p-4 bg-card">
        <AttendanceForm date={date} myAttendance={myAttendance} />
      </section>

      {/* Others' attendance */}
      {othersAttendances.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground">팀원 출장·근태</h3>
          <div className="rounded-lg border border-border divide-y divide-border">
            {othersAttendances.map((att) => (
              <div key={att.id} className="flex items-start gap-2 px-4 py-3">
                <Avatar className="size-6 mt-0.5 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {att.profiles.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium">{att.profiles.name}</span>
                  <p className="text-sm text-muted-foreground mt-0.5">{att.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* 완료 버튼 */}
      <div className="flex justify-center pb-4">
        <Link href="/">
          <Button size="lg" className="px-10">완료</Button>
        </Link>
      </div>
    </div>
  )
}
