'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Pencil, Trash2, X, Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { adminUpdateReportAction, adminDeleteReportAction } from '@/lib/actions/admin'
import { createClient } from '@/lib/supabase/client'
import { formatDateLabel } from '@/lib/date/kst'
import type { WorkReportWithAuthor } from '@/lib/types'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<WorkReportWithAuthor[]>([])
  const [q, setQ] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editHtml, setEditHtml] = useState('')
  const [isPending, startTransition] = useTransition()

  async function search() {
    const supabase = createClient()
    let query = supabase
      .from('work_reports')
      .select('id, author_id, work_date, content_html, content_text, created_at, updated_at, profiles(id, name), attachments(id)')
      .order('work_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (q.trim()) query = query.ilike('content_text', `%${q.trim()}%`)
    const { data } = await query
    setReports((data ?? []) as unknown as WorkReportWithAuthor[])
  }

  useEffect(() => { search() }, [])

  function handleUpdate(id: string) {
    startTransition(async () => {
      const result = await adminUpdateReportAction({ id, contentHtml: editHtml })
      if (result.ok) {
        toast.success('수정되었습니다.')
        setEditId(null); setEditHtml('')
        search()
      } else {
        toast.error(result.error.message)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await adminDeleteReportAction({ id })
      if (result.ok) {
        toast.success('삭제되었습니다.')
        setReports((prev) => prev.filter((r) => r.id !== id))
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="키워드 검색"
          className="h-8 text-sm max-w-sm"
        />
        <Button size="sm" onClick={search} className="h-8 text-xs gap-1">
          <Search className="size-3" />
          검색
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <div key={report.id} className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
              <Avatar className="size-6">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {report.profiles.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="text-xs font-normal">{report.profiles.name}</Badge>
              <Link
                href={`/report/${report.work_date}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors ml-1"
              >
                {formatDateLabel(report.work_date)}
              </Link>
              <div className="ml-auto flex gap-1">
                {editId !== report.id ? (
                  <>
                    <Button
                      variant="ghost" size="icon-sm"
                      onClick={() => { setEditId(report.id); setEditHtml(report.content_html) }}
                      title="수정"
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon-sm" title="삭제" className="text-destructive hover:text-destructive">
                          <Trash2 className="size-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>업무 삭제</AlertDialogTitle>
                          <AlertDialogDescription>이 업무를 영구 삭제하시겠습니까?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(report.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon-sm" onClick={() => { setEditId(null); setEditHtml('') }} title="취소">
                      <X className="size-3" />
                    </Button>
                    <Button size="icon-sm" onClick={() => handleUpdate(report.id)} disabled={isPending} title="저장">
                      <Check className="size-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            {editId === report.id ? (
              <TiptapEditor value={editHtml} onChange={setEditHtml} workDate={report.work_date} />
            ) : (
              <div className="tiptap-content px-3 py-3 text-sm" dangerouslySetInnerHTML={{ __html: report.content_html }} />
            )}
          </div>
        ))}
        {reports.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
