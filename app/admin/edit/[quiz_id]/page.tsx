'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ArrowLeft, Save, HelpCircle } from 'lucide-react'

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.quiz_id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gradeLevel, setGradeLevel] = useState('10')
  const [questions, setQuestions] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) fetchQuizAndQuestions()
  }, [id])

  const fetchQuizAndQuestions = async () => {
    try {
      // 1. Lấy thông tin chung của quiz
      const { data: quizData, error: quizError } = await supabase.from('quizzes').select('*').eq('id', id).single()
      if (quizError) throw quizError
      if (quizData) {
        setTitle(quizData.title || '')
        setDescription(quizData.description || '')
        setGradeLevel(quizData.grade_level || '10')
      }

      // 2. Lấy danh sách câu hỏi và các lựa chọn (options) liên quan
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', id)

      if (qError) throw qError
      if (qData) {
        setQuestions(qData)
      }
    } catch (err) {
      console.error(err)
      alert('Không thể tải dữ liệu đề thi!')
    } finally {
      setLoading(false)
    }
  }

  // Cập nhật nội dung câu hỏi trên state tạm thời
  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].question_text = text
    setQuestions(updated)
  }

  // Cập nhật nội dung đáp án trên state tạm thời
  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].options[optIndex].option_text = text
    setQuestions(updated)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // 1. Cập nhật bảng quizzes
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({ title, description, grade_level: gradeLevel })
        .eq('id', id)

      if (quizError) throw quizError

      // 2. Cập nhật từng câu hỏi và các đáp án của nó
      for (const q of questions) {
        // Cập nhật câu hỏi chính
        await supabase
          .from('questions')
          .update({ question_text: q.question_text })
          .eq('id', q.id)

        // Cập nhật các lựa chọn (options)
        if (q.options && Array.isArray(q.options)) {
          for (const opt of q.options) {
            await supabase
              .from('options')
              .update({ option_text: opt.option_text })
              .eq('id', opt.id)
          }
        }
      }

      alert('Cập nhật đề thi và câu hỏi thành công!')
      router.push('/admin/dashboard?tab=quizzes')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Lỗi khi cập nhật đề thi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải dữ liệu đề thi và câu hỏi...</div>
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

          <h1 className="text-2xl font-bold text-slate-900 mb-6">Chỉnh Sửa Đề Thi & Câu Hỏi</h1>

          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Phần thông tin chung */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Thông tin chung</h2>
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
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Phần danh sách câu hỏi và đáp án */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" /> Danh sách câu hỏi ({questions.length})
              </h2>

              {questions.map((q, qIndex) => (
                <div key={q.id || qIndex} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Câu hỏi {qIndex + 1}</label>
                    <input
                      type="text"
                      value={q.question_text || ''}
                      onChange={e => handleQuestionTextChange(qIndex, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                      required
                    />
                  </div>

                  {/* Danh sách các lựa chọn A, B, C, D */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-blue-100">
                    {q.options && q.options.map((opt: any, optIndex: number) => (
                      <div key={opt.id || optIndex} className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 w-6">{opt.option_key || opt.key || String.fromCharCode(65 + optIndex)}.</span>
                        <input
                          type="text"
                          value={opt.option_text || opt.text || ''}
                          onChange={e => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Nút lưu */}
            <div className="flex justify-end pt-4 pb-12">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> {saving ? 'Đang lưu tất cả...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}