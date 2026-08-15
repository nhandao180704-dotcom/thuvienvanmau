'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, AlertCircle, HelpCircle, Award } from 'lucide-react'

export default function StudentQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizData()
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      setLoading(true)
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError

      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', quizId)

      if (qError) throw qError

      setQuiz(quizData)
      setQuestions(qData || [])
    } catch (err) {
      console.error('Lỗi lấy thông tin bài thi:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return
    setUserAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach(q => {
      const selectedOptId = userAnswers[q.id]
      const correctOpt = q.options?.find((o: any) => o.is_correct)
      if (selectedOptId && correctOpt && selectedOptId === correctOpt.id) {
        correct++
      }
    })
    return correct
  }

  const handleSubmit = () => {
    const answeredCount = Object.keys(userAnswers).length
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `Bạn mới làm ${answeredCount}/${questions.length} câu. Bạn có chắc chắn muốn nộp bài không?`
      )
      if (!confirmSubmit) return
    }
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="text-sm font-medium text-slate-500">Đang tải đề thi...</p>
      </div>
    )
  }

  const score = calculateScore()
  const answeredCount = Object.keys(userAnswers).length

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Nút quay lại linh hoạt */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        {/* Tiêu đề & Thông tin đề thi */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
              {quiz?.grade || 'Lớp 9'}
            </span>
            {questions.length > 0 && !submitted && (
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                Đã hoàn thành: <strong className="text-blue-600">{answeredCount}</strong>/{questions.length} câu
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
            {quiz?.title || 'Đề kiểm tra'}
          </h1>
          {quiz?.description && (
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{quiz.description}</p>
          )}
        </div>

        {/* Khối hiển thị kết quả (nổi bật trên cùng sau khi nộp bài) */}
        {submitted && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Award className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black">Kết quả bài thi</h3>
                <p className="text-white/80 text-sm mt-1">
                  Đúng <strong className="text-yellow-300 text-lg">{score}</strong> / {questions.length} câu 
                  {questions.length > 0 && ` (${Math.round((score / questions.length) * 100)}%)`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSubmitted(false)
                setUserAnswers({})
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 font-bold rounded-2xl shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> Làm lại bài
            </button>
          </div>
        )}

        {/* TH1: Khi đề thi chưa có câu hỏi */}
        {questions.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Đề thi này chưa có câu hỏi</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Nội dung câu hỏi đang được cập nhật. Vui lòng quay lại danh sách đề thi hoặc liên hệ quản trị viên.
            </p>
          </div>
        ) : (
          /* TH2: Danh sách câu hỏi */
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug">
                    {q.question_text}
                  </h3>
                </div>

                <div className="space-y-2.5 pt-2">
                  {q.options?.map((opt: any, oIdx: number) => {
                    const isSelected = userAnswers[q.id] === opt.id
                    const isCorrect = opt.is_correct

                    let optionStyle = 'border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50/50'
                    if (isSelected) optionStyle = 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-600'

                    if (submitted) {
                      if (isCorrect) {
                        optionStyle = 'border-green-500 bg-green-50 text-green-900 font-semibold ring-1 ring-green-500'
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'border-red-400 bg-red-50 text-red-900'
                      } else {
                        optionStyle = 'border-slate-200 opacity-60'
                      }
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelect(q.id, opt.id)}
                        className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100/80 text-slate-600 flex items-center justify-center text-xs font-bold">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="text-sm sm:text-base text-slate-800">{opt.option_text}</span>
                        </div>
                        {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
                        {submitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                      </div>
                    )
                  })}
                </div>

                {submitted && q.explanation && (
                  <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 text-sm leading-relaxed">
                    <strong className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                      <HelpCircle className="w-4 h-4" /> Giải thích chi tiết:
                    </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}

            {/* Nút nộp bài ở cuối */}
            {!submitted && (
              <div className="sticky bottom-6 z-20 flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="px-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all transform active:scale-95"
                >
                  Nộp Bài Lấy Điểm
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}