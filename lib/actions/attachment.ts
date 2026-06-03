'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { registerAttachmentSchema, deleteAttachmentSchema } from '@/lib/validation/schemas'
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

export async function registerAttachmentAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await getSessionUser()
  if (!user) return { ok: false, error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' } }

  const parsed = registerAttachmentSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { workReportId, storagePath, fileUrl, fileName, fileSize, mimeType } = parsed.data
  const { data: report } = await supabase
    .from('work_reports').select('author_id, work_date').eq('id', workReportId).single()

  if (!report) return { ok: false, error: { code: 'NOT_FOUND', message: '업무 항목을 찾을 수 없습니다.' } }

  const admin = await isAdmin(supabase, user.id)
  if (report.author_id !== user.id && !admin) {
    return { ok: false, error: { code: 'FORBIDDEN', message: '권한이 없습니다.' } }
  }

  const { data, error } = await supabase
    .from('attachments')
    .insert({ work_report_id: workReportId, storage_path: storagePath, file_url: fileUrl, file_name: fileName, file_size: fileSize, mime_type: mimeType })
    .select('id').single()

  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '첨부 등록에 실패했습니다.' } }

  revalidatePath('/')
  revalidatePath(`/report/${report.work_date}`)
  return { ok: true, data: { id: data.id } }
}

export async function deleteAttachmentAction(input: unknown): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser()
  if (!user) return { ok: false, error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' } }

  const parsed = deleteAttachmentSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { id } = parsed.data
  const { data: att } = await supabase
    .from('attachments')
    .select('storage_path, work_reports(author_id, work_date)')
    .eq('id', id).single()

  if (!att) return { ok: false, error: { code: 'NOT_FOUND', message: '첨부 파일을 찾을 수 없습니다.' } }

  const reportData = att.work_reports as unknown as { author_id: string; work_date: string } | null
  const admin = await isAdmin(supabase, user.id)
  if (reportData?.author_id !== user.id && !admin) {
    return { ok: false, error: { code: 'FORBIDDEN', message: '권한이 없습니다.' } }
  }

  await supabase.storage.from('work-images').remove([att.storage_path])
  const { error } = await supabase.from('attachments').delete().eq('id', id)
  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '첨부 삭제에 실패했습니다.' } }

  if (reportData?.work_date) {
    revalidatePath('/')
    revalidatePath(`/report/${reportData.work_date}`)
  }
  return { ok: true, data: undefined }
}
