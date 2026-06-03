'use client'

import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading2, Heading3, Quote, Code, Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Props = {
  editor: Editor
  onImageUpload?: () => void
}

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(active && 'bg-muted text-foreground')}
    >
      {children}
    </Button>
  )
}

export function TiptapToolbar({ editor, onImageUpload }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-border bg-muted/30 rounded-t-md">
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="굵게"
      >
        <Bold className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="기울임"
      >
        <Italic className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="밑줄"
      >
        <UnderlineIcon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="취소선"
      >
        <Strikethrough className="size-3.5" />
      </ToolBtn>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="제목 2"
      >
        <Heading2 className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="제목 3"
      >
        <Heading3 className="size-3.5" />
      </ToolBtn>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="목록"
      >
        <List className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="번호 목록"
      >
        <ListOrdered className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="인용"
      >
        <Quote className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="코드"
      >
        <Code className="size-3.5" />
      </ToolBtn>

      {onImageUpload && (
        <>
          <Separator orientation="vertical" className="h-5 mx-0.5" />
          <ToolBtn onClick={onImageUpload} title="이미지 삽입">
            <ImageIcon className="size-3.5" />
          </ToolBtn>
        </>
      )}
    </div>
  )
}
