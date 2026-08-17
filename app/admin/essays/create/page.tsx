'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import RichTextEditor from '@/components/RichTextEditor'
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function CreateEssayPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  
  // Trạng thái lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    title: '',
    grade: 'Lớp 9',
    genre: 'Văn nghị luận',
    content: '',
  })

  // Xử lý khi chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0])
    }
  }

  // Xử lý lưu bài viết
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài viết!')
      return
    }

    setLoading(true)

    try {
      let thumbnailUrl = ''

      // 1. Upload ảnh bìa lên Supabase Storage (nếu có chọn ảnh)
      if (thumbnail) {
        const fileExt = thumbnail.name.split('.').pop()
        const fileName = `thumb_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('essay_images')
          .upload(`thumbnails/${fileName}`, thumbnail)

        if (uploadError) throw uploadError

        // Lấy link ảnh public để lưu vào Database
        const { data: { publicUrl } } = supabase.storage
          .from('essay_images')
          .getPublicUrl(`thumbnails/${fileName}`)
        
        thumbnailUrl = publicUrl
      }

      // 2. Lưu toàn bộ dữ liệu vào bảng 'essays'
      const { error: insertError } = await supabase
        .from('essays')
        .insert([
          {
            title: formData.title,
            grade: formData.grade,
            genre: formData.genre,
            content: formData.content,
            thumbnail_url: thumbnailUrl, // Tùy thuộc vào việc bảng essays của bạn có cột này hay không
            views: 0
          }
        ])

      if (insertError) throw insertError

      alert('Đăng bài viết thành công!')
      router.push('/admin/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error("Lỗi khi đăng bài:", error)
      alert('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Nút quay lại & Tiêu đề */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard" 
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Thêm Bài Viết Mới</h1>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{loading ? 'Đang lưu...' : 'Xuất bản'}</span>
          </button>
        </div>

        {/* Form nhập liệu */}
        <form className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề bài văn</label>
              <input
                type="text"
                placeholder="VD: Phân tích nhân vật Vũ Nương trong Chuyện người con gái Nam Xương..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Khối Lớp</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium"
                >
                  <option value="Lớp 6">Lớp 6</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 9">Lớp 9</option>
                  <option value="Ôn thi vào 10">Ôn thi vào 10</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Thể loại</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium"
                >
                  <option value="Văn tự sự">Văn tự sự</option>
                  <option value="Văn miêu tả">Văn miêu tả</option>
                  <option value="Văn biểu cảm">Văn biểu cảm</option>
                  <option value="Văn nghị luận">Văn nghị luận</option>
                  <option value="Văn thuyết minh">Văn thuyết minh</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ảnh bìa (Tùy chọn)</label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-solid border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-slate-500 font-medium w-max">
                <ImageIcon size={20} />
                <span>{thumbnail ? thumbnail.name : 'Nhấn để chọn ảnh tải lên'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-4">Nội dung bài viết</label>
            {/* Gọi bộ soạn thảo TipTap vừa tạo */}
            <RichTextEditor 
              content={formData.content} 
              onChange={(richText: string) => setFormData({ ...formData, content: richText })} 
            />
          </div>
        </form>
      </div>
    </div>
  )
}