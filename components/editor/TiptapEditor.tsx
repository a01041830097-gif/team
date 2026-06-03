'use client'

import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { TiptapToolbar } from './TiptapToolbar'
import { createClient } from '@/lib/supabase/client'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validation/schemas'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (html: string) => void
  workDate?: string
  className?: string
}

export function TiptapEditor({ value, onChange, workDate, className }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-content outline-none min-h-[200px] px-3 py-2',
      },
    },
    onUpdate({ editor: ed }) {
      onChange(ed.getHTML())
    },
  })

  async function handleImageUpload() {
    fileInputRef.current?.click()
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('지원하지 않는 파일 형식입니다. (jpeg, png, webp, gif)')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기가 10MB를 초과합니다.')
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('로그인이 필요합니다.'); return }

    const ext = file.name.split('.').pop() ?? 'png'
    const date = workDate ?? new Date().toISOString().split('T')[0]
    const path = `${user.id}/${date}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from('work-images').upload(path, file)
    if (error) { toast.error('이미지 업로드에 실패했습니다.'); return }

    const { data: { publicUrl } } = supabase.storage.from('work-images').getPublicUrl(path)
    editor?.chain().focus().setImage({ src: publicUrl }).run()
    toast.success('이미지가 삽입되었습니다.')
  }

  if (!editor) return null

  return (
    <div className={cn('rounded-md border border-border overflow-hidden focus-within:ring-2 focus-within:ring-ring/50', className)}>
      <TiptapToolbar editor={editor} onImageUpload={handleImageUpload} />
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  )
}
