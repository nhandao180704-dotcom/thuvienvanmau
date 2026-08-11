'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'

export default function ReviewQuizPage({ params }: { params: { quiz_id: string } }) {
  const router = useRouter()
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kéo dữ liệu lịch sử từ bộ nhớ trình duyệt ra
    const storedHistory = localStorage.getItem('quizHistory')
    if (storedHistory) {
      const historyArray = JSON.parse(storedHistory)
      // Tìm bài thi có id khớp với id trên URL
      const attempt = historyArray.find((h: any) => h.id === params.quiz_id || h.quiz_id === params.quiz_id)
      setHistoryData(attempt)
    }
    setLoading(false)
  }, [params.quiz_id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>
  }

  if (!historyData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">Không tìm thấy dữ liệu bài làm này.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Quay lại lịch sử
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Nút Quay lại */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium mb-2"
        >
          <ArrowLeft size={20} />
          Về Lịch sử làm bài
        </button>

        {/* Thông tin tổng quan bài làm */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{historyData.title || 'Chi tiết bài làm'}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={16}/> {historyData.date || 'Hôm nay'}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {historyData.time || '--:--'}</span>
            </div>
          </div>
          <div className="text-center bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-600 font-medium mb-1">Điểm số</p>
            <p className="text-3xl font-black text-blue-700">
              {historyData.score} <span className="text-lg font-medium text-blue-400">/ {historyData.total_questions || historyData.questions?.length}</span>
            </p>
          </div>
        </div>

        {/* Danh sách câu hỏi và đáp án */}
        <div className="space-y-6 mt-8">
          {historyData.questions?.map((q: any, index: number) => {
            // Kiểm tra xem câu này người dùng làm đúng hay sai
            const isQuestionCorrect = q.user_answer === q.correct_answer;
            const cardBorderColor = isQuestionCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/20';

            return (
              <div key={index} className={`rounded-2xl border p-6 ${cardBorderColor}`}>
                <h3 className="text-lg font-bold text-slate-800 mb-6">
                  Câu {index + 1}: <span className="text-slate-700 font-medium">{q.question_text || q.question}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options?.map((opt: string, optIndex: number) => {
                    const letters = ['A', 'B', 'C', 'D']
                    
                    // Logic xác định trạng thái của từng đáp án
                    const isUserChoice = q.user_answer === opt || q.user_answer === optIndex;
                    const isCorrectChoice = q.correct_answer === opt || q.correct_answer === optIndex;

                    let optionClass = "border-slate-200 bg-white text-slate-700"; // Mặc định
                    let IconElement = null;

                    if (isCorrectChoice) {
                      // Đáp án đúng luôn hiện màu xanh
                      optionClass = "border-green-500 bg-green-100 text-green-900 font-medium";
                      IconElement = <CheckCircle2 className="text-green-600" size={20} />;
                    } else if (isUserChoice && !isCorrectChoice) {
                      // Đáp án sai mà người dùng lỡ chọn -> hiện màu đỏ
                      optionClass = "border-red-400 bg-red-100 text-red-900 font-medium";
                      IconElement = <XCircle className="text-red-600" size={20} />;
                    }

                    return (
                      <div 
                        key={optIndex} 
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${optionClass}`}
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
          })}
        </div>
        
      </div>
    </div>
  )
}