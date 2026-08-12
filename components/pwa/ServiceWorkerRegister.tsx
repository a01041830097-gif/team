'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 오프라인 캐싱은 부가 기능이므로 등록 실패 시 조용히 무시
    })
  }, [])

  return null
}
