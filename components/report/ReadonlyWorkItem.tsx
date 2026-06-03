import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Paperclip } from 'lucide-react'
import type { WorkReportWithAuthor } from '@/lib/types'

type Props = {
  item: WorkReportWithAuthor
}

export function ReadonlyWorkItem({ item }: Props) {
  const name = item.profiles.name

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <Avatar className="size-6">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <Badge variant="secondary" className="text-xs font-normal">
          {name}
        </Badge>
        {item.attachments.length > 0 && (
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="size-3" />
            {item.attachments.length}
          </div>
        )}
      </div>
      <div
        className="tiptap-content px-3 py-3 text-sm"
        dangerouslySetInnerHTML={{ __html: item.content_html }}
      />
    </div>
  )
}
