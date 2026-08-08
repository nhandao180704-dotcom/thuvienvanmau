'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ToastContainer, useToast } from '@/components/Toast'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'

interface QuestionInput {
  question_text: string
  explanation: string
  options: { option_text: string; is_correct: boolean }[]
}

export default function CreateQuizPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gradeLevel, setGradeLevel] = useState('10')
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      question_text: '',
      explanation: '',
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        explanation: '',
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
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

  const handleSelectCorrectOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options = updated[qIndex].options.map((opt, idx) => ({
      ...opt,
      is_correct: idx === oIndex,
    }))
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      showError('Vui lòng nhập tiêu đề đề thi!')
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
      // 1. Tạo Quiz
      const { data: quizData, error: quizErr } = await supabase
        .from('quizzes')
        .insert([{ title, description, grade_level: gradeLevel }])
        .select()
        .single()

      if (quizErr) throw quizErr

      // 2. Thêm từng câu hỏi & đáp án
      for (const q of questions) {
        const { data: qData, error: qErr } = await supabase
          .from('questions')
          .insert([{ quiz_id: quizData.id, question_text: q.question_text, explanation: q.explanation }])
          .select()
          .single()

        if (qErr) throw qErr

        const optionsToInsert = q.options.map(opt => ({
          question_id: qData.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        }))

        const { error: optErr } = await supabase.from('options').insert(optionsToInsert)
        if (optErr) throw optErr
      }

      success('Tạo đề thi trắc nghiệm thành công!')
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
      <AdminHeader adminEmail="admin@gmail.com" onSearch={() => {}} onLogout={() => router.push('/admin/login')} />

      <main className="fixed top-16 right-0 left-64 bottom-0 overflow-y-auto p-8 max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Tạo Đề Thi Trắc Nghiệm Mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin đề thi */}
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

            <div className="grid grid-cols-2 gap-4">
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

          {/* Danh sách câu hỏi */}
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

                  {/* 4 Đáp án */}
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2 border p-2 rounded-xl">
                        <input
                          type="radio"
                          name={`correct_${qIndex}`}
                          checked={opt.is_correct}
                          onChange={() => handleSelectCorrectOption(qIndex, oIndex)}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="font-bold text-slate-500">{String.fromCharCode(65 + oIndex)}.</span>
                        <input
                          type="text"
                          value={opt.option_text}
                          onChange={e => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Đáp án ${String.fromCharCode(65 + oIndex)}`}
                          className="w-full outline-none text-sm"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  {/* Lời giải thích */}
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={e => handleExplanationChange(qIndex, e.target.value)}
                    placeholder="Lời giải thích đáp án đúng (không bắt buộc)"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
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