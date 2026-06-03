'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { upsertAttendanceAction, deleteAttendanceAction } from '@/lib/actions/attendance'
import type { Attendance } from '@/lib/types'

type Props = {
  date: string
  myAttendance: Attendance | null
}

export function AttendanceForm({ date, myAttendance }: Props) {
  const [content, setContent] = useState(myAttendance?.content ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await upsertAttendanceAction({ workDate: date, content })
      if (result.ok) {
        toast.success('근태가 저장되었습니다.')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAttendanceAction({ workDate: date })
      if (result.ok) {
        toast.success('근태가 삭제되었습니다.')
        setContent('')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">내 출장·근태</h3>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="출장, 연차, 재택 등 일정을 자유롭게 입력하세요."
        className="text-sm resize-none h-20"
        maxLength={1000}
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{content.length}/1000</span>
        <div className="flex gap-2">
          {myAttendance && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive border-destructive/50 hover:bg-destructive/10">
                  <Trash2 className="size-3" />
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>근태 삭제</AlertDialogTitle>
                  <AlertDialogDescription>이 날짜의 근태 기록을 삭제하시겠습니까?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button size="sm" onClick={handleSave} disabled={isPending} className="h-7 text-xs gap-1">
            <Save className="size-3" />
            저장
          </Button>
        </div>
      </div>
    </div>
  )
}
