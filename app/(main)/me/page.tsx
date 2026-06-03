'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { updatePasswordAction } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import type { Profile } from '@/lib/types'

export default function MePage() {
  const [profile, setProfile] = useState<Pick<Profile, 'name' | 'email'> | null>(null)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPw !== confirmPw) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    startTransition(async () => {
      const result = await updatePasswordAction({ password: newPw })
      if (result.ok) {
        toast.success('비밀번호가 변경되었습니다.')
        setNewPw('')
        setConfirmPw('')
      } else {
        setError(result.error.message)
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <h2 className="text-base font-semibold">마이페이지</h2>

      {/* Profile info */}
      <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold">내 정보</h3>
        <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
          <span className="text-muted-foreground">이름</span>
          <span>{profile?.name ?? '—'}</span>
          <span className="text-muted-foreground">이메일</span>
          <span>{profile?.email ?? '—'}</span>
        </div>
      </div>

      <Separator />

      {/* Password change */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-4">비밀번호 변경</h3>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-pw">새 비밀번호</Label>
            <Input
              id="new-pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="8자 이상"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-pw">비밀번호 확인</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="비밀번호 재입력"
              required
              autoComplete="new-password"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 py-2 px-3">
              {error}
            </p>
          )}
          <Button type="submit" disabled={isPending} className="w-full mt-1">
            {isPending ? '변경 중…' : '비밀번호 변경'}
          </Button>
        </form>
      </div>
    </div>
  )
}
