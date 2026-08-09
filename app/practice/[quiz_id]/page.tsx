'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle, Trophy, ShieldAlert } from 'lucide-react'

export default function QuizTakingPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quiz_id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  
  // State phục vụ Anti-Cheat
  const [cheatCount, setCheatCount] = useState(0)
  const [forceSubmit, setForceSubmit] = useState(false)

  useEffect(() => {
    if (quizId) fetchQuizData()
  }, [quizId])

  // --- LOGIC 1: ĐẾM NGƯỢC THỜI GIAN ---
  useEffect(() => {
    if (loading || isSubmitted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setForceSubmit(true) // Hết giờ thì ép nộp bài
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [loading, isSubmitted, timeLeft])

  // --- LOGIC 2: CHỐNG GIAN LẬN (ANTI-CHEAT) ---
  useEffect(() => {
    if (loading || isSubmitted) return

    const handleVisibilityChange = () => {
      // Nếu học sinh chuyển tab hoặc ẩn trình duyệt
      if (document.hidden) {
        setCheatCount(prev => {
          const newCount = prev + 1
          
          alert(`🚨 CẢNH BÁO GIAN LẬN 🚨\nBạn vừa thoát khỏi màn hình làm bài!\nHệ thống đã ghi nhận vi phạm lần thứ ${newCount}.`)
          
          // Nếu vi phạm 3 lần -> Ép nộp bài ngay lập tức
          if (newCount >= 3) {
            alert("❌ BẠN ĐÃ VI PHẠM QUÁ 3 LẦN. HỆ THỐNG SẼ TỰ ĐỘNG NỘP BÀI!")
            setForceSubmit(true)
          }
          return newCount
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [loading, isSubmitted])

  // --- LOGIC 3: LẮNG NGHE LỆNH ÉP NỘP BÀI (HẾT GIỜ / GIAN LẬN) ---
  useEffect(() => {
    if (forceSubmit && !isSubmitted) {
      handleSubmit()
    }
  }, [forceSubmit])

  const fetchQuizData = async () => {
    setLoading(true)
    try {
      const { data: quizData } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
      if (quizData) setQuiz(quizData)

      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', quizId)

      if (error) console.error("Lỗi lấy câu hỏi:", error)
      
      if (questionsData) {
        setQuestions(questionsData)
      }
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
      const userChoice = answers[index]
      const correctChoice = q.correct_answer || q.correct || q.answer || 'A'
      if (userChoice === correctChoice) {
        correctCount++
      }
    })
    
    const finalScore = questions.length > 0 ? (correctCount / questions.length) * 10 : 0
    const roundedScore = parseFloat(finalScore.toFixed(2))
    
    setScore(roundedScore)
    setIsSubmitted(true)

    // Lưu lịch sử LocalStorage
    try {
      const historyString = localStorage.getItem('quiz_history')
      const history = historyString ? JSON.parse(historyString) : {}
      
      history[quizId] = {
        score: roundedScore,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString()
      }
      
      localStorage.setItem('quiz_history', JSON.stringify(history))
    } catch (error) {
      console.error('Lỗi lưu lịch sử:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const getOptionText = (q: any, opt: string) => {
    if (q.options && Array.isArray(q.options) && q.options.length > 0) {
      const targetOpt = q.options.find((o: any) => 
        o.option_key === opt || o.key === opt || o.label === opt || o.option_label === opt
      )
      if (targetOpt) return targetOpt.option_text || targetOpt.text || targetOpt.content || targetOpt.value

      const indexMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
      const idx = indexMap[opt]
      if (q.options[idx]) {
        const item = q.options[idx]
        return item.option_text || item.text || item.content || item.value || `Lựa chọn ${opt}`
      }
    }
    const keyLower = opt.toLowerCase()
    return q[`option_${keyLower}`] || q[`opt_${keyLower}`] || `Lựa chọn ${opt}`
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-blue-600 font-bold text-xl animate-pulse flex items-center gap-2"><Trophy className="animate-bounce" /> Đang chuẩn bị đề thi...</p></div>
  if (!quiz || questions.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-red-500 font-bold text-xl">Không tìm thấy nội dung đề thi!</p></div>

  // --- GIAO DIỆN HOÀN THÀNH BÀI THI ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-in fade-in zoom-in duration-500">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl border border-slate-200 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-yellow-500"></div>
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 mb-2">Hoàn thành bài thi!</h1>
            <p className="text-slate-500 mb-8 text-lg">{quiz.title}</p>
            
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-500 font-bold mb-2 uppercase tracking-widest">Điểm số của bạn</p>
                <p className={`text-6xl font-black drop-shadow-md ${score >= 8 ? 'text-emerald-500' : score >= 5 ? 'text-blue-500' : 'text-red-500'}`}>
                  {score}<span className="text-3xl text-slate-300">/10</span>
                </p>
              </div>
            </div>

            <Link href="/practice" className="inline-block px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all hover:scale-105 shadow-xl hover:shadow-blue-500/30">
              Trở về Phòng luyện thi
            </Link>
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-6 px-4 flex items-center gap-2">
            <CheckCircle className="text-emerald-500" /> Chi tiết bài làm
          </h3>
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const correctAns = q.correct_answer || q.correct || q.answer || 'A'
              const isCorrect = answers[idx] === correctAns
              const isUnanswered = !answers[idx]

              return (
                <div key={idx} className={`bg-white p-6 rounded-2xl border-2 transition-all hover:shadow-md ${isCorrect ? 'border-emerald-200' : isUnanswered ? 'border-amber-200' : 'border-red-200'}`}>
                  <div className="flex gap-3 mb-4">
                    <span className="font-black text-slate-400 text-lg">Câu {idx + 1}:</span>
                    <p className="font-bold text-slate-800 text-lg">{q.question_text || q.text || q.content}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optionText = getOptionText(q, opt)
                      const isUserChoice = answers[idx] === opt
                      const isActualCorrect = correctAns === opt

                      let bgClass = "bg-slate-50 text-slate-600"
                      if (isActualCorrect) bgClass = "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shadow-sm"
                      else if (isUserChoice && !isActualCorrect) bgClass = "bg-red-100 text-red-800 font-bold border border-red-300 shadow-sm"

                      return (
                        <div key={opt} className={`p-4 rounded-xl flex items-center justify-between transition-colors ${bgClass}`}>
                          <span><span className="font-black mr-2 text-lg">{opt}.</span> {optionText}</span>
                          {isActualCorrect && <CheckCircle className="w-6 h-6 text-emerald-600" />}
                          {isUserChoice && !isActualCorrect && <XCircle className="w-6 h-6 text-red-600" />}
                        </div>
                      )
                    })}
                  </div>
                  {isUnanswered && <p className="text-amber-600 text-sm font-bold mt-4 pl-10 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Bạn đã bỏ trống câu này.</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // --- GIAO DIỆN ĐANG LÀM BÀI ---
  const q = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { if(window.confirm('Bạn sẽ bị hủy kết quả nếu thoát. Bạn có chắc chắn?')) router.push('/practice') }}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-black text-slate-800 md:text-xl line-clamp-1">{quiz.title}</h1>
              <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mt-0.5">Lớp {quiz.grade_level || 9}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* HIỂN THỊ CẢNH BÁO GIAN LẬN (CHỚP ĐỎ) NẾU CÓ */}
            {cheatCount > 0 && (
              <div className="hidden md:flex items-center gap-2 font-bold px-4 py-2 rounded-xl bg-red-100 text-red-600 animate-pulse border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                <ShieldAlert className="w-5 h-5" />
                Vi phạm: {cheatCount}/3
              </div>
            )}

            <div className={`flex items-center gap-2 font-mono text-2xl font-bold px-5 py-2 rounded-xl border-2 transition-colors duration-300 ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
              <Clock className={`w-6 h-6 ${timeLeft < 60 ? 'animate-bounce text-red-500' : 'text-slate-400'}`} />
              {formatTime(timeLeft)}
            </div>
            
            <button 
              onClick={() => { if(window.confirm('Bạn có chắc chắn muốn nộp bài sớm?')) setForceSubmit(true) }}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all hover:scale-105 shadow-md hover:shadow-blue-500/30 hidden lg:block"
            >
              Nộp Bài
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-6 mt-4">
        
        {/* CỘT TRÁI: CÂU HỎI */}
        <div className="flex-1">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-200 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-blue-600 tracking-widest uppercase bg-blue-50 px-4 py-2 rounded-full">
                Câu {currentQuestion + 1} / {questions.length}
              </h2>
            </div>
            
            <p className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 leading-relaxed">
              {q?.question_text || q?.text || q?.content}
            </p>

            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optionText = getOptionText(q, opt)
                const isSelected = answers[currentQuestion] === opt

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 hover:scale-[1.01] ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-500/10' 
                        : 'border-slate-100 bg-slate-50 hover:border-blue-300 hover:bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black text-lg transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                      {opt}
                    </div>
                    <span className={`text-lg md:text-xl leading-relaxed ${isSelected ? 'font-bold text-blue-900' : 'text-slate-700 font-medium'}`}>
                      {optionText}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-6 md:px-8 py-3.5 font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all disabled:opacity-30 disabled:hover:scale-100 hover:scale-105 shadow-sm"
            >
              Câu trước
            </button>
            
            {currentQuestion === questions.length - 1 ? (
               <button 
               onClick={() => { if(window.confirm('Bạn có chắc chắn muốn nộp bài?')) setForceSubmit(true) }}
               className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
             >
               Nộp Bài Ngay
             </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-6 md:px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all hover:scale-105 shadow-lg shadow-slate-900/20"
              >
                Câu tiếp theo
              </button>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG ĐIỀU KHIỂN CÂU HỎI */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 sticky top-28">
            
            {/* Hiển thị vi phạm trên Mobile */}
            {cheatCount > 0 && (
              <div className="md:hidden flex items-center justify-center gap-2 font-bold px-4 py-3 mb-6 rounded-xl bg-red-100 text-red-600 animate-pulse border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                <ShieldAlert className="w-5 h-5" />
                Vi phạm: {cheatCount}/3
              </div>
            )}

            <h3 className="font-black text-slate-800 mb-6 text-lg">Danh sách câu hỏi</h3>
            <div className="grid grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {questions.map((_, idx) => {
                const isAnswered = !!answers[idx]
                const isCurrent = currentQuestion === idx

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-full aspect-square rounded-xl font-bold text-base flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      isCurrent 
                        ? 'ring-4 ring-offset-2 ring-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/40' 
                        : isAnswered 
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-2 border-transparent'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 text-sm font-bold text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-blue-100 border-2 border-blue-200"></div> Đã chọn đáp án
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-slate-100"></div> Chưa chọn
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-blue-600 ring-2 ring-offset-2 ring-blue-500"></div> Câu hiện tại
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}