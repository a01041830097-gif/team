'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Search, User, Shield, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOutAction } from '@/lib/actions/auth'
import type { Profile } from '@/lib/types'

type Props = {
  user: Pick<Profile, 'id' | 'name' | 'role'>
}

export function TopNav({ user }: Props) {
  const pathname = usePathname()
  const isAdmin = user.role === 'admin'
  const initials = user.name.slice(0, 2)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <ClipboardList className="size-5" />
            <span className="hidden sm:inline">주간업무보고</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                pathname === '/' ? 'bg-muted font-medium' : 'text-muted-foreground'
              }`}
            >
              종합 보드
            </Link>
            <Link
              href="/search"
              className={`rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                pathname === '/search' ? 'bg-muted font-medium' : 'text-muted-foreground'
              }`}
            >
              검색
            </Link>
            {isAdmin && (
              <Link
                href="/admin/members"
                className={`rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                  pathname.startsWith('/admin') ? 'bg-muted font-medium' : 'text-muted-foreground'
                }`}
              >
                관리자
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/search" className="md:hidden">
            <Button variant="ghost" size="icon">
              <Search className="size-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/me" className="flex items-center gap-2">
                  <User className="size-4" />
                  마이페이지
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/members" className="flex items-center gap-2">
                      <Shield className="size-4" />
                      관리자
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={() => signOutAction()}
              >
                <LogOut className="size-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
