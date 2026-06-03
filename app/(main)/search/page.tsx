import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchResultList } from '@/components/search/SearchResultList'
import { Skeleton } from '@/components/ui/skeleton'
import type { WorkReportWithAuthor, Profile } from '@/lib/types'

type Props = {
  searchParams: Promise<{
    q?: string
    author?: string
    from?: string
    to?: string
  }>
}

const PAGE_SIZE = 20

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const { q, author, from, to } = params

  const supabase = await createClient()

  const { data: members } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  let query = supabase
    .from('work_reports')
    .select('id, author_id, work_date, content_text, content_html, created_at, updated_at, profiles(id, name), attachments(id)')
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  const hasFilter = q || author || from || to

  if (q?.trim()) {
    query = query.ilike('content_text', `%${q.trim()}%`)
  }
  if (author) {
    query = query.eq('author_id', author)
  }
  if (from) {
    query = query.gte('work_date', from)
  }
  if (to) {
    query = query.lte('work_date', to)
  }

  const { data: results } = hasFilter ? await query : { data: [] }

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <h2 className="text-base font-semibold">검색</h2>

      <SearchFilters members={(members ?? []) as Pick<Profile, 'id' | 'name'>[]} />

      {hasFilter && (
        <SearchResultList
          results={(results ?? []) as unknown as WorkReportWithAuthor[]}
          query={q}
        />
      )}

      {!hasFilter && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">
            키워드, 작성자, 기간으로 업무를 검색할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  )
}
