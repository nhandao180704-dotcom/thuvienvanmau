'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditEssayPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [grade, setGrade] = useState('Lớp 6')
  const [genre, setGenre] = useState('Văn biểu cảm')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEssay()
  }, [id])

  const fetchEssay = async () => {
    try {
      const { data, error } = await supabase.from('essays').select('*').eq('id', id).single()
      if (error) throw error
      if (data) {
        setTitle(data.title)
        setContent(data.content)
        setGrade(data.grade)
        setGenre(data.genre)
      }
    } catch (err) {
      console.error(err)
      alert('Không tìm thấy bài viết!')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('essays')
        .update({ title, content, grade, genre })
        .eq('id', id)

      if (error) throw error
      alert('Cập nhật bài viết thành công!')
      router.push('/admin/dashboard?tab=essays')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Lỗi khi cập nhật bài viết')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu bài viết...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AdminHeader adminEmail="admin@gmail.com" onSearch={() => {}} onLogout={() => router.push('/admin/login')} />

        <main className="flex-1 p-8 overflow-y-auto mt-16 max-w-4xl mx-auto w-full">
          <button onClick={() => router.back()} className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </button>

          <h1 className="text-2xl font-bold text-slate-900 mb-6">Chỉnh Sửa Bài Viết</h1>

          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề bài viết</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="Lớp 6">Lớp 6</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 9">Lớp 9</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thể loại</label>
                <input
                  type="text"
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung bài văn</label>
              <textarea
                rows={10}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}