'use client'

import { useEffect, useState } from 'react'
import { Download, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed-at'
const DISMISS_DAYS = 14

function isDismissedRecently() {
  const raw = window.localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (Number.isNaN(dismissedAt)) return false
  const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
  return days < DISMISS_DAYS
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (isStandalone) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) return

    if (isDismissedRecently()) return

    const ua = window.navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(ua)

    if (isIos) {
      setPlatform('ios')
      setVisible(true)
      return
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setPlatform('android')
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome !== 'accepted') {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
    setVisible(false)
    setDeferred(null)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Download className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">홈 화면에 추가</p>
          {platform === 'ios' ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              공유 <Share2 className="-mt-0.5 inline size-3" /> 버튼을 누른 뒤{' '}
              <span className="font-medium text-foreground">&quot;홈 화면에 추가&quot;</span>를 선택하세요.
            </p>
          ) : (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              앱처럼 설치하면 인터넷 없이도 마지막 화면을 바로 열 수 있어요.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            {platform === 'android' && (
              <Button size="sm" className="h-8 text-xs" onClick={install}>
                설치하기
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={dismiss}>
              나중에
            </Button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="닫기"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
