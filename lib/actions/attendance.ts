'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { upsertAttendanceSchema, deleteAttendanceSchema } from '@/lib/validation/schemas'
import type { ActionResult } from '@/lib/types'

async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function upsertAttendanceAction(input: unknown): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser()
  if (!user) return { ok: false, error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' } }

  const parsed = upsertAttendanceSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { workDate, content } = parsed.data
  const { error } = await supabase.from('attendances').upsert(
    { author_id: user.id, work_date: workDate, content },
    { onConflict: 'author_id,work_date' }
  )

  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '근태 저장에 실패했습니다.' } }

  revalidatePath('/')
  revalidatePath(`/report/${workDate}`)
  return { ok: true, data: undefined }
}

export async function deleteAttendanceAction(input: unknown): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser()
  if (!user) return { ok: false, error: { code: 'UNAUTHENTICATED', message: '로그인이 필요합니다.' } }

  const parsed = deleteAttendanceSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION', message: parsed.error.issues[0].message } }
  }

  const { workDate } = parsed.data
  const { error } = await supabase.from('attendances')
    .delete().eq('author_id', user.id).eq('work_date', workDate)

  if (error) return { ok: false, error: { code: 'DB_ERROR', message: '근태 삭제에 실패했습니다.' } }

  revalidatePath('/')
  revalidatePath(`/report/${workDate}`)
  return { ok: true, data: undefined }
}
