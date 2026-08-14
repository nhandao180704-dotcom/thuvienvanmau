'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Clock, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

export default function TakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  
  // Trạng thái làm bài
  const [hasStarted, setHasStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  
  // Lưu đáp án của học sinh: { 'id_cau_hoi': 'dap_an_da_chon' }
  const [answers, setAnswers] = useState<Record<string, string>>({})
  
  // Thời gian còn lại (tính bằng giây)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  // Kết quả sau khi nộp
  const [finalScore, setFinalScore] = useState(0)

  // 1. Tải dữ liệu Đề thi & Câu hỏi
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Lấy thông tin đề thi
        const { data: qData, error: qErr } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()
        
        if (qErr) throw qErr
        setQuiz(qData)
        setTimeLeft(qData.duration * 60) // Đổi phút ra giây

        // Lấy danh sách câu hỏi
        const { data: questData, error: questErr } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true })

        if (questErr) throw questErr
        setQuestions(questData || [])
      } catch (error) {
        console.error("Lỗi tải đề thi:", error)
        alert("Không tìm thấy đề thi này!")
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    if (quizId) fetchQuiz()
  }, [quizId, router])

  // 2. Logic Đếm ngược thời gian
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (hasStarted && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleAutoSubmit() // Hết giờ tự động nộp bài
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [hasStarted, isFinished, timeLeft])

  // Format hiển thị giờ (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // 3. Bắt đầu làm bài (Tạo bản ghi Attempt)
  const handleStartQuiz = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        alert("Bạn cần đăng nhập để làm bài!")
        router.push('/login')
        return
      }

      // Ghi nhận thời gian bắt đầu vào Database
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert([{
          user_id: session.user.id,
          quiz_id: quizId,
          status: 'in_progress'
        }])
        .select()
        .single()

      if (error) throw error
      
      setAttemptId(data.id)
      setHasStarted(true)
    } catch (error) {
      console.error("Lỗi bắt đầu làm bài:", error)
      alert("Có lỗi xảy ra, vui lòng thử lại sau.")
    }
  }

  // 4. Cập nhật đáp án học sinh chọn
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // 5. Logic Chấm điểm & Nộp bài
  const submitQuiz = async (isTimeUp = false) => {
    setSubmitting(true)
    try {
      // THUẬT TOÁN CHẤM ĐIỂM TỰ ĐỘNG (Chỉ chấm trắc nghiệm)
      let calculatedScore = 0
      questions.forEach((q) => {
        if (q.question_type === 'multiple_choice') {
          // Nếu đáp án học sinh chọn khớp với đáp án gốc trong DB
          if (answers[q.id] === q.correct_answer) {
            calculatedScore += Number(q.points)
          }
        }
      })

      // Lưu kết quả vào DB
      if (attemptId) {
        await supabase
          .from('quiz_attempts')
          .update({
            student_answers: answers,
            score: calculatedScore,
            completed_at: new Date().toISOString(),
            status: isTimeUp ? 'time_up' : 'submitted'
          })
          .eq('id', attemptId)
      }

      setFinalScore(calculatedScore)
      setIsFinished(true)
    } catch (error) {
      console.error("Lỗi nộp bài:", error)
      alert("Lỗi khi nộp bài. Dữ liệu của bạn vẫn đang được lưu trữ cục bộ.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAutoSubmit = () => {
    alert("Hết thời gian làm bài! Hệ thống đang tự động nộp bài của bạn.")
    submitQuiz(true)
  }

  const handleManualSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0) {
      if (!window.confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`)) return
    } else {
      if (!window.confirm(`Bạn đã hoàn thành tất cả câu hỏi. Nộp bài ngay?`)) return
    }
    submitQuiz(false)
  }


  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  if (!quiz) return null

  // Giao diện khi ĐÃ NỘP BÀI
  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Nộp Bài Thành Công!</h2>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-slate-500 font-medium mb-2">Điểm trắc nghiệm của bạn</p>
            <p className="text-5xl font-black text-blue-600">{finalScore}</p>
            <p className="text-xs text-slate-400 mt-2 italic">* Câu tự luận sẽ được giáo viên chấm sau</p>
          </div>
          <button onClick={() => router.push('/')} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all">
            Về Trang Chủ
          </button>
        </div>
      </div>
    )
  }

  // Giao diện MÀN HÌNH CHỜ (Chưa bắt đầu)
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-xl w-full">
          <h1 className="text-2xl font-black text-slate-800 mb-2">{quiz.title}</h1>
          <div className="flex gap-4 text-sm font-medium text-slate-500 mb-8 pb-6 border-b border-slate-100">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">{quiz.grade}</span>
            <span className="flex items-center gap-1"><Clock size={16}/> {quiz.duration} phút</span>
            <span>{questions.length} câu hỏi</span>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 mb-8">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div className="text-sm space-y-1">
              <p className="font-bold">Lưu ý trước khi làm bài:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Thời gian sẽ bắt đầu đếm ngược ngay khi bạn bấm nút "Bắt đầu".</li>
                <li>Không tải lại trang web (F5) trong quá trình làm bài để tránh mất dữ liệu.</li>
                <li>Hệ thống sẽ tự động thu bài khi thời gian kết thúc.</li>
              </ul>
            </div>
          </div>

          <button onClick={handleStartQuiz} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
            Bắt đầu làm bài <ArrowRight size={20} />
          </button>
        </div>
      </div>
    )
  }

  // Giao diện ĐANG LÀM BÀI
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Thanh header cố định hiển thị thời gian */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-slate-800 hidden sm:block truncate pr-4">{quiz.title}</h1>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg tracking-wider transition-colors ${timeLeft <= 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 mt-4">
        {questions.map((q, index) => (
          <div key={q.id} id={`question-${index}`} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex gap-3">
                <span className="text-blue-600 shrink-0">Câu {index + 1}:</span>
                <span className="whitespace-pre-wrap">{q.content}</span>
              </h3>
              <span className="text-sm font-medium text-slate-400 shrink-0 bg-slate-100 px-2 py-1 rounded">{q.points} điểm</span>
            </div>

            {/* Render Đáp án trắc nghiệm */}
            {q.question_type === 'multiple_choice' && q.options && (
              <div className="space-y-3 mt-6">
                {['A', 'B', 'C', 'D'].map((label) => (
                  <label key={label} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[q.id] === label ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" name={`question-${q.id}`} value={label} 
                      checked={answers[q.id] === label}
                      onChange={() => handleAnswerChange(q.id, label)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="font-bold text-slate-700 w-6">{label}.</span>
                    <span className="text-slate-700 font-medium">{q.options[label]}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Render Vùng điền tự luận */}
            {q.question_type === 'essay' && (
              <div className="mt-6">
                <textarea 
                  placeholder="Nhập câu trả lời của bạn tại đây..." 
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none min-h-[150px] font-medium text-slate-700 resize-y"
                />
              </div>
            )}
          </div>
        ))}

        {/* Nút nộp bài */}
        <div className="flex justify-center pt-8 border-t border-slate-200">
          <button 
            onClick={handleManualSubmit} disabled={submitting}
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-black text-lg rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            {submitting ? 'Đang nộp bài...' : 'Nộp Bài & Chấm Điểm'}
          </button>
        </div>
      </div>
    </div>
  )
}