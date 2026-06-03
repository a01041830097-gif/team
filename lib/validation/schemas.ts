import { z } from 'zod'
import { isValidDate } from '@/lib/date/kst'

export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다.')

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(/\S+/, '비밀번호에 공백이 포함될 수 없습니다.')

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.')
  .refine(isValidDate, '유효하지 않은 날짜입니다.')

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

export const updatePasswordSchema = z.object({
  password: passwordSchema,
})

export const requestResetSchema = z.object({
  email: emailSchema,
})

export const createWorkReportSchema = z.object({
  workDate: dateSchema,
  contentHtml: z
    .string()
    .min(1, '내용을 입력해주세요.')
    .max(50_000, '내용이 너무 깁니다.'),
  attachmentIds: z.array(z.string().uuid()).optional(),
})

export const updateWorkReportSchema = z.object({
  id: z.string().uuid(),
  contentHtml: z
    .string()
    .min(1, '내용을 입력해주세요.')
    .max(50_000, '내용이 너무 깁니다.'),
})

export const deleteWorkReportSchema = z.object({
  id: z.string().uuid(),
})

export const upsertAttendanceSchema = z.object({
  workDate: dateSchema,
  content: z.string().max(1000, '근태 내용은 최대 1000자까지 입력할 수 있습니다.'),
})

export const deleteAttendanceSchema = z.object({
  workDate: dateSchema,
})

export const registerAttachmentSchema = z.object({
  workReportId: z.string().uuid(),
  storagePath: z.string().min(1),
  fileUrl: z.string().url(),
  fileName: z.string().min(1),
  fileSize: z.number().max(MAX_FILE_SIZE, '파일 크기가 10MB를 초과합니다.'),
  mimeType: z.string().refine(
    (v) => ALLOWED_MIME_TYPES.includes(v),
    '지원하지 않는 파일 형식입니다.'
  ),
})

export const deleteAttachmentSchema = z.object({
  id: z.string().uuid(),
})

export const createMemberSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, '이름을 입력해주세요.').max(50),
  initialPassword: passwordSchema,
  role: z.enum(['member', 'admin']).optional().default('member'),
})

export const setMemberActiveSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean(),
})

export const resetMemberPasswordSchema = z.object({
  userId: z.string().uuid(),
  newPassword: passwordSchema.optional(),
})

export const adminUpdateReportSchema = z.object({
  id: z.string().uuid(),
  contentHtml: z
    .string()
    .min(1, '내용을 입력해주세요.')
    .max(50_000, '내용이 너무 깁니다.'),
})

export const adminDeleteReportSchema = z.object({
  id: z.string().uuid(),
})
