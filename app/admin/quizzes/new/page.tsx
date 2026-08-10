'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ToastContainer, useToast } from '@/components/Toast'
import { Plus, Trash2, ArrowLeft, Save, CheckCircle2, Clock } from 'lucide-react'

interface QuestionInput {
  question_text: string
  explanation: string
  correct_answer: string
  options: { option_key: string; option_text: string }[]
}

function QuizForm() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gradeLevel, setGradeLevel] = useState('10')
  const [timeLimit, setTimeLimit] = useState(15) // --- BỔ SUNG THỜI GIAN LÀM BÀI MẶC ĐỊNH LÀ 15P ---

  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      question_text: '',
      explanation: '',
      correct_answer: 'A',
      options: [
        { option_key: 'A', option_text: '' },
        { option_key: 'B', option_text: '' },
        { option_key: 'C', option_text: '' },
        { option_key: 'D', option_text: '' },
      ],
    },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        explanation: '',
        correct_answer: 'A',
        options: [
          { option_key: 'A', option_text: '' },
          { option_key: 'B', option_text: '' },
          { option_key: 'C', option_text: '' },
          { option_key: 'D', option_text: '' },
        ],
      },
    ])
  }

  const removeQuestion = (qIndex: number) => {
    if (questions.length === 1) {
      showError('Đề thi phải có ít nhất 1 câu hỏi!')
      return
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex))
  }

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].question_text = text
    setQuestions(updated)
  }

  const handleExplanationChange = (qIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].explanation = text
    setQuestions(updated)
  }

  const handleOptionTextChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex].option_text = text
    setQuestions(updated)
  }

  const handleCorrectAnswerChange = (qIndex: number, correctKey: string) => {
    const updated = [...questions]
    updated[qIndex].correct_answer = correctKey
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      showError('Vui lòng nhập tiêu đề đề thi!')
      return
    }
    
    if (timeLimit < 1) {
      showError('Thời gian làm bài phải lớn hơn 0 phút!')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim()) {
        showError(`Câu hỏi số ${i + 1} chưa có nội dung!`)
        return
      }
    }

    setLoading(true)
    try {
      // 1. Tạo mới đề thi (quizzes) - Đã thêm time_limit
      const { data: quizData, error: quizErr } = await supabase
        .from('quizzes')
        .insert([{ title, description, grade_level: gradeLevel, time_limit: timeLimit }])
        .select()
        .single()

      if (quizErr) throw quizErr

      // 2. Tạo các câu hỏi và lựa chọn tương ứng
      for (const q of questions) {
        const { data: qData, error: qErr } = await supabase
          .from('questions')
          .insert([{ 
            quiz_id: quizData.id, 
            question_text: q.question_text, 
            explanation: q.explanation,
            correct_answer: q.correct_answer 
          }])
          .select()
          .single()

        if (qErr) throw qErr

        const optionsToInsert = q.options.map(opt => ({
          question_id: qData.id,
          option_key: opt.option_key,
          option_text: opt.option_text
        }))

        const { error: optErr } = await supabase.from('options').insert(optionsToInsert)
        if (optErr) throw optErr
      }

      success('Tạo đề thi trắc nghiệm thành công!')
      setTimeout(() => router.push('/admin/dashboard?tab=quizzes'), 1500)
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

      <main className="fixed top-16 right-0 left-64 bottom-0 overflow-y-auto p-8 max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Tạo Đề Thi Trắc Nghiệm Mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề đề thi</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Đề thi thử Ngữ Văn vào lớp 10 - Đề số 1"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* --- CẬP NHẬT GRID THÀNH 3 CỘT ĐỂ THÊM THỜI GIAN LÀM BÀI --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dành cho khối lớp</label>
                <select
                  value={gradeLevel}
                  onChange={e => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="6">Lớp 6</option>
                  <option value="7">Lớp 7</option>
                  <option value="8">Lớp 8</option>
                  <option value="9">Lớp 9</option>
                  <option value="10">Ôn thi vào 10</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                  <Clock className="w-4 h-4" /> Thời gian làm bài (Phút)
                </label>
                <input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={e => setTimeLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả cấu trúc đề thi..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    Câu hỏi {qIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={q.question_text}
                    onChange={e => handleQuestionTextChange(qIndex, e.target.value)}
                    placeholder="Nhập câu hỏi tại đây..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-blue-100">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 w-6">{opt.option_key}.</span>
                        <input
                          type="text"
                          value={opt.option_text}
                          onChange={e => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Lựa chọn ${opt.option_key}`}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500"
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
                            name={`correct-${qIndex}`} 
                            value={key}
                            checked={q.correct_answer === key}
                            onChange={() => handleCorrectAnswerChange(qIndex, key)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className={`text-sm font-bold ${q.correct_answer === key ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {key}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={q.explanation}
                    onChange={e => handleExplanationChange(qIndex, e.target.value)}
                    placeholder="Lời giải thích đáp án đúng (không bắt buộc)"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none mt-2"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition"
            >
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {loading ? 'Đang lưu...' : 'Lưu Đề Thi'}
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