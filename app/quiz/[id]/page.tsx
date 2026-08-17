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

      // SỬA LỖI 400 Ở ĐÂY: Xóa bỏ options(*) vì options giờ là cột JSON trong bảng questions
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true })

      if (qError) throw qError

      setQuiz(quizData)
      setQuestions(qData || [])
    } catch (err) {
      console.error('Lỗi lấy thông tin bài thi:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (questionId: string, answer: string) => {
    if (submitted) return
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const calculateScore = () => {
    let earnedPoints = 0
    let correctCount = 0
    
    questions.forEach(q => {
      if (q.question_type === 'multiple_choice') {
        if (userAnswers[q.id] === q.correct_answer) {
          earnedPoints += Number(q.points) || 0
          correctCount++
        }
      }
    })
    return { earnedPoints, correctCount }
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

  // SỬA LỖI NÚT QUAY LẠI Ở ĐÂY
  const handleBack = () => {
    if (window.history.length > 2) {
      router.back() 
    } else {
      window.close() 
      router.push('/') 
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="text-sm font-medium text-slate-500">Đang tải đề thi...</p>
      </div>
    )
  }

  const { earnedPoints, correctCount } = calculateScore()
  const answeredCount = Object.keys(userAnswers).length
  const mcQuestionsCount = questions.filter(q => q.question_type === 'multiple_choice').length

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Nút quay lại đã được gắn hàm handleBack mới */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

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
          {quiz?.duration && (
            <p className="text-slate-600 text-sm sm:text-base font-medium">Thời gian: {quiz.duration} phút</p>
          )}
        </div>

        {submitted && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Award className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black">Kết quả bài thi</h3>
                <p className="text-white/80 text-sm mt-1">
                  Đúng Trắc nghiệm: <strong className="text-yellow-300 text-lg">{correctCount}</strong> / {mcQuestionsCount} câu 
                </p>
                <p className="text-white/80 text-sm">
                  Điểm Trắc nghiệm: <strong className="text-yellow-300">{earnedPoints.toFixed(2)}</strong> điểm
                </p>
                <p className="text-white/60 text-xs mt-1 italic">
                  * Phần Tự luận sẽ được giáo viên chấm điểm thủ công sau.
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

        {questions.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border-2 border-solid border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Đề thi này chưa có câu hỏi</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Nội dung câu hỏi đang được cập nhật. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug whitespace-pre-wrap">
                      {q.content || q.question_text}
                    </h3>
                    <span className="inline-block mt-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {q.points} điểm
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {/* HỖ TRỢ HIỂN THỊ ĐÁP ÁN TRẮC NGHIỆM DẠNG JSON */}
                  {q.question_type === 'multiple_choice' && q.options && Object.entries(q.options).map(([key, value]) => {
                    const isSelected = userAnswers[q.id] === key
                    const isCorrect = q.correct_answer === key

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
                        key={key}
                        onClick={() => handleSelect(q.id, key)}
                        className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100/80 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {key}
                          </span>
                          <span className="text-sm sm:text-base text-slate-800">{value as string}</span>
                        </div>
                        {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
                        {submitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                      </div>
                    )
                  })}

                  {/* HỖ TRỢ HIỂN THỊ Ô NHẬP TỰ LUẬN */}
                  {q.question_type === 'essay' && (
                    <div className="pt-2">
                        <textarea
                          placeholder="Nhập câu trả lời của bạn..."
                          value={userAnswers[q.id] || ''}
                          onChange={(e) => handleSelect(q.id, e.target.value)}
                          disabled={submitted}
                          className={`w-full p-4 border rounded-xl outline-none min-h-[120px] transition-all ${submitted ? 'bg-slate-50 border-slate-200 text-slate-600' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                        />
                        {submitted && q.correct_answer && (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Từ khóa / Đáp án gợi ý:</p>
                            <p className="text-sm text-emerald-900 whitespace-pre-wrap">{q.correct_answer}</p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))}

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