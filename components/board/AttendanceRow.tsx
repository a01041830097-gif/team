import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { AttendanceWithAuthor } from '@/lib/types'

type Props = {
  items: AttendanceWithAuthor[]
}

export function AttendanceRow({ items }: Props) {
  if (items.length === 0) {
    return <div className="text-xs text-muted-foreground/50 px-1 py-0.5">—</div>
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((att) => (
        <div key={att.id} className="flex items-start gap-1.5">
          <Avatar className="size-4 mt-0.5 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
              {att.profiles.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground leading-snug">
            <span className="font-medium text-foreground">{att.profiles.name}</span>{' '}
            {att.content}
          </span>
        </div>
      ))}
    </div>
  )
}
