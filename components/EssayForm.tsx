'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Essay } from '@/lib/supabase-client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from './Toast'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="p-4 border rounded-lg text-slate-400 bg-slate-50 animate-pulse">Đang tải công cụ soạn thảo...</div>
})

interface EssayFormProps {
  essayId?: string
}

// 1. Danh sách Thể loại (Lưu vào cột genre)
const GENRES = [
  { value: 'Văn biểu cảm', label: 'Văn biểu cảm' },
  { value: 'Văn tự sự', label: 'Văn tự sự' },
  { value: 'Văn thuyết minh', label: 'Văn thuyết minh' },
  { value: 'Văn nghị luận', label: 'Văn nghị luận' },
  { value: 'Phân tích tác phẩm', label: 'Phân tích tác phẩm' },
]

// ĐÃ TỐI ƯU: Danh sách Chuyên mục dùng chung cho toàn khối THCS
const CATEGORIES = [
  { value: 'van-mau', label: 'Văn mẫu chung (Mặc định)' },
  { value: 'dan-y', label: 'Lập dàn ý bài văn/thơ' },
  { value: 'de-thi-thu', label: 'Đề thi thử / Đề minh họa' },
  { value: 'bi-kip', label: 'Bí kíp đạt điểm cao môn Văn' },
]

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
}

export default function EssayForm({ essayId }: EssayFormProps) {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(!!essayId)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    class_level: 6,
    genre: 'Văn biểu cảm', 
    category: 'van-mau',   
    author: '',
    content: '',
    outline_intro: '',
    outline_body: '',
    outline_conclusion: '',
    status: 'draft' as const,
  })

  useEffect(() => {
    if (!essayId) {
      setLoading(false)
      return
    }

    const fetchEssay = async () => {
      try {
        const { data, error } = await supabase
          .from('essays')
          .select('*')
          .eq('id', essayId)
          .single()

        if (error) throw error

        setFormData({
          title: data.title,
          class_level: data.class_level,
          genre: data.genre || 'Văn biểu cảm',
          category: data.category || 'van-mau',
          author: data.author,
          content: data.content,
          outline_intro: data.outline_intro || '',
          outline_body: data.outline_body || '',
          outline_conclusion: data.outline_conclusion || '',
          status: data.status,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch essay')
      } finally {
        setLoading(false)
      }
    }

    fetchEssay()
  }, [essayId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const cleanContent = formData.content.replace(/<[^>]*>?/gm, '').trim()
      
      if (!formData.title.trim()) throw new Error('Tiêu đề không được bỏ trống')
      if (!formData.author.trim()) throw new Error('Tác giả không được bỏ trống')
      if (!cleanContent) throw new Error('Nội dung không được bỏ trống')

      const essayData = {
        title: formData.title.trim(),
        class_level: formData.class_level,
        genre: formData.genre,
        category: formData.category, 
        author: formData.author.trim(),
        content: formData.content,
        outline_intro: formData.outline_intro.trim() || null,
        outline_body: formData.outline_body.trim() || null,
        outline_conclusion: formData.outline_conclusion.trim() || null,
        status: formData.status,
        ...(essayId ? {} : { views: 0 })
      }

      if (essayId) {
        const { error } = await supabase.from('essays').update(essayData).eq('id', essayId)
        if (error) throw error
        success('Cập nhật bài viết thành công!')
      } else {
        const { error } = await supabase.from('essays').insert([essayData])
        if (error) throw error
        success('Tạo bài viết thành công!')
      }

      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 800)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi lưu bài viết'
      setError(message)
      showError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {essayId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
          <div style={{ width: '80px' }} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nhập tiêu đề bài viết"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Lớp <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({ ...formData, class_level: parseInt(e.target.value) as any })}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {/* ĐÃ TỐI ƯU: Thêm tùy chọn số 0 biểu thị cho "Dùng chung" mọi khối lớp */}
                {[6, 7, 8, 9, 0].map(level => (
                  <option key={level} value={level}>
                    {level === 0 ? 'Dùng chung (Mọi khối)' : `Lớp ${level}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chuyên mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-blue-50/50 font-semibold text-blue-700"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Thể loại <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {GENRES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tác giả <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nhập tên tác giả"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <div className="bg-white rounded-lg">
              <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={(content) => setFormData({ ...formData, content })} 
                modules={quillModules}
                className="h-[400px] mb-12" 
                placeholder="Viết nội dung tại đây..."
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-semibold text-foreground">Dàn ý (Tùy chọn)</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mở bài</label>
              <textarea
                value={formData.outline_intro}
                onChange={(e) => setFormData({ ...formData, outline_intro: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Thân bài</label>
              <textarea
                value={formData.outline_body}
                onChange={(e) => setFormData({ ...formData, outline_body: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Kết bài</label>
              <textarea
                value={formData.outline_conclusion}
                onChange={(e) => setFormData({ ...formData, outline_conclusion: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                rows={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="draft">Nháp</option>
              <option value="published">Đã xuất bản</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>

          <div className="flex gap-4 pt-6 pb-20">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:bg-primary/60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {submitting ? 'Đang lưu...' : essayId ? 'Cập nhật' : 'Xuất bản bài viết'}
            </button>
            <Link
              href="/admin/dashboard"
              className="flex-1 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-slate-50 transition-colors text-center"
            >
              Hủy
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}