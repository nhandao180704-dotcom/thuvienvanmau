'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Calendar, Timer } from 'lucide-react'

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

        if (Array.isArray(parsedData)) {
          attempt = parsedData.find((h: any) => h.id === currentId || h.quiz_id === currentId)
        } else if (parsedData && typeof parsedData === 'object') {
          if (parsedData[currentId as string]) {
            attempt = parsedData[currentId as string];
          } else if (parsedData.id === currentId || parsedData.quiz_id === currentId) {
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

  const questions = historyData.questions || [];
  const score = historyData.score ?? 0;
  
  const title = historyData.title || 'Chi tiết bài làm';

  let displayDate = historyData.date || 'Không rõ';
  let displayTime = historyData.time || 'Không rõ';
  
  let duration = 'Không xác định';
  if (historyData.durationMinutes !== undefined && historyData.durationSeconds !== undefined) {
      if (historyData.durationMinutes > 0) {
          duration = `${historyData.durationMinutes} phút ${historyData.durationSeconds} giây`;
      } else {
          duration = `${historyData.durationSeconds} giây`;
      }
  } else if (historyData.duration) {
      duration = `${historyData.duration} phút`;
  }

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

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4 flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                <span>Ngày làm: <strong>{displayDate}</strong></span>
              </div>
              <div className="hidden md:block w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                <span>Nộp bài lúc: <strong>{displayTime}</strong></span>
              </div>
              <div className="hidden md:block w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-emerald-500" />
                <span>Thời gian làm bài: <strong>{duration}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-center bg-white px-10 py-5 rounded-2xl border-2 border-slate-100 shadow-sm min-w-[140px]">
            <p className="text-sm text-slate-500 font-bold mb-2 uppercase tracking-wider">Điểm số</p>
            {/* Điểm số hiển thị to, in đậm, đổi dấu chấm thành phẩy, bỏ tổng số câu */}
            <p className="text-5xl font-black text-[#1e293b]">
              {score.toString().replace('.', ',')}
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          {Array.isArray(questions) && questions.length > 0 ? (
            questions.map((q: any, index: number) => {
              const correctAnswer = q.correct_answer || 'A';
              const userAnswer = q.user_answer || '';
              
              const isUserChoice = userAnswer !== '';
              const isCorrect = isUserChoice && (userAnswer === correctAnswer);

              // Cập nhật viền câu hỏi: border-2 đậm hơn và bo góc rounded-3xl
              let cardBorderColor = "border-2 border-slate-200 bg-white";
              if (!isUserChoice) {
                cardBorderColor = "border-2 border-red-400 bg-white"; 
              } else if (isCorrect) {
                cardBorderColor = "border-2 border-green-400 bg-white"; 
              } else {
                cardBorderColor = "border-2 border-red-400 bg-white"; 
              }

              return (
                <div key={index} className={`rounded-3xl p-6 md:p-8 ${cardBorderColor} shadow-sm transition-all`}>
                  <h3 className="text-base md:text-lg font-bold text-slate-600 mb-6">
                    Câu {index + 1}: <span className="text-slate-900">{q.question_text}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* BẢO ĐẢM AN TOÀN KHI HIỂN THỊ ĐÁP ÁN ĐỂ KHÔNG BỊ LỖI REACT #31 */}
                    {q.options?.map((opt: any, optIndex: number) => {
                      const currentKey = opt?.key || ['A', 'B', 'C', 'D'][optIndex];
                      
                      let optionText = String(opt);
                      if (opt && typeof opt === 'object') {
                        optionText = opt.text !== undefined ? String(opt.text) : `Lựa chọn ${currentKey}`;
                      }

                      const isThisOptionCorrect = correctAnswer === currentKey;
                      const isThisOptionUserChoice = userAnswer === currentKey;

                      // Cập nhật viền đáp án: border-2 đậm hơn, bo góc rounded-2xl, tinh chỉnh màu sắc
                      let optionClass = "border-2 border-slate-200 bg-white text-slate-600";
                      let IconElement = null;

                      if (isThisOptionCorrect) {
                        optionClass = "border-2 border-green-500 bg-white text-green-600 font-bold";
                        IconElement = <CheckCircle2 className="text-green-500" size={24} strokeWidth={2.5} />;
                      } else if (isThisOptionUserChoice && !isThisOptionCorrect) {
                        optionClass = "border-2 border-red-500 bg-red-50 text-red-600 font-bold";
                        IconElement = <XCircle className="text-red-500" size={24} strokeWidth={2.5} />;
                      }

                      return (
                        <div 
                          key={currentKey} 
                          className={`flex items-center justify-between p-4 rounded-2xl transition-all ${optionClass}`}
                        >
                          <div>
                            <span className={`font-bold mr-2 ${isThisOptionCorrect || isThisOptionUserChoice ? '' : 'text-slate-800'}`}>
                              {currentKey}.
                            </span> 
                            <span className={isThisOptionCorrect || isThisOptionUserChoice ? 'font-bold' : ''}>
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
            })
          ) : (
            <div className="p-8 bg-white text-slate-500 rounded-3xl border-2 border-slate-200 text-center shadow-sm">
              <p>Bài thi này chỉ có dữ liệu điểm số, chưa có chi tiết câu hỏi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}