'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Heading2, List, ListOrdered, Undo, Redo } from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (richText: string) => void
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[300px] p-4 focus:outline-none text-slate-800',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      {/* Thanh công cụ định dạng */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : ''}`}
          title="In đậm"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : ''}`}
          title="In nghiêng"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : ''}`}
          title="Tiêu đề lớn"
        >
          <Heading2 size={18} />
        </button>
        <div className="w-[1px] h-6 bg-slate-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : ''}`}
          title="Danh sách chấm"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : ''}`}
          title="Danh sách số"
        >
          <ListOrdered size={18} />
        </button>
        <div className="w-[1px] h-6 bg-slate-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
          title="Hoàn tác"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
          title="Làm lại"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Khu vực soạn thảo văn bản */}
      <EditorContent editor={editor} />
    </div>
  )
}