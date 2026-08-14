'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { Clock, ArrowLeft, CheckCircle, XCircle, Trophy, ShieldAlert, Edit, Menu, CheckSquare, Square, Medal, User, GraduationCap, School } from 'lucide-react'

export default function QuizTakingPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quiz_id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [studentInfo, setStudentInfo] = useState({ fullName: '', className: '', schoolName: '' })
  const [isStarted, setIsStarted] = useState(false) 

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [reviewMarks, setReviewMarks] = useState<Record<number, boolean>>({}) 
  
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  
  const [cheatCount, setCheatCount] = useState(0)
  const [forceSubmit, setForceSubmit] = useState(false)
  const [showQuestionList, setShowQuestionList] = useState(false)

  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isSubmittingToDB, setIsSubmittingToDB] = useState(false)

  useEffect(() => {
    if (quizId) fetchQuizData()
  }, [quizId])

  useEffect(() => {
    if (!isStarted || loading || isSubmitted || timeLeft <= 0) return

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
  }, [isStarted, loading, isSubmitted, timeLeft])

  useEffect(() => {
    if (!isStarted || loading || isSubmitted) return

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
  }, [isStarted, loading, isSubmitted])

  useEffect(() => {
    if (forceSubmit && !isSubmitted) handleSubmit()
  }, [forceSubmit, isSubmitted])

  const shuffleArray = (array: any[]) => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const fetchQuizData = async () => {
    setLoading(true)
    try {
      // 1. Dùng maybeSingle() để tránh lỗi 406
      const { data: quizData } = await supabase.from('quizzes').select('*').eq('id', quizId).maybeSingle()
      if (!quizData) {
        setLoading(false)
        return // Dừng lại, UI sẽ tự hiện thông báo "Không tìm thấy nội dung"
      }
      
      setQuiz(quizData)
      const quizDuration = quizData.duration || quizData.time_limit || 15
      setTimeLeft(quizDuration * 60)
      
      // 2. Không join options nữa vì đã dùng chuẩn JSONB
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
      
      if (questionsData) {
        const processedQuestions = questionsData.map((q: any) => {
          if (q.question_type === 'essay' || !q.options) return q;

          // Chuyển đổi JSONB {A: "...", B: "..."} thành mảng để thuật toán xáo trộn hoạt động
          let optionsArray = [];
          if (typeof q.options === 'object' && !Array.isArray(q.options)) {
              optionsArray = Object.keys(q.options).map(k => ({ originalKey: k, text: q.options[k] }));
          } else {
              return q;
          }

          const originalCorrectKey = q.correct_answer || 'A';
          const shuffledOptions = shuffleArray([...optionsArray]);
          
          const newKeys = ['A', 'B', 'C', 'D'];
          let newCorrectAnswer = originalCorrectKey;

          // Gán lại nhãn A, B, C, D mới sau khi xáo trộn
          const finalOptions = shuffledOptions.map((opt, index) => {
             const newKey = newKeys[index] || String.fromCharCode(65 + index);
             if (opt.originalKey === originalCorrectKey) {
                 newCorrectAnswer = newKey; 
             }
             return { option_key: newKey, option_text: opt.text };
          });

          return {
             ...q,
             options: finalOptions,
             correct_answer: newCorrectAnswer
          };
        });

        setQuestions(shuffleArray(processedQuestions))
      }
    } catch (error) {
      console.error("Lỗi:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentInfo.fullName.trim()) {
      alert('Vui lòng nhập Họ và tên để bắt đầu thi!')
      return
    }
    setIsStarted(true)
  }

  const handleSelectAnswer = (option: string) => {
    if (isSubmitted) return
    setAnswers({ ...answers, [currentQuestion]: option })
  }

  const toggleReviewMark = () => {
    setReviewMarks(prev => ({ ...prev, [currentQuestion]: !prev[currentQuestion] }))
  }

  const handleSubmit = async () => {
    if (isSubmitted || isSubmittingToDB) return
    setIsSubmittingToDB(true)

    let calculatedScore = 0
    let correctCount = 0

    const reviewQuestions = questions.map((q, index) => {
      const userChoice = answers[index] || '' 
      const correctChoice = q.correct_answer || 'A'
      
      if (q.question_type === 'multiple_choice' && userChoice === correctChoice) {
          calculatedScore += Number(q.points || 0) // Cộng điểm chuẩn theo hệ thang 10
          correctCount++
      }

      return {
          question_text: q.question_text || q.content || q.text,
          options: ['A', 'B', 'C', 'D'].map((key) => {
              const optText = getOptionText(q, key);
              return { key: key, text: optText }
          }),
          correct_answer: correctChoice,
          user_answer: userChoice
      }
    })
    
    const roundedScore = parseFloat(calculatedScore.toFixed(2))
    const totalTimeAllowed = (quiz?.duration || quiz?.time_limit || 15) * 60
    const timeTakenInSeconds = totalTimeAllowed - timeLeft 
    
    setScore(roundedScore)
    setIsSubmitted(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      await supabase.from('quiz_results').insert([
        {
          quiz_id: quizId,
          user_id: session?.user?.id || null,
          display_name: studentInfo.fullName,
          class_name: studentInfo.className,
          school_name: studentInfo.schoolName,
          score: roundedScore,
          time_taken: timeTakenInSeconds,
          cheat_count: cheatCount,
          answers_detail: answers
        }
      ])

      const { data: leaderboardData } = await supabase
        .from('quiz_results')
        .select('display_name, class_name, school_name, score, time_taken')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true })
        .limit(20)

      if (leaderboardData) {
        setLeaderboard(leaderboardData)
      }

      // Lưu LocalStorage
      const historyString = localStorage.getItem('quiz_history')
      let historyArray = []
      if (historyString) {
        try {
          const parsedData = JSON.parse(historyString)
          if (Array.isArray(parsedData)) {
            historyArray = parsedData
          } else if (typeof parsedData === 'object') {
            historyArray = Object.keys(parsedData).map(key => ({
               quiz_id: key,
               ...parsedData[key]
            }))
          }
        } catch(e) {}
      }
      
      const now = new Date()
      const attemptId = now.getTime().toString() 
      
      historyArray.push({
        id: attemptId,
        quiz_id: quizId,
        score: roundedScore,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        completedAt: now.toISOString(),
        date: now.toLocaleDateString('vi-VN'),
        time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: Math.floor(timeTakenInSeconds / 60),
        durationSeconds: timeTakenInSeconds % 60,
        questions: reviewQuestions 
      })
      
      localStorage.setItem('quiz_history', JSON.stringify(historyArray))

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
    if (q.options && Array.isArray(q.options)) {
      const targetOpt = q.options.find((o: any) => o.option_key === opt)
      if (targetOpt) return targetOpt.option_text
    }
    return `Lựa chọn ${opt}`
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-blue-600 font-bold text-xl animate-pulse">Đang tải đề thi...</p></div>
  if (!quiz || questions.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-red-500 font-bold text-xl">Không tìm thấy nội dung đề thi!</p></div>

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 max-w-lg w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">{quiz.title}</h1>
            <p className="text-slate-500 font-medium">Thời gian: <span className="text-blue-600 font-bold">{quiz.duration || quiz.time_limit || 15} phút</span> | Tổng số câu: <span className="text-blue-600 font-bold">{questions.length} câu</span></p>
          </div>

          <form onSubmit={handleStartQuiz} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  placeholder="Nhập họ và tên"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition"
                  value={studentInfo.fullName}
                  onChange={(e) => setStudentInfo({...studentInfo, fullName: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Lớp (Không bắt buộc)</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Ví dụ: 9A"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition"
                  value={studentInfo.className}
                  onChange={(e) => setStudentInfo({...studentInfo, className: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Trường (Không bắt buộc)</label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Nhập tên trường"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none transition"
                  value={studentInfo.schoolName}
                  onChange={(e) => setStudentInfo({...studentInfo, schoolName: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1">
              BẮT ĐẦU LÀM BÀI
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    const top3 = leaderboard.slice(0, 3)
    const restOfLeaderboard = leaderboard.slice(3)

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-black text-slate-800 mb-2">Hoàn thành bài thi!</h1>
              <p className="text-slate-500 font-medium mb-6">
                Thí sinh: <span className="text-blue-600 mr-4">{studentInfo.fullName}</span> 
                {studentInfo.className && <>Lớp: <span className="text-blue-600">{studentInfo.className}</span></>}
              </p>
              
              <div className="inline-block px-10 py-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                <p className="text-sm text-slate-500 font-bold mb-2 uppercase tracking-wider">Điểm số của bạn</p>
                <p className={`text-6xl font-black ${score >= 8 ? 'text-emerald-500' : score >= 5 ? 'text-blue-500' : 'text-red-500'}`}>
                  {score.toString().replace('.', ',')}<span className="text-2xl text-slate-400">/10</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const correctAns = q.correct_answer || 'A'
                const isUserChoice = answers[idx] !== undefined && answers[idx] !== '';
                const isCorrect = isUserChoice && (answers[idx] === correctAns);

                let cardBorderColor = "border-2 border-slate-200 bg-white";
                if (!isUserChoice) {
                  cardBorderColor = "border-2 border-red-400 bg-white"; 
                } else if (isCorrect) {
                  cardBorderColor = "border-2 border-green-400 bg-white"; 
                } else {
                  cardBorderColor = "border-2 border-red-400 bg-white"; 
                }

                return (
                  <div key={idx} className={`rounded-3xl p-6 md:p-8 ${cardBorderColor} shadow-sm transition-all`}>
                    <h3 className="text-base md:text-lg font-bold text-slate-600 mb-6">
                      Câu {idx + 1}: <span className="text-slate-900">{q.question_text || q.content || q.text}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const optionText = getOptionText(q, opt)
                        const isActualCorrect = correctAns === opt
                        const isThisUserChoice = answers[idx] === opt
                        
                        let optionClass = "border-2 border-slate-200 bg-white text-slate-600";
                        let IconElement = null;

                        if (isActualCorrect) {
                          optionClass = "border-2 border-green-500 bg-white text-green-600 font-bold";
                          IconElement = <CheckCircle className="text-green-500" size={24} strokeWidth={2.5} />;
                        } else if (isThisUserChoice && !isActualCorrect) {
                          optionClass = "border-2 border-red-500 bg-red-50 text-red-600 font-bold";
                          IconElement = <XCircle className="text-red-500" size={24} strokeWidth={2.5} />;
                        }

                        return (
                          <div 
                            key={opt} 
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all ${optionClass}`}
                          >
                            <div>
                              <span className={`font-bold mr-2 ${isActualCorrect || isThisUserChoice ? '' : 'text-slate-800'}`}>
                                {opt}.
                              </span> 
                              <span className={isActualCorrect || isThisUserChoice ? 'font-bold' : ''}>
                                {optionText}
                              </span>
                            </div>
                            {IconElement}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-6">
              <h3 className="font-black text-xl text-slate-800 mb-8 flex items-center justify-center gap-2 uppercase tracking-wider">
                <Trophy className="text-yellow-500 w-6 h-6"/> BẢNG XẾP HẠNG
              </h3>
              
              {leaderboard.length === 0 ? (
                <p className="text-center text-slate-500 italic py-4">Đang tải bảng xếp hạng...</p>
              ) : (
                <>
                  <div className="flex items-end justify-center gap-2 mb-10 mt-4 px-2">
                    {top3[1] && (
                      <div className="flex flex-col items-center w-1/3 relative group">
                        <div className="text-center mb-6 px-1">
                          <p className="text-xs font-bold text-slate-700 truncate w-full" title={top3[1].display_name}>{top3[1].display_name}</p>
                          <p className="font-black text-lg text-slate-800">{top3[1].score.toString().replace('.', ',')} <span className="text-[10px] text-slate-400">/ 10</span></p>
                        </div>
                        <div className="w-full h-24 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-xl border-t-4 border-slate-300 relative shadow-inner flex justify-center">
                          <div className="absolute -top-6 bg-white rounded-full p-1 shadow-md border border-slate-200">
                            <Medal className="w-8 h-8 text-slate-400 fill-slate-200" />
                          </div>
                          <span className="mt-8 text-3xl font-black text-slate-300 opacity-50">2</span>
                        </div>
                      </div>
                    )}

                    {top3[0] && (
                      <div className="flex flex-col items-center w-1/3 relative z-10 -mx-2">
                        <div className="text-center mb-8 px-1">
                          <p className="text-sm font-black text-yellow-600 truncate w-full" title={top3[0].display_name}>{top3[0].display_name}</p>
                          <p className="font-black text-2xl text-slate-800">{top3[0].score.toString().replace('.', ',')} <span className="text-xs text-slate-400">/ 10</span></p>
                        </div>
                        <div className="w-full h-32 bg-gradient-to-t from-yellow-200 to-yellow-50 rounded-t-xl border-t-4 border-yellow-400 relative shadow-lg flex justify-center">
                          <div className="absolute -top-7 bg-white rounded-full p-1.5 shadow-md border border-yellow-200">
                            <Medal className="w-10 h-10 text-yellow-500 fill-yellow-300" />
                          </div>
                          <span className="mt-10 text-4xl font-black text-yellow-500 opacity-40">1</span>
                        </div>
                      </div>
                    )}

                    {top3[2] && (
                      <div className="flex flex-col items-center w-1/3 relative">
                        <div className="text-center mb-4 px-1">
                          <p className="text-xs font-bold text-slate-700 truncate w-full" title={top3[2].display_name}>{top3[2].display_name}</p>
                          <p className="font-black text-lg text-slate-800">{top3[2].score.toString().replace('.', ',')} <span className="text-[10px] text-slate-400">/ 10</span></p>
                        </div>
                        <div className="w-full h-20 bg-gradient-to-t from-amber-200/50 to-amber-50 rounded-t-xl border-t-4 border-amber-600/50 relative shadow-inner flex justify-center">
                          <div className="absolute -top-6 bg-white rounded-full p-1 shadow-md border border-amber-100">
                            <Medal className="w-8 h-8 text-amber-600 fill-amber-200" />
                          </div>
                          <span className="mt-6 text-2xl font-black text-amber-600/40 opacity-50">3</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {restOfLeaderboard.length > 0 && (
                    <div className="space-y-3 mt-8 border-t border-slate-100 pt-6">
                      <div className="overflow-x-auto hide-scrollbar pb-2">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100">
                              <th className="pb-3 pr-2 font-bold w-12 text-center">Hạng</th>
                              <th className="pb-3 px-2 font-bold">Học sinh</th>
                              <th className="pb-3 px-2 font-bold text-center">Thời gian</th>
                              <th className="pb-3 pl-2 font-bold text-right w-28">Điểm</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                            {restOfLeaderboard.map((user, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition">
                                <td className="py-3 pr-2">
                                  <div className="w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs bg-slate-200 text-slate-600 shrink-0">
                                    {idx + 4}
                                  </div>
                                </td>
                                <td className="py-3 px-2 w-full">
                                  <div className="flex flex-col min-w-0">
                                    <p className="font-bold text-sm text-slate-700 truncate max-w-[120px] md:max-w-[160px]" title={user.display_name}>{user.display_name}</p>
                                    {user.class_name && <span className="text-[10px] text-slate-400 mt-0.5 truncate">{user.class_name}</span>}
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center justify-center gap-1 text-xs text-slate-500"><Clock size={12}/> {formatTime(user.time_taken)}</span>
                                </td>
                                <td className="py-3 pl-2 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center justify-center px-3 py-1.5 bg-emerald-50 text-emerald-700 font-black rounded-xl border border-emerald-200 min-w-[80px]">
                                    {user.score.toString().replace('.', ',')} / 10
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <Link href="/practice" className="mt-8 block w-full py-4 text-center bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                Về phòng luyện thi
              </Link>
            </div>
          </div>

        </div>
      </div>
    )
  }

  const q = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col pb-24 lg:pb-0">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => { if(window.confirm('Thoát sẽ mất kết quả?')) router.push('/practice') }} className="text-slate-500 hover:text-slate-800 shrink-0">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="font-bold text-slate-800 hidden md:block line-clamp-1">{quiz.title}</h1>
              <span className="text-xs font-semibold text-blue-600 hidden md:inline-block">Thí sinh: {studentInfo.fullName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {cheatCount > 0 && (
              <div className="flex items-center gap-1 md:gap-2 bg-red-100 border border-red-500 text-red-700 px-2 md:px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm animate-pulse shrink-0">
                <ShieldAlert size={16} /> <span className="hidden md:inline">Vi phạm: {cheatCount}/3</span>
              </div>
            )}
            
            <div className="bg-[#20409A] text-white font-mono text-lg md:text-2xl font-bold px-3 md:px-4 py-1.5 rounded-md tracking-wider shadow-sm shrink-0">
              {formatTime(timeLeft)}
            </div>

            <button 
              onClick={() => { if(window.confirm('Xác nhận nộp bài?')) setForceSubmit(true) }}
              className="bg-[#22C55E] hover:bg-green-600 text-white font-bold px-3 md:px-6 py-1.5 md:py-2 rounded-md flex items-center gap-1.5 transition shadow-sm text-sm md:text-base shrink-0"
              disabled={isSubmittingToDB}
            >
              <Edit size={16} /> <span>{isSubmittingToDB ? 'ĐANG NỘP...' : 'NỘP BÀI'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex gap-6 mt-4">
        <div className="flex-1 w-full flex flex-col">
          <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col relative">
            
            <div className="flex justify-between items-start gap-4 mb-6">
              <h2 className="text-base md:text-lg font-bold text-slate-800 flex-1 leading-relaxed">
                <span className="text-blue-600 mr-2">Câu {currentQuestion + 1}:</span>
                {q?.question_text || q?.content || q?.text}
              </h2>

              <button 
                onClick={toggleReviewMark}
                className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 border border-slate-300 rounded-full hover:bg-slate-50 transition shrink-0"
              >
                {reviewMarks[currentQuestion] ? (
                  <CheckSquare className="text-amber-500" size={18} />
                ) : (
                  <Square className="text-slate-400" size={18} />
                )}
                <span className="text-xs md:text-sm font-semibold text-slate-700">Xem lại</span>
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {q?.question_type !== 'essay' && ['A', 'B', 'C', 'D'].map(opt => {
                const optionText = getOptionText(q, opt)
                const isSelected = answers[currentQuestion] === opt

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-center gap-4 ${
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

              {q?.question_type === 'essay' && (
                <textarea
                  placeholder="Nhập phần trả lời tự luận của bạn vào đây..."
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none min-h-[200px]"
                />
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-80 shrink-0">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24">
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
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
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

      <div 
        className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-3 lg:p-4 z-40 flex justify-center items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
      >
        <div className="w-full max-w-7xl px-2 flex items-center justify-between lg:justify-center gap-4 md:gap-8">
          <button 
            onClick={() => setShowQuestionList(!showQuestionList)}
            className="lg:hidden w-10 h-10 md:w-12 md:h-12 bg-[#3B5998] text-white rounded-full flex justify-center items-center shadow-md shrink-0"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 md:gap-6 w-full justify-end lg:justify-center">
            <button 
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-200 flex justify-center items-center text-[#3B5998] disabled:opacity-30 hover:bg-slate-50 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="px-4 md:px-6 py-2 bg-blue-50 text-[#3B5998] border border-[#3B5998]/20 rounded-full font-bold text-sm md:text-lg shrink-0">
              {currentQuestion + 1} / {questions.length}
            </div>

            <button 
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestion === questions.length - 1}
              className="px-4 md:px-8 py-2 md:py-3 bg-[#3B5998] text-white rounded-full font-bold text-sm md:text-lg shadow-md hover:bg-blue-800 transition disabled:opacity-50 whitespace-nowrap"
            >
              Câu tiếp theo
            </button>
          </div>
        </div>
      </div>

      {showQuestionList && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 w-full max-h-[70vh] overflow-y-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}>
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
                    {needsReview && <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
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