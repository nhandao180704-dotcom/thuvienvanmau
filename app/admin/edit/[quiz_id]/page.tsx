'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.quiz_id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gradeLevel, setGradeLevel] = useState('10')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) fetchQuiz()
  }, [id])

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).single()
      if (error) throw error
      if (data) {
        setTitle(data.title || '')
        setDescription(data.description || '')
        setGradeLevel(data.grade_level || '10')
      }
    } catch (err) {
      console.error(err)
      alert('Không tìm thấy đề thi!')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ title, description, grade_level: gradeLevel })
        .eq('id', id)

      if (error) throw error
      alert('Cập nhật đề thi thành công!')
      router.push('/admin/dashboard?tab=quizzes')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Lỗi khi cập nhật đề thi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải dữ liệu đề thi...</div>
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

          <h1 className="text-2xl font-bold text-slate-900 mb-6">Chỉnh Sửa Đề Thi</h1>

          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên đề thi</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dành cho (Khối lớp)</label>
              <select
                value={gradeLevel}
                onChange={e => setGradeLevel(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none"
              >
                <option value="6">Lớp 6</option>
                <option value="7">Lớp 7</option>
                <option value="8">Lớp 8</option>
                <option value="9">Lớp 9</option>
                <option value="10">Lớp 10</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả đề thi</label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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