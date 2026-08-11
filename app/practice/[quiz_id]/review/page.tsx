'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'

export default function ReviewQuizPage({ params }: { params: { id?: string, quiz_id?: string } }) {
  const router = useRouter()
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Tự động nhận diện tên thư mục là [id] hay [quiz_id]
  const currentId = params.id || params.quiz_id;

  useEffect(() => {
    // Quét tìm dữ liệu trong localStorage
    const storedHistory = localStorage.getItem('quizHistory') || localStorage.getItem('quiz_history');
    
    if (storedHistory) {
      const historyArray = JSON.parse(storedHistory)
      // Tìm bài làm có ID khớp với URL
      const attempt = historyArray.find((h: any) => h.id === currentId || h.quiz_id === currentId)
      
      if (attempt) {
        setHistoryData(attempt)
      }
    }
    setLoading(false)
  }, [currentId])

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

  // Tương thích với nhiều cách đặt tên biến khác nhau trong bộ nhớ
  const questions = historyData.questions || historyData.results || historyData.answers || [];
  const score = historyData.score ?? historyData.correctAnswers ?? 0;
  const totalQuestions = historyData.total_questions ?? historyData.total ?? questions.length ?? 0;
  const title = historyData.title ?? historyData.quiz_title ?? 'Chi tiết bài làm';
  const date = historyData.date ?? historyData.created_at ?? 'Hôm nay';
  const time = historyData.time ?? '--:--';

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
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={16}/> {date}</span>
              <span className="flex items-center gap-1"><Clock size={16}/> {time}</span>
            </div>
          </div>
          <div className="text-center bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-600 font-medium mb-1">Điểm số</p>
            <p className="text-3xl font-black text-blue-700">
              {score} <span className="text-lg font-medium text-blue-400">/ {totalQuestions}</span>
            </p>
          </div>
        </div>

        {/* Cảnh báo nếu lịch sử cũ không lưu câu hỏi */}
        {questions.length === 0 && (
          <div className="p-6 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200">
            <p><strong>Lưu ý:</strong> Dữ liệu lịch sử cũ của bài thi này chỉ lưu điểm số, không lưu chi tiết câu hỏi. Xin hãy làm bài thi mới để xem được chi tiết tính năng này.</p>
          </div>
        )}

        {/* Danh sách câu hỏi và đáp án */}
        <div className="space-y-6 mt-8">
          {questions.map((q: any, index: number) => {
            const correctAnswer = q.correct_answer ?? q.correctAnswer;
            const userAnswer = q.user_answer ?? q.userAnswer;
            const options = q.options ?? q.answers ?? [];

            // Kiểm tra trạng thái làm bài
            const isUserChoice = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
            const isCorrect = isUserChoice && (userAnswer === correctAnswer);

            // LOGIC XỬ LÝ VIỀN (Đúng chuẩn yêu cầu)
            let cardBorderColor = "border-slate-200 bg-white";
            if (!isUserChoice) {
              // 1. Câu chưa làm -> Viền đỏ đậm (border-2)
              cardBorderColor = "border-2 border-red-500 bg-red-50/10"; 
            } else if (isCorrect) {
              // 2. Câu chọn đúng -> Viền xanh đậm (border-2)
              cardBorderColor = "border-2 border-green-500 bg-green-50/10"; 
            } else {
              // 3. Câu chọn sai -> Viền đỏ nhạt, nền đỏ nhạt
              cardBorderColor = "border border-red-200 bg-red-50/20"; 
            }

            return (
              <div key={index} className={`rounded-2xl p-6 ${cardBorderColor} transition-colors`}>
                <h3 className="text-lg font-bold text-slate-800 mb-6">
                  Câu {index + 1}: <span className="text-slate-700 font-medium">{q.question_text ?? q.question}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((opt: string, optIndex: number) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    
                    const isThisOptionCorrect = correctAnswer === opt || correctAnswer === optIndex;
                    const isThisOptionUserChoice = userAnswer === opt || userAnswer === optIndex;

                    let optionClass = "border-slate-200 bg-white text-slate-700";
                    let IconElement = null;

                    if (isThisOptionCorrect) {
                      // Đáp án đúng CỦA CÂU HỎI -> luôn hiện xanh (kể cả khi chưa làm)
                      optionClass = "border-green-500 bg-green-100 text-green-900 font-medium";
                      IconElement = <CheckCircle2 className="text-green-600" size={20} />;
                    } else if (isThisOptionUserChoice && !isThisOptionCorrect) {
                      // Đáp án người dùng chọn sai -> hiện đỏ
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