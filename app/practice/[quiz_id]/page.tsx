'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { Clock, ArrowLeft, CheckCircle, XCircle, Trophy, ShieldAlert, Edit, Menu, Flag, CheckSquare, Square } from 'lucide-react'

export default function QuizTakingPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quiz_id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [reviewMarks, setReviewMarks] = useState<Record<number, boolean>>({}) 
  
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  
  const [cheatCount, setCheatCount] = useState(0)
  const [forceSubmit, setForceSubmit] = useState(false)
  const [showQuestionList, setShowQuestionList] = useState(false)

  // Lưu trữ dữ liệu bảng xếp hạng thật từ DB
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isSubmittingToDB, setIsSubmittingToDB] = useState(false)

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
          setForceSubmit(true)
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
      if (document.hidden) {
        setCheatCount(prev => {
          const newCount = prev + 1
          if (newCount >= 3) {
            alert("❌ BẠN ĐÃ VI PHẠM QUÁ 3 LẦN. HỆ THỐNG SẼ TỰ ĐỘNG NỘP BÀI!")
            setForceSubmit(true)
          } else {
            alert(`🚨 CẢNH BÁO GIAN LẬN 🚨\nBạn vừa thoát khỏi màn hình làm bài!\nHệ thống đã ghi nhận vi phạm lần thứ ${newCount}.`)
          }
          return newCount
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [loading, isSubmitted])

  useEffect(() => {
    if (forceSubmit && !isSubmitted) handleSubmit()
  }, [forceSubmit])

  const fetchQuizData = async () => {
    setLoading(true)
    try {
      const { data: quizData } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
      if (quizData) setQuiz(quizData)

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*, options(*)')
        .eq('quiz_id', quizId)
      
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

  const toggleReviewMark = () => {
    setReviewMarks(prev => ({ ...prev, [currentQuestion]: !prev[currentQuestion] }))
  }

  // --- LOGIC 3: XỬ LÝ NỘP BÀI VÀ GHI DỮ LIỆU LÊN BẢNG XẾP HẠNG THẬT ---
  const handleSubmit = async () => {
    if (isSubmitted || isSubmittingToDB) return
    setIsSubmittingToDB(true)

    let correctCount = 0
    questions.forEach((q, index) => {
      const userChoice = answers[index]
      const correctChoice = q.correct_answer || q.correct || q.answer || 'A'
      if (userChoice === correctChoice) correctCount++
    })
    
    const finalScore = questions.length > 0 ? (correctCount / questions.length) * 10 : 0
    const roundedScore = parseFloat(finalScore.toFixed(2))
    const timeTakenInSeconds = 15 * 60 - timeLeft
    
    setScore(roundedScore)
    setIsSubmitted(true)

    try {
      // 1. Kiểm tra User đã đăng nhập chưa
      const { data: { session } } = await supabase.auth.getSession()
      let displayName = session?.user?.email?.split('@')[0] 
      
      // Nếu chưa đăng nhập, yêu cầu nhập tên để vinh danh
      if (!displayName) {
        const userInput = prompt("Tuyệt vời! Hãy nhập tên của bạn để ghi danh lên Bảng Xếp Hạng nhé:", "Học sinh ẩn danh")
        displayName = userInput || "Học sinh ẩn danh"
      }

      // 2. Lưu kết quả vào database
      await supabase.from('quiz_results').insert([
        {
          quiz_id: quizId,
          user_id: session?.user?.id || null,
          display_name: displayName,
          score: roundedScore,
          time_taken: timeTakenInSeconds
        }
      ])

      // 3. Kéo dữ liệu Top 5 Bảng Xếp Hạng mới nhất từ DB
      const { data: leaderboardData } = await supabase
        .from('quiz_results')
        .select('display_name, score, time_taken')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false }) // Ưu tiên điểm cao
        .order('time_taken', { ascending: true }) // Sau đó ưu tiên làm nhanh
        .limit(5)

      if (leaderboardData) {
        setLeaderboard(
          leaderboardData.map(item => ({
            name: item.display_name,
            score: item.score,
            time: formatTime(item.time_taken)
          }))
        )
      }

      // 4. Lưu local storage cho Lịch sử
      const historyString = localStorage.getItem('quiz_history')
      const history = historyString ? JSON.parse(historyString) : {}
      history[quizId] = {
        score: roundedScore,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString()
      }
      localStorage.setItem('quiz_history', JSON.stringify(history))

    } catch (err) {
      console.error("Lỗi khi lưu kết quả:", err)
    } finally {
      setIsSubmittingToDB(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const getOptionText = (q: any, opt: string) => {
    if (q.options && Array.isArray(q.options) && q.options.length > 0) {
      const targetOpt = q.options.find((o: any) => o.option_key === opt || o.key === opt || o.label === opt || o.option_label === opt)
      if (targetOpt) return targetOpt.option_text || targetOpt.text || targetOpt.content || targetOpt.value
    }
    const keyLower = opt.toLowerCase()
    return q[`option_${keyLower}`] || q[`opt_${keyLower}`] || `Lựa chọn ${opt}`
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-blue-600 font-bold text-xl animate-pulse">Đang tải đề thi...</p></div>
  if (!quiz || questions.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-red-500 font-bold text-xl">Không tìm thấy nội dung đề thi!</p></div>

  // --- 1. GIAO DIỆN HOÀN THÀNH BÀI THI & BẢNG XẾP HẠNG ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Cột Chi tiết kết quả */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-black text-slate-800 mb-2">Hoàn thành bài thi!</h1>
              <p className="text-slate-500 mb-6">{quiz.title}</p>
              
              <div className="inline-block p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <p className="text-sm text-slate-500 font-bold mb-2 uppercase">Điểm số</p>
                <p className={`text-6xl font-black ${score >= 8 ? 'text-emerald-500' : score >= 5 ? 'text-blue-500' : 'text-red-500'}`}>
                  {score}<span className="text-2xl text-slate-400">/10</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const correctAns = q.correct_answer || q.correct || q.answer || 'A'
                const isCorrect = answers[idx] === correctAns
                return (
                  <div key={idx} className={`bg-white p-6 rounded-2xl border ${isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
                    <p className="font-bold text-slate-800 mb-4"><span className="text-slate-400 mr-2">Câu {idx + 1}:</span>{q.question_text || q.text}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const optionText = getOptionText(q, opt)
                        const isActualCorrect = correctAns === opt
                        const isUserChoice = answers[idx] === opt
                        let bgClass = "bg-slate-50 text-slate-600 border-slate-200"
                        if (isActualCorrect) bgClass = "bg-emerald-100 text-emerald-800 border-emerald-400 font-bold"
                        else if (isUserChoice) bgClass = "bg-red-100 text-red-800 border-red-400 font-bold"

                        return (
                          <div key={opt} className={`p-3 rounded-lg border flex items-center justify-between ${bgClass}`}>
                            <span><strong className="mr-2">{opt}.</strong> {optionText}</span>
                            {isActualCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                            {isUserChoice && !isActualCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cột Bảng xếp hạng Lấy Data thật */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-6">
              <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><Trophy className="text-yellow-500 w-5 h-5"/> TOP XUẤT SẮC</span>
              </h3>
              
              {leaderboard.length === 0 ? (
                <p className="text-center text-slate-500 italic py-4">Đang tải bảng xếp hạng...</p>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 border-slate-100 relative overflow-hidden">
                      {/* Màu nền highlight cho top 1, 2, 3 */}
                      {idx === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>}
                      {idx === 1 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>}
                      {idx === 2 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600"></div>}

                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-700 max-w-[120px] truncate" title={user.name}>{user.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> {user.time}</p>
                        </div>
                      </div>
                      <div className="font-black text-emerald-600 text-lg">{user.score}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <Link href="/practice" className="mt-8 block w-full py-3 text-center bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                Về phòng luyện thi
              </Link>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // --- 2. GIAO DIỆN ĐANG LÀM BÀI ---
  const q = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col pb-24 lg:pb-0">
      
      {/* HEADER: Chứa Timer xanh dương và Nút nộp bài xanh lá */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { if(window.confirm('Thoát sẽ mất kết quả?')) router.push('/practice') }} className="text-slate-500 hover:text-slate-800">
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-bold text-slate-800 hidden md:block line-clamp-1">{quiz.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {cheatCount > 0 && (
              <div className="flex items-center gap-2 bg-red-100 border border-red-500 text-red-700 px-3 py-1.5 rounded-lg font-bold text-sm animate-pulse">
                <ShieldAlert size={18} /> Vi phạm: {cheatCount}/3
              </div>
            )}
            
            <div className="bg-[#20409A] text-white font-mono text-xl md:text-2xl font-bold px-4 py-1.5 rounded-md tracking-wider shadow-sm">
              {formatTime(timeLeft)}
            </div>

            <button 
              onClick={() => { if(window.confirm('Xác nhận nộp bài?')) setForceSubmit(true) }}
              className="bg-[#22C55E] hover:bg-green-600 text-white font-bold px-4 md:px-6 py-2 rounded-md flex items-center gap-2 transition shadow-sm"
              disabled={isSubmittingToDB}
            >
              <Edit size={16} /> <span className="hidden md:inline">{isSubmittingToDB ? 'ĐANG NỘP...' : 'NỘP BÀI'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex gap-6 mt-4">
        
        {/* CỘT TRÁI: CÂU HỎI */}
        <div className="flex-1 w-full flex flex-col">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex-1 relative">
            
            {/* Checkbox "Xem lại câu này" */}
            <div className="absolute top-6 right-6 z-10">
              <button 
                onClick={toggleReviewMark}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-slate-300 rounded-full hover:bg-slate-50 transition"
              >
                {reviewMarks[currentQuestion] ? (
                  <CheckSquare className="text-amber-500" size={20} />
                ) : (
                  <Square className="text-slate-400" size={20} />
                )}
                <span className="text-xs md:text-sm font-semibold text-slate-700">Xem lại</span>
              </button>
            </div>

            <h2 className="text-lg font-bold text-slate-800 mb-6 w-[70%]">
              <span className="text-blue-600 mr-2">Câu {currentQuestion + 1}:</span>
              {q?.question_text || q?.text}
            </h2>

            {/* Danh sách đáp án */}
            <div className="space-y-4 mt-8">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optionText = getOptionText(q, opt)
                const isSelected = answers[currentQuestion] === opt

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                      isSelected ? 'border-[#3B5998] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-lg w-6 shrink-0">{opt}</div>
                    
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#3B5998]' : 'border-slate-400'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-[#3B5998] rounded-full"></div>}
                    </div>
                    
                    <span className="text-slate-700 font-medium text-base md:text-lg ml-2">{optionText}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG CÂU HỎI (MÁY TÍNH) */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Danh sách câu hỏi</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((_, idx) => {
                const isAnswered = !!answers[idx]
                const isCurrent = currentQuestion === idx
                const needsReview = reviewMarks[idx]

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`relative w-full aspect-square rounded-lg font-bold text-sm flex items-center justify-center border transition-all ${
                      isCurrent 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200' 
                        : isAnswered 
                          ? 'bg-[#3B5998] text-white border-[#3B5998]' 
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                    {needsReview && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#3B5998]"></div> Đã làm</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-slate-300 bg-white"></div> Chưa làm</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div> Cần xem lại</div>
            </div>
          </div>
        </div>

      </main>

      {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-3 lg:p-4 z-40 flex justify-center items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-7xl px-2 flex items-center justify-between lg:justify-center gap-4 md:gap-8">
          
          <button 
            onClick={() => setShowQuestionList(!showQuestionList)}
            className="lg:hidden w-12 h-12 bg-[#3B5998] text-white rounded-full flex justify-center items-center shadow-md"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="w-12 h-12 rounded-full border-2 border-slate-200 flex justify-center items-center text-[#3B5998] disabled:opacity-30 hover:bg-slate-50"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="px-6 py-2.5 bg-blue-50 text-[#3B5998] border border-[#3B5998]/20 rounded-full font-bold text-lg">
              {currentQuestion + 1} / {questions.length}
            </div>

            <button 
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestion === questions.length - 1}
              className="px-6 md:px-8 py-3 bg-[#3B5998] text-white rounded-full font-bold text-base md:text-lg shadow-md hover:bg-blue-800 transition disabled:opacity-50"
            >
              Câu tiếp theo
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE QUESTION LIST MODAL */}
      {showQuestionList && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 w-full max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Danh sách câu hỏi</h3>
              <button onClick={() => setShowQuestionList(false)} className="text-slate-400 hover:text-slate-800"><XCircle size={24}/></button>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {questions.map((_, idx) => {
                const isAnswered = !!answers[idx]
                const isCurrent = currentQuestion === idx
                const needsReview = reviewMarks[idx]

                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentQuestion(idx); setShowQuestionList(false); }}
                    className={`relative w-full aspect-square rounded-lg font-bold text-sm flex items-center justify-center border ${
                      isCurrent 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200' 
                        : isAnswered 
                          ? 'bg-[#3B5998] text-white border-[#3B5998]' 
                          : 'bg-white text-slate-600 border-slate-300'
                    }`}
                  >
                    {idx + 1}
                    {needsReview && <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}