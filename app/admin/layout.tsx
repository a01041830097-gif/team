import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/nav/TopNav'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav user={profile} />
      <main className="flex-1 mx-auto w-full max-w-screen-xl px-4 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">관리자</h2>
          </div>
          <div className="flex gap-2 border-b border-border pb-2">
            <Link
              href="/admin/members"
              className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
            >
              계정 관리
            </Link>
            <Link
              href="/admin/reports"
              className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
            >
              보고 관리
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
