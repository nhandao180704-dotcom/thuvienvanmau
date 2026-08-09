'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle, Trophy } from 'lucide-react'

export default function QuizTakingPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quiz_id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State cho quá trình làm bài
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 phút
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (quizId) fetchQuizData()
  }, [quizId])

  // Đếm ngược thời gian
  useEffect(() => {
    if (loading || isSubmitted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit() // Tự động nộp khi hết giờ
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [loading, isSubmitted, timeLeft])

  const fetchQuizData = async () => {
    setLoading(true)
    try {
      // Lấy thông tin đề
      const { data: quizData } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
      if (quizData) setQuiz(quizData)

      // Lấy danh sách câu hỏi
      const { data: questionsData } = await supabase.from('questions').select('*').eq('quiz_id', quizId)
      if (questionsData) setQuestions(questionsData)
    } catch (error) {
      console.error("Lỗi:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnswer = (option: string) => {
    if (isSubmitted) return
    setAnswers({ ...answers, [currentQuestion]: option })
  }

  const handleSubmit = () => {
    if (isSubmitted) return
    let correctCount = 0
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correctCount++
      }
    })
    
    // Tính điểm thang 10
    const finalScore = questions.length > 0 ? (correctCount / questions.length) * 10 : 0
    setScore(parseFloat(finalScore.toFixed(2)))
    setIsSubmitted(true)
    
    // (Tùy chọn) Lưu điểm vào DB ở đây sau này
  }

  // Format thời gian hiển thị (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500 text-lg animate-pulse">Đang chuẩn bị đề thi...</p></div>
  if (!quiz || questions.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-red-500 text-lg">Không tìm thấy nội dung đề thi!</p></div>

  // GIAO DIỆN KẾT QUẢ SAU KHI NỘP BÀI
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-slate-200 mb-8">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành bài thi!</h1>
            <p className="text-slate-500 mb-8">{quiz.title}</p>
            
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-sm text-slate-500 font-bold mb-1">Điểm số</p>
                <p className={`text-5xl font-black ${score >= 8 ? 'text-emerald-500' : score >= 5 ? 'text-blue-500' : 'text-red-500'}`}>
                  {score}<span className="text-2xl text-slate-300">/10</span>
                </p>
              </div>
            </div>

            <Link href="/admin/dashboard?tab=practice" className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition">
              Quay lại Phòng luyện thi
            </Link>
          </div>

          {/* Chi tiết đáp án */}
          <h3 className="text-xl font-bold text-slate-800 mb-6 px-4">Chi tiết bài làm</h3>
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correct_answer
              const isUnanswered = !answers[idx]

              return (
                <div key={idx} className={`bg-white p-6 rounded-2xl border-2 ${isCorrect ? 'border-emerald-200' : isUnanswered ? 'border-amber-200' : 'border-red-200'}`}>
                  <div className="flex gap-3 mb-4">
                    <span className="font-bold text-slate-400">Câu {idx + 1}:</span>
                    <p className="font-bold text-slate-800">{q.question_text}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optionText = q[`option_${opt.toLowerCase()}` as keyof typeof q]
                      const isUserChoice = answers[idx] === opt
                      const isActualCorrect = q.correct_answer === opt

                      let bgClass = "bg-slate-50 text-slate-600"
                      if (isActualCorrect) bgClass = "bg-emerald-100 text-emerald-700 font-bold border border-emerald-300"
                      else if (isUserChoice && !isActualCorrect) bgClass = "bg-red-100 text-red-700 font-bold border border-red-300"

                      return (
                        <div key={opt} className={`p-3 rounded-xl flex items-center justify-between ${bgClass}`}>
                          <span><span className="font-bold mr-2">{opt}.</span> {optionText}</span>
                          {isActualCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                          {isUserChoice && !isActualCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                      )
                    })}
                  </div>
                  {isUnanswered && <p className="text-amber-500 text-sm font-bold mt-4 pl-10 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Bạn đã bỏ trống câu này.</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // GIAO DIỆN ĐANG LÀM BÀI
  const q = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header làm bài thi */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard?tab=practice" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-800 md:text-lg line-clamp-1">{quiz.title}</h1>
              <p className="text-xs font-bold text-blue-600">Lớp {quiz.grade_level}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Đồng hồ */}
            <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-xl ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => { if(window.confirm('Bạn có chắc chắn muốn nộp bài sớm?')) handleSubmit() }}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition hidden md:block"
            >
              Nộp Bài
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 flex flex-col md:flex-row gap-8 mt-6">
        {/* Khu vực câu hỏi chính */}
        <div className="flex-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-blue-600 mb-4 tracking-widest uppercase">Câu {currentQuestion + 1} / {questions.length}</h2>
            <p className="text-2xl font-bold text-slate-800 mb-10 leading-relaxed">
              {q.question_text}
            </p>

            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optionText = q[`option_${opt.toLowerCase()}` as keyof typeof q]
                const isSelected = answers[currentQuestion] === opt

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-500'}`}>
                      {opt}
                    </div>
                    <span className={`text-lg ${isSelected ? 'font-bold text-blue-900' : 'text-slate-700 font-medium'}`}>
                      {optionText}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nút điều hướng */}
          <div className="flex justify-between mt-8">
            <button 
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3 font-bold text-slate-500 hover:bg-white rounded-xl transition disabled:opacity-30"
            >
              Câu trước
            </button>
            
            {currentQuestion === questions.length - 1 ? (
               <button 
               onClick={() => { if(window.confirm('Bạn có chắc chắn muốn nộp bài?')) handleSubmit() }}
               className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition md:hidden"
             >
               Nộp Bài
             </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition shadow-md"
              >
                Câu tiếp theo
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Mini Map (Bản đồ câu hỏi) */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-28">
            <h3 className="font-bold text-slate-800 mb-4">Danh sách câu hỏi</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isAnswered = !!answers[idx]
                const isCurrent = currentQuestion === idx

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                      isCurrent 
                        ? 'ring-2 ring-offset-2 ring-blue-600 bg-blue-600 text-white' 
                        : isAnswered 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-blue-100"></div> Đã làm</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-slate-100"></div> Chưa làm</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}