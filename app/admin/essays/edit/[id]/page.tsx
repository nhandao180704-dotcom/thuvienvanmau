'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import RichTextEditor from '@/components/RichTextEditor'
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function EditEssayPage() {
  const router = useRouter()
  const params = useParams()
  const essayId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('') 
  
  const [formData, setFormData] = useState({
    title: '',
    grade: 'Lớp 9',
    genre: 'Văn nghị luận',
    content: '',
  })

  // --- HỆ THỐNG CHUYỂN ĐỔI FORMAT CHO KHỚP VỚI DATABASE ---
  const mapToGenre = (category: string) => {
    const map: Record<string, string> = {
      'văn_tự_sự': 'Văn tự sự',
      'văn_miêu_tả': 'Văn miêu tả',
      'văn_biểu_cảm': 'Văn biểu cảm',
      'văn_nghị_luận': 'Văn nghị luận',
      'văn_thuyết_minh': 'Văn thuyết minh',
      'phân_tích_tác_phẩm': 'Phân tích tác phẩm'
    }
    return map[category] || 'Văn nghị luận'
  }

  const mapToCategory = (genre: string) => {
    const map: Record<string, string> = {
      'Văn tự sự': 'văn_tự_sự',
      'Văn miêu tả': 'văn_miêu_tả',
      'Văn biểu cảm': 'văn_biểu_cảm',
      'Văn nghị luận': 'văn_nghị_luận',
      'Văn thuyết minh': 'văn_thuyết_minh',
      'Phân tích tác phẩm': 'phân_tích_tác_phẩm'
    }
    return map[genre] || 'văn_nghị_luận'
  }

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
          // Ánh xạ dữ liệu từ DB lên UI Form
          setFormData({
            title: data.title || '',
            grade: data.class_level ? (data.class_level === 10 ? 'Ôn thi vào 10' : `Lớp ${data.class_level}`) : 'Lớp 9',
            genre: data.category ? mapToGenre(data.category) : 'Văn nghị luận',
            content: data.content || '',
          })
          if (data.thumbnail_url) setThumbnailUrl(data.thumbnail_url)
        }
      } catch (error: any) {
        console.error("Lỗi khi tải bài viết:", error.message)
        alert("Không tìm thấy dữ liệu bài viết này!")
        router.push('/admin/essays')
      } finally {
        setLoading(false)
      }
    }

    if (essayId) fetchEssayDetail()
  }, [essayId, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0])
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài viết!')
      return
    }

    setSaving(true)

    try {
      // Ép kiểu 'Lớp 9' thành số 9 để lưu DB
      let classLevel = 9;
      if (formData.grade === 'Ôn thi vào 10') {
        classLevel = 10;
      } else {
        const match = formData.grade.match(/\d+/)
        if (match) classLevel = parseInt(match[0])
      }

      const updateData: any = {
        title: formData.title,
        class_level: classLevel,
        category: mapToCategory(formData.genre),
        content: formData.content,
      }

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

  // --- UI CHỜ TẢI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />
        <AdminHeader onSearch={() => {}} />
        <main className="fixed top-16 right-0 left-0 md:left-64 bottom-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="font-medium">Đang tải dữ liệu bài viết...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminHeader onSearch={() => {}} />

      <main className="fixed top-16 right-0 left-0 md:left-64 bottom-0 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto pb-20">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/essays" 
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Chỉnh sửa Bài viết</h1>
            </div>
            
            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all shrink-0"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>

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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium bg-white"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium bg-white"
                  >
                    <option value="Văn tự sự">Văn tự sự</option>
                    <option value="Văn miêu tả">Văn miêu tả</option>
                    <option value="Văn biểu cảm">Văn biểu cảm</option>
                    <option value="Văn nghị luận">Văn nghị luận</option>
                    <option value="Văn thuyết minh">Văn thuyết minh</option>
                    <option value="Phân tích tác phẩm">Phân tích tác phẩm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Đổi ảnh bìa (Nếu cần)</label>
                <div className="flex items-center gap-4">
                  {thumbnailUrl && !thumbnail && (
                    <img src={thumbnailUrl} alt="Thumbnail" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                  )}
                  <label className="flex flex-1 sm:flex-none items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-slate-500 font-medium">
                    <ImageIcon size={20} />
                    <span className="truncate max-w-[200px]">{thumbnail ? thumbnail.name : 'Chọn ảnh mới để thay thế'}</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-4">Nội dung bài viết</label>
              <RichTextEditor 
                content={formData.content} 
                onChange={(richText: string) => setFormData({ ...formData, content: richText })} 
              />
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}