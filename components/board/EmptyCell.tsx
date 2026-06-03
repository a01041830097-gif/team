import Link from 'next/link'
import { Plus } from 'lucide-react'

type Props = {
  date: string
}

export function EmptyCell({ date }: Props) {
  return (
    <Link
      href={`/report/${date}`}
      className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-primary transition-colors py-1"
    >
      <Plus className="size-3" />
      작성
    </Link>
  )
}
