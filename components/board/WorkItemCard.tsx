import Link from 'next/link'
import { Paperclip } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { WorkReportWithAuthor } from '@/lib/types'

type Props = {
  item: WorkReportWithAuthor
}

export function WorkItemCard({ item }: Props) {
  const name = item.profiles.name
  const initials = name.slice(0, 2)
  const preview = item.content_text.slice(0, 80) + (item.content_text.length > 80 ? '…' : '')
  const hasAttachments = item.attachments.length > 0

  return (
    <Link
      href={`/report/${item.work_date}`}
      className="block rounded-md border border-border bg-card p-2.5 hover:border-primary/50 hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Avatar className="size-5">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-4 font-normal">
          {name}
        </Badge>
        {hasAttachments && (
          <Paperclip className="size-3 text-muted-foreground ml-auto" />
        )}
      </div>
      {preview && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-foreground transition-colors">
          {preview}
        </p>
      )}
    </Link>
  )
}
