'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createWorkReportSchema,
  updateWorkReportSchema,
  deleteWorkReportSchema,
} from '@/lib/validation/schemas'
import { htmlToText } from '@/lib/html'
import type { ActionResult } from '@/lib/types'

async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

export async function createWorkReportAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await getSessionUser()
  if (!user) return { ok: false, error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' } }

  const parsed = createWorkReportSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { workDate, contentHtml } = parsed.data
  const { data, error } = await supabase
    .from('work_reports')
    .insert({ author_id: user.id, work_date: workDate, content_html: contentHtml, content_text: htmlToText(contentHtml) })
    .select('id')
    .single()

  if (error) {
    console.error('createWorkReport:', error.message)
    return { ok: false, error: { code: 'DB_ERROR', message: '업무 저장에 실패했습니다.' } }
  }

  revalidatePath('/')
  revalidatePath(`/report/${workDate}`)
  return { ok: true, data: { id: data.id } }
}

export async function updateWorkReportAction(input: unknown): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser()
  if (!user) return { ok: false, error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' } }

  const parsed = updateWorkReportSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { id, contentHtml } = parsed.data
  const { data: existing } = await supabase
    .from('work_reports').select('author_id, work_date').eq('id', id).single()

  if (!existing) return { ok: false, error: { code: 'NOT_FOUND', message: '업무 항목을 찾을 수 없습니다.' } }

  const admin = await isAdmin(supabase, user.id)
  if (existing.author_id !== user.id && !admin) {
    return { ok: false, error: { code: 'FORBIDDEN', message: '수정 권한이 없습니다.' } }
  }

  const { error } = await supabase.from('work_reports')
    .update({ content_html: contentHtml, content_text: htmlToText(contentHtml) })
    .eq('id', id)

  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '업무 수정에 실패했습니다.' } }

  revalidatePath('/')
  revalidatePath(`/report/${existing.work_date}`)
  return { ok: true, data: undefined }
}

export async function deleteWorkReportAction(input: unknown): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser()
  if (!user) return { ok: false, error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' } }

  const parsed = deleteWorkReportSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { id } = parsed.data
  const { data: existing } = await supabase
    .from('work_reports').select('author_id, work_date').eq('id', id).single()

  if (!existing) return { ok: false, error: { code: 'NOT_FOUND', message: '업무 항목을 찾을 수 없습니다.' } }

  const admin = await isAdmin(supabase, user.id)
  if (existing.author_id !== user.id && !admin) {
    return { ok: false, error: { code: 'FORBIDDEN', message: '삭제 권한이 없습니다.' } }
  }

  const { data: atts } = await supabase.from('attachments').select('storage_path').eq('work_report_id', id)
  if (atts && atts.length > 0) {
    await supabase.storage.from('work-images').remove(atts.map((a) => a.storage_path))
  }

  const { error } = await supabase.from('work_reports').delete().eq('id', id)
  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '업무 삭제에 실패했습니다.' } }

  revalidatePath('/')
  revalidatePath(`/report/${existing.work_date}`)
  return { ok: true, data: undefined }
}
