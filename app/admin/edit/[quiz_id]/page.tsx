'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ArrowLeft, Save, HelpCircle, Trash2, Plus, CheckCircle2 } from 'lucide-react'

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
      const { data: quizData, error: quizError } = await supabase.from('quizzes').select('*').eq('id', id).single()
      if (quizError) throw quizError
      if (quizData) {
        setTitle(quizData.title || '')
        setDescription(quizData.description || '')
        setGradeLevel(quizData.grade_level || '10')
      }

      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', id)
        .order('created_at', { ascending: true })

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

  // --- THÊM CÂU HỎI MỚI VÀO STATE ---
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`, // ID tạm thời để React nhận diện
      quiz_id: id,
      question_text: '',
      correct_answer: 'A', // Mặc định đáp án đúng là A
      isNew: true, // Cờ đánh dấu đây là câu hỏi mới cần Insert
      options: [
        { option_key: 'A', option_text: '' },
        { option_key: 'B', option_text: '' },
        { option_key: 'C', option_text: '' },
        { option_key: 'D', option_text: '' }
      ]
    }
    setQuestions([...questions, newQuestion])
  }

  // --- XÓA CÂU HỎI ---
  const handleDeleteQuestion = async (qIndex: number, qId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return

    if (!qId.toString().startsWith('temp-')) {
      try {
        const { error } = await supabase.from('questions').delete().eq('id', qId)
        if (error) throw error
      } catch (err) {
        console.error(err)
        alert('Lỗi khi xóa câu hỏi trong cơ sở dữ liệu!')
        return
      }
    }

    const updated = [...questions]
    updated.splice(qIndex, 1)
    setQuestions(updated)
  }

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].question_text = text
    setQuestions(updated)
  }

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].options[optIndex].option_text = text
    setQuestions(updated)
  }

  const handleCorrectAnswerChange = (qIndex: number, correctKey: string) => {
    const updated = [...questions]
    updated[qIndex].correct_answer = correctKey
    setQuestions(updated)
  }

  // --- LƯU TOÀN BỘ THAY ĐỔI ---
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

      // 2. Cập nhật/Thêm mới từng câu hỏi
      for (const q of questions) {
        if (q.isNew) {
          // THÊM MỚI (INSERT) - Đã bổ sung correct_answer
          const { data: newQ, error: newQErr } = await supabase
            .from('questions')
            .insert({ 
              quiz_id: id, 
              question_text: q.question_text,
              correct_answer: q.correct_answer || 'A'
            })
            .select().single()

          if (newQErr) throw newQErr

          if (q.options) {
            const optionsToInsert = q.options.map((opt: any) => ({
              question_id: newQ.id,
              option_key: opt.option_key,
              option_text: opt.option_text
            }))
            await supabase.from('options').insert(optionsToInsert)
          }
        } else {
          // CẬP NHẬT (UPDATE) câu hỏi cũ - Đã bổ sung correct_answer
          await supabase
            .from('questions')
            .update({ 
              question_text: q.question_text,
              correct_answer: q.correct_answer || 'A'
            })
            .eq('id', q.id)

          if (q.options && Array.isArray(q.options)) {
            for (const opt of q.options) {
              if (opt.id) {
                await supabase
                  .from('options')
                  .update({ option_text: opt.option_text })
                  .eq('id', opt.id)
              }
            }
          }
        }
      }

      alert('Đã lưu đề thi và các câu hỏi thành công!')
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
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Thông tin chung</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên đề thi</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dành cho (Khối lớp)</label>
                <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none">
                  <option value="6">Lớp 6</option>
                  <option value="7">Lớp 7</option>
                  <option value="8">Lớp 8</option>
                  <option value="9">Lớp 9</option>
                  <option value="10">Lớp 10</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả đề thi</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" /> Danh sách câu hỏi ({questions.length})
              </h2>

              {questions.map((q, qIndex) => (
                <div key={q.id || qIndex} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-slate-700">Câu hỏi {qIndex + 1}</label>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteQuestion(qIndex, q.id)}
                      className="text-slate-400 hover:text-red-600 transition p-1"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={q.question_text || ''}
                    onChange={e => handleQuestionTextChange(qIndex, e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                    placeholder="Nhập nội dung câu hỏi..."
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-blue-100">
                    {q.options && q.options.map((opt: any, optIndex: number) => (
                      <div key={opt.id || optIndex} className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 w-6">{opt.option_key || opt.key || String.fromCharCode(65 + optIndex)}.</span>
                        <input
                          type="text"
                          value={opt.option_text || opt.text || ''}
                          onChange={e => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500"
                          placeholder={`Lựa chọn ${opt.option_key || String.fromCharCode(65 + optIndex)}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  {/* KHU VỰC CHỌN ĐÁP ÁN ĐÚNG */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-3">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Đáp án đúng:
                    </span>
                    <div className="flex gap-4">
                      {['A', 'B', 'C', 'D'].map(key => (
                        <label key={key} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded">
                          <input 
                            type="radio" 
                            name={`correct-${q.id || qIndex}`} 
                            value={key}
                            checked={q.correct_answer === key || (!q.correct_answer && key === 'A')}
                            onChange={() => handleCorrectAnswerChange(qIndex, key)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className={`text-sm font-bold ${q.correct_answer === key || (!q.correct_answer && key === 'A') ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {key}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition"
                >
                  <Plus className="w-5 h-5" /> Thêm câu hỏi
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 pb-12 border-t border-slate-200">
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