export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

export type Profile = {
  id: string
  name: string
  email: string
  role: 'member' | 'admin'
  is_active: boolean
  created_at: string
}

export type WorkReport = {
  id: string
  author_id: string
  work_date: string
  content_html: string
  content_text: string
  created_at: string
  updated_at: string
}

export type Attendance = {
  id: string
  author_id: string
  work_date: string
  content: string
  created_at: string
  updated_at: string
}

export type Attachment = {
  id: string
  work_report_id: string
  storage_path: string
  file_url: string
  file_name: string
  file_size: number
  mime_type: string
  created_at: string
}

export type WorkReportWithAuthor = WorkReport & {
  profiles: Pick<Profile, 'id' | 'name'>
  attachments: Pick<Attachment, 'id'>[]
}

export type AttendanceWithAuthor = Attendance & {
  profiles: Pick<Profile, 'id' | 'name'>
}

export type WeekDay = {
  date: string
  weekdayKo: string
  isToday: boolean
}
