'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { BrainCircuit, ArrowRight, BookOpen, CheckCircle2, Clock, CalendarDays, RotateCcw } from 'lucide-react'

export default function PublicPracticeHub() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quizHistory, setQuizHistory] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchQuizzes()
    // Lấy lịch sử làm bài từ bộ nhớ trình duyệt (LocalStorage)
    const historyString = localStorage.getItem('quiz_history')
    if (historyString) {
      setQuizHistory(JSON.parse(historyString))
    }
  }, [])

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      if (data) setQuizzes(data)
    } catch (error) {
      console.error('Lỗi khi tải danh sách đề thi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Hàm định dạng ngày giờ VN
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-blue-600">
            <BookOpen className="w-6 h-6" />
            Thư Viện Văn Mẫu
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 bg-slate-100 px-4 py-2 rounded-full transition">
            Quay lại trang chủ
          </Link>
        </div>
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Phòng Luyện Thi Trắc Nghiệm
          </h1>
          <p className="text-lg text-slate-600">
            Khu vực làm bài kiểm tra, thử sức với các đề thi chuẩn bị cho kì thi vào lớp 10. Hệ thống sẽ tự động lưu lại tiến độ của bạn!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
            <BrainCircuit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">Hiện tại chưa có đề thi nào được mở.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => {
              const history = quizHistory[quiz.id] 
              const isCompleted = !!history

              return (
                <div key={quiz.id} className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group ${isCompleted ? 'border-emerald-200' : 'border-slate-200 hover:border-blue-400'}`}>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl transition-colors duration-300 ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                      <BrainCircuit className="w-7 h-7" />
                    </div>
                    
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> Chưa làm
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <h2 className={`text-xl font-bold line-clamp-2 leading-tight transition-colors ${isCompleted ? 'text-slate-800' : 'text-slate-800 group-hover:text-blue-600'}`}>
                      {quiz.title}
                    </h2>
                    <span className="inline-block mt-2 text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      Ôn thi vào Lớp {quiz.grade_level}
                    </span>
                  </div>
                  
                  <p className="text-slate-500 mb-6 flex-1 line-clamp-2 leading-relaxed text-sm">
                    {quiz.description || 'Đề thi trắc nghiệm kiểm tra kiến thức và rèn luyện kỹ năng.'}
                  </p>
                  
                  {isCompleted && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Điểm số:</span>
                        <span className="text-lg font-black text-emerald-600">{history.score} <span className="text-sm text-emerald-400">/ 10</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Câu đúng:</span>
                        <span className="text-sm font-bold text-slate-800">{history.correctAnswers} / {history.totalQuestions}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-2 pt-2 border-t border-emerald-100/50">
                        <CalendarDays className="w-3.5 h-3.5" /> 
                        Nộp lúc: {formatDateTime(history.completedAt)}
                      </div>
                    </div>
                  )}

                  <Link 
                    href={`/practice/${quiz.id}`} 
                    className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm ${
                      isCompleted 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-slate-900 text-white hover:bg-blue-600 group-hover:shadow-blue-200'
                    }`}
                  >
                    {isCompleted ? (
                      <>Làm lại bài <RotateCcw className="w-4 h-4" /></>
                    ) : (
                      <>Vào làm bài ngay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}