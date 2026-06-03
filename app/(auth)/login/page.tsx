'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { signInAction, requestPasswordResetAction } from '@/lib/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const [resetEmail, setResetEmail] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const [resetPending, startResetTransition] = useTransition()

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        await signInAction({ email, password })
      } catch (e: unknown) {
        // redirect()는 내부적으로 예외를 throw하므로 정상 케이스
        const msg = e instanceof Error ? e.message : ''
        if (!msg.includes('NEXT_REDIRECT')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        }
      }
    })
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault()
    startResetTransition(async () => {
      const result = await requestPasswordResetAction({ email: resetEmail })
      if (result.ok) {
        toast.success('비밀번호 재설정 메일을 발송했습니다.')
        setResetOpen(false)
        setResetEmail('')
      } else {
        toast.error(result.error.message)
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
          <h1 className="text-xl font-semibold">팀 주간업무보고</h1>
          <p className="text-sm text-muted-foreground">로그인하여 업무를 확인하세요.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center rounded-md bg-destructive/10 py-2 px-3">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-1" disabled={isPending}>
              {isPending ? '로그인 중…' : '로그인'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
              <DialogTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">
                  비밀번호를 잊으셨나요?
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>비밀번호 재설정</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleReset} className="flex flex-col gap-3 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reset-email">이메일</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="가입한 이메일 주소"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    입력한 이메일로 재설정 링크를 발송합니다.
                  </p>
                  <Button type="submit" className="w-full" disabled={resetPending}>
                    {resetPending ? '발송 중…' : '재설정 메일 발송'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
