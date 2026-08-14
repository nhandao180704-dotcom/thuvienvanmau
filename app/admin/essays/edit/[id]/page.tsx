'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import RichTextEditor from '@/components/RichTextEditor'
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function EditEssayPage() {
  const router = useRouter()
  const params = useParams()
  const essayId = params.id as string // Lấy ID bài viết từ trên thanh địa chỉ URL

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    grade: 'Lớp 9',
    genre: 'Văn nghị luận',
    content: '',
  })

  // 1. Tải dữ liệu cũ của bài viết khi vừa vào trang
  useEffect(() => {
    const fetchEssayDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('essays')
          .select('*')
          .eq('id', essayId)
          .single()

        if (error) throw error

        if (data) {
          // Đổ dữ liệu cũ vào form
          setFormData({
            title: data.title,
            grade: data.grade,
            genre: data.genre,
            content: data.content,
          })
        }
      } catch (error: any) {
        console.error("Lỗi khi tải bài viết:", error.message)
        alert("Không tìm thấy dữ liệu bài viết này!")
        router.push('/admin/essays')
      } finally {
        setLoading(false)
      }
    }

    if (essayId) {
      fetchEssayDetail()
    }
  }, [essayId, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0])
    }
  }

  // 2. Xử lý khi bấm nút "Cập nhật"
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài viết!')
      return
    }

    setSaving(true)

    try {
      const updateData: any = {
        title: formData.title,
        grade: formData.grade,
        genre: formData.genre,
        content: formData.content,
      }

      // Xử lý upload ảnh mới nếu có
      if (thumbnail) {
        const fileExt = thumbnail.name.split('.').pop()
        const fileName = `thumb_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('essay_images')
          .upload(`thumbnails/${fileName}`, thumbnail)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('essay_images')
          .getPublicUrl(`thumbnails/${fileName}`)
        
        updateData.thumbnail_url = publicUrl
      }

      // Lệnh UPDATE để ghi đè dữ liệu mới vào ID cũ
      const { error: updateError } = await supabase
        .from('essays')
        .update(updateData)
        .eq('id', essayId)

      if (updateError) throw updateError

      alert('Cập nhật bài viết thành công!')
      router.push('/admin/essays')
      router.refresh()
    } catch (error: any) {
      console.error("Lỗi khi cập nhật:", error)
      alert('Có lỗi xảy ra: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="font-medium">Đang tải dữ liệu bài viết...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Nút quay lại & Tiêu đề */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/essays" 
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Chỉnh sửa Bài viết</h1>
          </div>
          
          <button 
            onClick={handleUpdate}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>

        {/* Form nhập liệu */}
        <form className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề bài văn</label>
              <input
                type="text"
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Đổi ảnh bìa (Nếu cần)</label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-slate-500 font-medium w-max">
                <ImageIcon size={20} />
                <span>{thumbnail ? thumbnail.name : 'Chọn ảnh mới để thay thế'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-4">Nội dung bài viết</label>
            {/* Vẫn sử dụng component TipTap cực mượt */}
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