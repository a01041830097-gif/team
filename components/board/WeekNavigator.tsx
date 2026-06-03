'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { shiftWeek } from '@/lib/date/kst'

type Props = {
  weekStart: string
  weekRange: { start: string; end: string }
  isCurrentWeek: boolean
}

export function WeekNavigator({ weekStart, weekRange, isCurrentWeek }: Props) {
  const router = useRouter()

  function navigate(delta: number) {
    const next = shiftWeek(weekStart, delta)
    router.push(`/?week=${next}`)
  }

  function toCurrentWeek() {
    router.push('/')
  }

  const [startMonth, startDay] = weekRange.start.split('-').slice(1)
  const [endMonth, endDay] = weekRange.end.split('-').slice(1)
  const label = `${Number(startMonth)}/${Number(startDay)} ~ ${Number(endMonth)}/${Number(endDay)}`

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => navigate(-1)} aria-label="이전 주">
        <ChevronLeft className="size-4" />
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-32 text-center">{label}</span>
        {isCurrentWeek ? (
          <Badge className="text-xs px-2">이번 주</Badge>
        ) : (
          <Button variant="outline" size="sm" onClick={toCurrentWeek} className="text-xs h-6 px-2">
            이번 주로
          </Button>
        )}
      </div>
      <Button variant="outline" size="icon" onClick={() => navigate(1)} aria-label="다음 주">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
