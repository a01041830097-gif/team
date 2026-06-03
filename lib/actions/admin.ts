'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createMemberSchema,
  setMemberActiveSchema,
  resetMemberPasswordSchema,
  adminUpdateReportSchema,
  adminDeleteReportSchema,
} from '@/lib/validation/schemas'
import { htmlToText } from '@/lib/html'
import type { ActionResult } from '@/lib/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false as const, error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' } }
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return { ok: false as const, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } }
  }
  return { ok: true as const, user, supabase }
}

export async function createMemberAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const parsed = createMemberSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { email, name, initialPassword, role } = parsed.data
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: initialPassword,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.toLowerCase().includes('already')) {
      return { ok: false, error: { code: 'CONFLICT', message: '이미 존재하는 이메일입니다.' } }
    }
    return { ok: false, error: { code: 'DB_ERROR', message: '계정 생성에 실패했습니다.' } }
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({ id: authData.user.id, name, email, role })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { ok: false, error: { code: 'DB_ERROR', message: '프로필 생성에 실패했습니다.' } }
  }

  revalidatePath('/admin/members')
  return { ok: true, data: { id: authData.user.id } }
}

export async function setMemberActiveAction(input: unknown): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const parsed = setMemberActiveSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { userId, isActive } = parsed.data
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('profiles').update({ is_active: isActive }).eq('id', userId)
  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '계정 상태 변경에 실패했습니다.' } }

  revalidatePath('/admin/members')
  return { ok: true, data: undefined }
}

export async function resetMemberPasswordAction(
  input: unknown
): Promise<ActionResult<{ temporaryPassword?: string }>> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const parsed = resetMemberPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { userId, newPassword } = parsed.data
  const tempPassword = newPassword ?? `${Math.random().toString(36).slice(-8)}A1!`
  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.updateUserById(userId, { password: tempPassword })
  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '비밀번호 초기화에 실패했습니다.' } }

  if (newPassword) {
    return { ok: true, data: {} }
  }
  return { ok: true, data: { temporaryPassword: tempPassword } }
}

export async function adminUpdateReportAction(input: unknown): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const parsed = adminUpdateReportSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { id, contentHtml } = parsed.data
  const { supabase } = auth

  const { data: existing } = await supabase.from('work_reports').select('work_date').eq('id', id).single()
  const { error } = await supabase.from('work_reports')
    .update({ content_html: contentHtml, content_text: htmlToText(contentHtml) })
    .eq('id', id)

  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '업무 수정에 실패했습니다.' } }

  revalidatePath('/')
  if (existing?.work_date) revalidatePath(`/report/${existing.work_date}`)
  revalidatePath('/admin/reports')
  return { ok: true, data: undefined }
}

export async function adminDeleteReportAction(input: unknown): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const parsed = adminDeleteReportSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { id } = parsed.data
  const { supabase } = auth

  const { data: atts } = await supabase.from('attachments').select('storage_path').eq('work_report_id', id)
  if (atts && atts.length > 0) {
    await supabase.storage.from('work-images').remove(atts.map((a) => a.storage_path))
  }

  const { error } = await supabase.from('work_reports').delete().eq('id', id)
  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '업무 삭제에 실패했습니다.' } }

  revalidatePath('/')
  revalidatePath('/admin/reports')
  return { ok: true, data: undefined }
}
