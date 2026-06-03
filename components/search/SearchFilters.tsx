'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Profile } from '@/lib/types'

type Props = {
  members: Pick<Profile, 'id' | 'name'>[]
}

export function SearchFilters({ members }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [author, setAuthor] = useState(searchParams.get('author') ?? '')
  const [from, setFrom] = useState(searchParams.get('from') ?? '')
  const [to, setTo] = useState(searchParams.get('to') ?? '')

  function handleSearch() {
    startTransition(() => {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (author) params.set('author', author)
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      router.push(`/search?${params.toString()}`)
    })
  }

  function handleReset() {
    setQ('')
    setAuthor('')
    setFrom('')
    setTo('')
    router.push('/search')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="rounded-lg border border-border p-4 bg-card">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="q" className="text-xs">키워드</Label>
          <Input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색어 입력"
            className="h-8 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="author" className="text-xs">작성자</Label>
          <Select value={author} onValueChange={setAuthor}>
            <SelectTrigger id="author" className="h-8 text-sm">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="from" className="text-xs">시작일</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="to" className="text-xs">종료일</Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3 justify-end">
        <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs gap-1">
          <X className="size-3" />
          초기화
        </Button>
        <Button size="sm" onClick={handleSearch} disabled={isPending} className="h-8 text-xs gap-1">
          <Search className="size-3" />
          검색
        </Button>
      </div>
    </div>
  )
}
