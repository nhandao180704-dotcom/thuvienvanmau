'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ToastContainer, useToast } from '@/components/Toast'
import { Plus, Trash2, ArrowLeft, Save, CheckCircle2, Clock, ListChecks, Type, Loader2 } from 'lucide-react'

function QuizForm() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Thông tin chung của đề thi
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState('Lớp 9')
  const [duration, setDuration] = useState(45)

  // Danh sách câu hỏi động (Hỗ trợ cả Trắc nghiệm & Tự luận)
  const [questions, setQuestions] = useState<any[]>([
    {
      id: Date.now().toString(),
      type: 'multiple_choice',
      content: '',
      points: 1,
      options: ['', '', '', ''], // 4 đáp án A, B, C, D
      correct_answer: '0' // Index của đáp án đúng (0 = A, 1 = B...)
    }
  ])

  // Thêm câu hỏi mới
  const addQuestion = (type: 'multiple_choice' | 'essay') => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        type: type,
        content: '',
        points: 1,
        options: type === 'multiple_choice' ? ['', '', '', ''] : null,
        correct_answer: type === 'multiple_choice' ? '0' : ''
      }
    ])
  }

  // Xóa câu hỏi
  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      showError('Đề thi phải có ít nhất 1 câu hỏi!')
      return
    }
    setQuestions(questions.filter(q => q.id !== id))
  }

  // Hàm cập nhật dữ liệu chung cho câu hỏi
  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  // Hàm cập nhật riêng cho đáp án trắc nghiệm (A, B, C, D)
  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  // Xử lý nộp bài lên Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      showError('Vui lòng nhập tiêu đề đề thi!')
      return
    }
    if (duration < 1) {
      showError('Thời gian làm bài phải lớn hơn 0 phút!')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].content.trim()) {
        showError(`Câu hỏi số ${i + 1} chưa có nội dung!`)
        return
      }
    }

    setLoading(true)
    try {
      // 1. Lưu thông tin Đề thi vào bảng quizzes
      const { data: quizData, error: quizErr } = await supabase
        .from('quizzes')
        .insert([{ 
          title, 
          grade, 
          duration,
          is_published: true 
        }])
        .select()
        .single()

      if (quizErr) throw quizErr

      // 2. Format lại dữ liệu câu hỏi để nhét options vào chuẩn JSONB
      const questionsToInsert = questions.map((q, index) => ({
        quiz_id: quizData.id,
        question_type: q.type,
        content: q.content,
        points: q.points,
        order_index: index,
        options: q.type === 'multiple_choice' ? {
          'A': q.options[0],
          'B': q.options[1],
          'C': q.options[2],
          'D': q.options[3]
        } : null,
        correct_answer: q.type === 'multiple_choice' ? ['A', 'B', 'C', 'D'][parseInt(q.correct_answer)] : q.correct_answer
      }))

      // 3. Lưu toàn bộ câu hỏi 1 lần duy nhất
      const { error: qErr } = await supabase.from('questions').insert(questionsToInsert)
      if (qErr) throw qErr

      success('Tạo đề thi thành công!')
      setTimeout(() => router.push('/admin/dashboard'), 1500)
    } catch (err: any) {
      console.error(err)
      showError(err.message || 'Có lỗi xảy ra khi tạo đề thi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminHeader onSearch={() => {}} />

      <main className="fixed top-16 right-0 left-0 md:left-64 bottom-0 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </button>

        <h1 className="text-2xl font-black text-slate-900 mb-6">Tạo Đề Thi Mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          
          {/* KHỐI 1: THÔNG TIN CHUNG */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Cài đặt chung</h2>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề đề thi</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="VD: Đề kiểm tra 15 phút môn Ngữ Văn..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Dành cho khối lớp</label>
                <select value={grade} onChange={e => setGrade(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium">
                  <option value="Lớp 6">Lớp 6</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 9">Lớp 9</option>
                  <option value="Ôn thi vào 10">Ôn thi vào 10</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-1">
                  <Clock className="w-4 h-4" /> Thời gian làm bài (Phút)
                </label>
                <input type="number" min="1" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
              </div>
            </div>
          </div>

          {/* KHỐI 2: QUẢN LÝ CÂU HỎI */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-800">Danh sách Câu hỏi</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => addQuestion('multiple_choice')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-lg transition-colors">
                  <ListChecks size={16} /> Thêm Trắc nghiệm
                </button>
                <button type="button" onClick={() => addQuestion('essay')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors">
                  <Type size={16} /> Thêm Tự luận
                </button>
              </div>
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group animate-in slide-in-from-bottom-4 duration-300">
                <button type="button" onClick={() => removeQuestion(q.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-500 text-sm uppercase tracking-wider">
                    {q.type === 'multiple_choice' ? 'Câu hỏi Trắc nghiệm' : 'Câu hỏi Tự luận'}
                  </span>
                </div>

                <div className="space-y-4">
                  <textarea placeholder="Nhập nội dung câu hỏi tại đây..." value={q.content} onChange={e => updateQuestion(q.id, 'content', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium min-h-[100px]" required />

                  {/* Vùng Trắc nghiệm */}
                  {q.type === 'multiple_choice' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-blue-100">
                        {['A', 'B', 'C', 'D'].map((label, optIndex) => (
                          <div key={label} className="flex items-center gap-2">
                            <span className="font-bold text-slate-500 w-6">{label}.</span>
                            <input type="text" value={q.options[optIndex]} onChange={e => updateOption(q.id, optIndex, e.target.value)}
                              placeholder={`Lựa chọn ${label}`} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500" required />
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-3">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Đáp án đúng:
                        </span>
                        <div className="flex gap-4">
                          {['A', 'B', 'C', 'D'].map((key, optIdx) => (
                            <label key={key} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded">
                              <input type="radio" name={`correct-${q.id}`} value={optIdx.toString()}
                                checked={q.correct_answer === optIdx.toString()} onChange={() => updateQuestion(q.id, 'correct_answer', optIdx.toString())}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer" />
                              <span className={`text-sm font-bold ${q.correct_answer === optIdx.toString() ? 'text-emerald-700' : 'text-slate-600'}`}>{key}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Vùng Tự luận */}
                  {q.type === 'essay' && (
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Đáp án / Từ khóa tham khảo</label>
                      <textarea placeholder="Nhập các ý chính để dễ dàng chấm điểm sau này..." value={q.correct_answer} onChange={e => updateQuestion(q.id, 'correct_answer', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-emerald-500 outline-none min-h-[80px] text-sm" />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 mt-4">Điểm số</label>
                    <input type="number" min="0.5" step="0.5" value={q.points} onChange={e => updateQuestion(q.id, 'points', parseFloat(e.target.value) || 0)}
                      className="w-32 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? 'Đang lưu...' : 'Xuất bản Đề Thi'}
            </button>
          </div>
        </form>
      </main>
      <ToastContainer />
    </div>
  )
}

export default function CreateQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Đang tải dữ liệu...</div>}>
      <QuizForm />
    </Suspense>
  )
}