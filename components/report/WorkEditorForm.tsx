'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  createWorkReportAction,
  updateWorkReportAction,
  deleteWorkReportAction,
} from '@/lib/actions/work'
import type { WorkReport } from '@/lib/types'

type Props = {
  date: string
  myReports: WorkReport[]
}

export function WorkEditorForm({ date, myReports }: Props) {
  const [showNew, setShowNew] = useState(false)
  const [newHtml, setNewHtml] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editHtml, setEditHtml] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    if (!newHtml.trim() || newHtml === '<p></p>') {
      toast.error('내용을 입력해주세요.')
      return
    }
    startTransition(async () => {
      const result = await createWorkReportAction({ workDate: date, contentHtml: newHtml })
      if (result.ok) {
        toast.success('업무가 저장되었습니다.')
        setShowNew(false)
        setNewHtml('')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  function handleUpdate(id: string) {
    if (!editHtml.trim() || editHtml === '<p></p>') {
      toast.error('내용을 입력해주세요.')
      return
    }
    startTransition(async () => {
      const result = await updateWorkReportAction({ id, contentHtml: editHtml })
      if (result.ok) {
        toast.success('업무가 수정되었습니다.')
        setEditId(null)
        setEditHtml('')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteWorkReportAction({ id })
      if (result.ok) {
        toast.success('업무가 삭제되었습니다.')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">내 업무</h3>
        {!showNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNew(true)}
            className="h-7 gap-1 text-xs"
          >
            <Plus className="size-3" />
            업무 추가
          </Button>
        )}
      </div>

      {/* Existing reports */}
      {myReports.map((report) => (
        <div key={report.id} className="rounded-md border border-border overflow-hidden">
          {editId === report.id ? (
            <div>
              <TiptapEditor
                value={editHtml}
                onChange={setEditHtml}
                workDate={date}
              />
              <div className="flex justify-end gap-2 p-2 border-t border-border bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditId(null); setEditHtml('') }}
                  className="h-7 text-xs gap-1"
                >
                  <X className="size-3" />
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdate(report.id)}
                  disabled={isPending}
                  className="h-7 text-xs gap-1"
                >
                  <Check className="size-3" />
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div
                className="tiptap-content px-3 py-2 text-sm"
                dangerouslySetInnerHTML={{ __html: report.content_html }}
              />
              <div className="flex justify-end gap-1 px-2 py-1.5 border-t border-border bg-muted/20">
                <Button
                  variant="ghost"
                  size="icon-sm"
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
                      <AlertDialogDescription>
                        이 업무를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
                      </AlertDialogDescription>
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
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New report form */}
      {showNew && (
        <div className="rounded-md border border-primary/30 overflow-hidden">
          <TiptapEditor
            value={newHtml}
            onChange={setNewHtml}
            workDate={date}
          />
          <div className="flex justify-end gap-2 p-2 border-t border-border bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowNew(false); setNewHtml('') }}
              className="h-7 text-xs gap-1"
            >
              <X className="size-3" />
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={isPending}
              className="h-7 text-xs gap-1"
            >
              <Check className="size-3" />
              저장
            </Button>
          </div>
        </div>
      )}

      {myReports.length === 0 && !showNew && (
        <p className="text-sm text-muted-foreground text-center py-4">
          아직 작성한 업무가 없습니다.
        </p>
      )}
    </div>
  )
}
