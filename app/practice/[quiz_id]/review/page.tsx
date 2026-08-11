'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'

export default function ReviewQuizPage() {
  const router = useRouter()
  const params = useParams() 
  
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    try {
      const currentId = params?.id || params?.quiz_id;
      
      if (!currentId) {
         setErrorMsg('Không tìm thấy ID bài thi.')
         setLoading(false)
         return
      }

      const storedHistory = localStorage.getItem('quizHistory') || localStorage.getItem('quiz_history');
      
      if (storedHistory) {
        const parsedData = JSON.parse(storedHistory)
        let attempt = null;

        // KIỂM TRA ĐA ĐỊNH DẠNG TRONG BỘ NHỚ
        if (Array.isArray(parsedData)) {
          // Dạng 1: Dữ liệu là Mảng (Array)
          attempt = parsedData.find((h: any) => h.id === currentId || h.quiz_id === currentId)
        } else if (parsedData && typeof parsedData === 'object') {
          // Dạng 2: Dữ liệu là Object có Key là ID (Cách hệ thống của bạn đang lưu)
          if (parsedData[currentId as string]) {
            attempt = parsedData[currentId as string];
          } 
          // Dạng 3: Bản thân object đó chính là bài thi
          else if (parsedData.id === currentId || parsedData.quiz_id === currentId) {
            attempt = parsedData;
          }
        }
        
        if (attempt) {
          setHistoryData(attempt)
        } else {
          setErrorMsg('Bài thi này không tồn tại trong bộ nhớ.')
        }
      } else {
        setErrorMsg('Bạn chưa có lịch sử làm bài nào.')
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu lịch sử:", error)
      setErrorMsg('Dữ liệu lịch sử bị lỗi định dạng.')
    } finally {
      setLoading(false)
    }
  }, [params])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>
  
  if (errorMsg || !historyData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">{errorMsg}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium shadow-sm hover:bg-slate-800 transition">
          Quay lại lịch sử
        </button>
      </div>
    )
  }

  // Khai báo an toàn để đảm bảo luôn lấy được dữ liệu dù biến tên gì
  const questions = historyData.questions || historyData.results || historyData.answers || [];
  const score = historyData.score ?? historyData.correctAnswers ?? 0;
  const totalQuestions = historyData.total_questions ?? historyData.total ?? questions.length ?? 0;
  const title = historyData.title ?? historyData.quiz_title ?? 'Chi tiết bài làm';
  const date = historyData.date ?? historyData.created_at ?? 'Hôm nay';
  const time = historyData.time ?? '--:--';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium mb-2"
        >
          <ArrowLeft size={20} />
          Về Lịch sử làm bài
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={16}/> {date}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {time}</span>
            </div>
          </div>
          <div className="text-center bg-slate-50 px-6 py-3 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600 font-medium mb-1">Điểm số</p>
            <p className="text-3xl font-black text-slate-800">
              {score} <span className="text-lg font-medium text-slate-400">/ {totalQuestions}</span>
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          {Array.isArray(questions) && questions.length > 0 ? (
            questions.map((q: any, index: number) => {
              const correctAnswer = q.correct_answer ?? q.correctAnswer;
              const userAnswer = q.user_answer ?? q.userAnswer;
              const options = Array.isArray(q.options) ? q.options : (Array.isArray(q.answers) ? q.answers : []);

              const isUserChoice = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
              const isCorrect = isUserChoice && (userAnswer === correctAnswer);

              // Cài đặt viền câu hỏi
              let cardBorderColor = "border border-slate-200 bg-white";
              if (!isUserChoice) {
                cardBorderColor = "border-4 border-red-500 bg-red-50/10 shadow-sm"; 
              } else if (isCorrect) {
                cardBorderColor = "border-4 border-green-500 bg-green-50/10 shadow-sm"; 
              } else {
                cardBorderColor = "border border-red-200 bg-red-50/20"; 
              }

              return (
                <div key={index} className={`rounded-2xl p-6 ${cardBorderColor} transition-all`}>
                  <h3 className="text-lg font-bold text-slate-800 mb-6">
                    Câu {index + 1}: <span className="text-slate-700 font-medium">{q.question_text ?? q.question}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((opt: string, optIndex: number) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const isThisOptionCorrect = correctAnswer === opt || correctAnswer === optIndex;
                      const isThisOptionUserChoice = userAnswer === opt || userAnswer === optIndex;

                      let optionClass = "border border-slate-200 bg-white text-slate-700";
                      let IconElement = null;

                      if (isThisOptionCorrect) {
                        optionClass = "border-2 border-green-500 bg-green-100 text-green-900 font-bold";
                        IconElement = <CheckCircle2 className="text-green-600" size={20} />;
                      } else if (isThisOptionUserChoice && !isThisOptionCorrect) {
                        optionClass = "border-2 border-red-400 bg-red-100 text-red-900 font-bold";
                        IconElement = <XCircle className="text-red-600" size={20} />;
                      }

                      return (
                        <div 
                          key={optIndex} 
                          className={`flex items-center justify-between p-4 rounded-xl transition-all ${optionClass}`}
                        >
                          <div>
                            <span className="font-bold mr-2">{letters[optIndex]}.</span> 
                            <span>{opt}</span>
                          </div>
                          {IconElement}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-6 bg-slate-50 text-slate-600 rounded-2xl border border-slate-200 text-center">
              <p>Bài thi này chỉ có dữ liệu điểm số, chưa có chi tiết câu hỏi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}