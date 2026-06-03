import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDateLabel } from '@/lib/date/kst'
import type { WorkReportWithAuthor } from '@/lib/types'

type Props = {
  results: WorkReportWithAuthor[]
  query?: string
}

export function SearchResultList({ results, query }: Props) {
  if (results.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          {query ? `"${query}"에 대한 검색 결과가 없습니다.` : '검색 결과가 없습니다.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{results.length}건 검색됨</p>
      {results.map((item) => (
        <Link
          key={item.id}
          href={`/report/${item.work_date}`}
          className="block rounded-lg border border-border p-3 hover:border-primary/50 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar className="size-5">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                {item.profiles.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <Badge variant="secondary" className="text-xs font-normal px-1.5 py-0 h-4">
              {item.profiles.name}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDateLabel(item.work_date)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {item.content_text.slice(0, 200)}
          </p>
        </Link>
      ))}
    </div>
  )
}
