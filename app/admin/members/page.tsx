'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  createMemberAction,
  setMemberActiveAction,
  resetMemberPasswordAction,
} from '@/lib/actions/admin'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Profile[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [isPending, startTransition] = useTransition()
  const [tempPw, setTempPw] = useState<string | null>(null)

  async function loadMembers() {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('name')
    setMembers((data ?? []) as Profile[])
  }

  useEffect(() => { loadMembers() }, [])

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createMemberAction({ email, name, initialPassword: pw, role })
      if (result.ok) {
        toast.success('계정이 생성되었습니다.')
        setCreateOpen(false)
        setName(''); setEmail(''); setPw(''); setRole('member')
        loadMembers()
      } else {
        toast.error(result.error.message)
      }
    })
  }

  function handleToggleActive(userId: string, current: boolean) {
    startTransition(async () => {
      const result = await setMemberActiveAction({ userId, isActive: !current })
      if (result.ok) {
        toast.success(!current ? '계정이 활성화되었습니다.' : '계정이 비활성화되었습니다.')
        loadMembers()
      } else {
        toast.error(result.error.message)
      }
    })
  }

  function handleReset(userId: string) {
    startTransition(async () => {
      const result = await resetMemberPasswordAction({ userId })
      if (result.ok) {
        if (result.data?.temporaryPassword) {
          setTempPw(result.data.temporaryPassword)
        } else {
          toast.success('비밀번호가 초기화되었습니다.')
        }
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs gap-1">
              <Plus className="size-3" />
              계정 생성
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>계정 생성</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-3 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label>이름</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="홍길동" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>이메일</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@company.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>초기 비밀번호</Label>
                <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} placeholder="8자 이상" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>역할</Label>
                <Select value={role} onValueChange={(v) => setRole(v as 'member' | 'admin')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">팀원</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="mt-1" disabled={isPending}>
                {isPending ? '생성 중…' : '계정 생성'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{m.email}</TableCell>
                <TableCell>
                  <Badge variant={m.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {m.role === 'admin' ? '관리자' : '팀원'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={m.is_active ? 'secondary' : 'outline'}
                    className={`text-xs ${m.is_active ? 'text-green-700 bg-green-100' : 'text-muted-foreground'}`}
                  >
                    {m.is_active ? '활성' : '비활성'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleToggleActive(m.id, m.is_active)}
                      title={m.is_active ? '비활성화' : '활성화'}
                    >
                      {m.is_active ? (
                        <ToggleRight className="size-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon-sm" title="비밀번호 초기화">
                          <KeyRound className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>비밀번호 초기화</AlertDialogTitle>
                          <AlertDialogDescription>
                            {m.name}님의 비밀번호를 임시 비밀번호로 초기화하시겠습니까?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleReset(m.id)}>초기화</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  팀원이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Temp password dialog */}
      <AlertDialog open={!!tempPw} onOpenChange={() => setTempPw(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>임시 비밀번호</AlertDialogTitle>
            <AlertDialogDescription>
              아래 임시 비밀번호를 팀원에게 전달하세요. 이 창을 닫으면 다시 확인할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="font-mono text-lg font-semibold text-center py-3 bg-muted rounded-md">
            {tempPw}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setTempPw(null)}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
