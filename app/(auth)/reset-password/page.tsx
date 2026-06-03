'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePasswordAction } from '@/lib/actions/auth'
import { ClipboardList } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    startTransition(async () => {
      const result = await updatePasswordAction({ password })
      if (result.ok) {
        toast.success('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
        router.push('/login')
      } else {
        setError(result.error.message)
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground">
            <ClipboardList className="size-6" />
          </div>
          <h1 className="text-xl font-semibold">비밀번호 재설정</h1>
          <p className="text-sm text-muted-foreground">새 비밀번호를 입력해주세요.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center rounded-md bg-destructive/10 py-2 px-3">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-1" disabled={isPending}>
              {isPending ? '변경 중…' : '비밀번호 변경'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
