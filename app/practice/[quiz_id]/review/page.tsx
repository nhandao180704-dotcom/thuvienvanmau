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

  // --- XỬ LÝ DỮ LIỆU AN TOÀN ---
  const questions = historyData.questions || historyData.results || historyData.answers || [];
  const score = historyData.score ?? historyData.correctAnswers ?? 0;
  
  // Tránh lỗi hiển thị 5/0
  const calculatedTotal = historyData.total_questions || historyData.total || questions.length || 0;
  const totalQuestions = calculatedTotal === 0 ? score : calculatedTotal; 
  
  const title = historyData.title || historyData.quiz_title || 'Chi tiết bài làm';

  // --- ĐỊNH DẠNG NGÀY / GIỜ / THỜI GIAN LÀM BÀI ---
  let displayDate = 'Không rõ';
  let displayTime = 'Không rõ';
  
  // Nếu có trường ngày tháng rõ ràng
  if (historyData.date || historyData.created_at) {
    const rawDate = historyData.date || historyData.created_at;
    try {
      // Cố gắng phân tích nếu là chuỗi ISO
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        displayDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        displayTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } else {
        // Nếu chỉ là chuỗi text thường (ví dụ: "11/8/2026")
        displayDate = rawDate;
      }
    } catch {
      displayDate = rawDate;
    }
  }

  // Ưu tiên trường giờ cụ thể nếu có
  if (historyData.time) {
    displayTime = historyData.time;
  }

  // Xử lý thời gian làm bài (nếu lúc thi bạn có lưu biến duration)
  const duration = historyData.duration ? `${historyData.duration} phút` : 'Không xác định';

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

        {/* THÔNG TIN TỔNG QUAN (Đã thiết kế lại theo yêu cầu) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
                <span>Lúc: <strong>{displayTime}</strong></span>
              </div>
              <div className="hidden md:block w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-emerald-500" />
                <span>Thời gian thi: <strong>{duration}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-center bg-white px-8 py-4 rounded-xl border-2 border-slate-100 shadow-sm min-w-[140px]">
            <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Điểm số</p>
            <p className="text-4xl font-black text-slate-800">
              {score} <span className="text-xl font-bold text-slate-400">/ {totalQuestions}</span>
            </p>
          </div>
        </div>

        {/* CHI TIẾT CÂU HỎI */}
        <div className="space-y-6 mt-8">
          {Array.isArray(questions) && questions.length > 0 ? (
            questions.map((q: any, index: number) => {
              const correctAnswer = q.correct_answer ?? q.correctAnswer;
              const userAnswer = q.user_answer ?? q.userAnswer;
              const options = Array.isArray(q.options) ? q.options : (Array.isArray(q.answers) ? q.answers : []);

              const isUserChoice = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
              const isCorrect = isUserChoice && (userAnswer === correctAnswer);

              // TÙY CHỈNH NÉT VIỀN ĐẬM (border-2) CHUẨN ẢNH THIẾT KẾ
              let cardBorderColor = "border border-slate-200 bg-white";
              if (!isUserChoice) {
                // Câu chưa làm hoặc chọn sai: Viền màu đỏ rõ nét
                cardBorderColor = "border-2 border-red-300 bg-white"; 
              } else if (isCorrect) {
                // Câu chọn đúng: Viền màu xanh rõ nét
                cardBorderColor = "border-2 border-green-300 bg-white"; 
              } else {
                // Câu chọn sai: Viền màu đỏ rõ nét
                cardBorderColor = "border-2 border-red-300 bg-white"; 
              }

              return (
                <div key={index} className={`rounded-2xl p-6 ${cardBorderColor} shadow-sm transition-all`}>
                  <h3 className="text-base md:text-lg font-bold text-slate-500 mb-6">
                    Câu {index + 1}: <span className="text-slate-800">{q.question_text ?? q.question}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((opt: string, optIndex: number) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const isThisOptionCorrect = correctAnswer === opt || correctAnswer === optIndex;
                      const isThisOptionUserChoice = userAnswer === opt || userAnswer === optIndex;

                      // Tùy chỉnh màu sắc đáp án y hệt ảnh thiết kế
                      let optionClass = "border border-slate-200 bg-white text-slate-600";
                      let IconElement = null;

                      if (isThisOptionCorrect) {
                        // Khung đáp án đúng (Xanh lá)
                        optionClass = "border-2 border-green-500 bg-green-50 text-green-700 font-bold";
                        IconElement = <CheckCircle2 className="text-green-600" size={20} strokeWidth={2.5} />;
                      } else if (isThisOptionUserChoice && !isThisOptionCorrect) {
                        // Khung đáp án sai mà User chọn (Đỏ)
                        optionClass = "border-2 border-red-400 bg-red-50 text-red-700 font-bold";
                        IconElement = <XCircle className="text-red-500" size={20} strokeWidth={2.5} />;
                      }

                      return (
                        <div 
                          key={optIndex} 
                          className={`flex items-center justify-between p-4 rounded-xl transition-all ${optionClass}`}
                        >
                          <div>
                            <span className="font-bold mr-2 text-slate-800">{letters[optIndex]}.</span> 
                            <span className={isThisOptionCorrect || isThisOptionUserChoice ? 'font-bold' : ''}>{opt}</span>
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
            <div className="p-8 bg-white text-slate-500 rounded-2xl border border-slate-200 text-center shadow-sm">
              <p>Bài thi này chỉ có dữ liệu điểm số, chưa có chi tiết câu hỏi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}