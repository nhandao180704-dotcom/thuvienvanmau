'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, CalendarDays, Eye, History, Trash2, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function GlobalHistoryPage() {
  const [historyList, setHistoryList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const historyString = localStorage.getItem('quiz_history')
    if (!historyString) {
      setLoading(false)
      return
    }

    let parsedHistory = []
    
    // An toàn chuyển đổi dữ liệu
    try {
      const parsed = JSON.parse(historyString)
      if (Array.isArray(parsed)) {
        parsedHistory = parsed
      } else if (typeof parsed === 'object') {
        // Tự động giải cứu các bản ghi Object cũ
        parsedHistory = Object.keys(parsed).map(key => ({ quiz_id: key, ...parsed[key] }))
      }
    } catch(e) {
      console.error("Lỗi parse lịch sử:", e)
    }

    if (parsedHistory.length === 0) {
      setLoading(false)
      return
    }

    try {
      // Quét tìm danh sách ID để nạp từ database 1 lần
      const uniqueQuizIds = Array.from(new Set(parsedHistory.map(h => h.quiz_id)))
      
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id, title, grade_level')
        .in('id', uniqueQuizIds)

      const combined = parsedHistory.map(attempt => {
        const quizInfo = quizzes?.find(q => q.id === attempt.quiz_id) || { title: 'Đề thi đã bị xóa', grade_level: '?' }
        return {
          ...attempt,
          title: quizInfo.title,
          gradeLevel: quizInfo.grade_level,
          // Gắn ID lần làm bài riêng biệt, nếu bài cũ ko có id thì dự phòng bằng mã quiz
          attemptId: attempt.id || attempt.quiz_id 
        }
      })

      // Sắp xếp bài mới nhất lên trên
      combined.sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return dateB - dateA;
      })
      
      setHistoryList(combined)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ lịch sử làm bài trên thiết bị này? Dữ liệu không thể khôi phục!')) {
      localStorage.removeItem('quiz_history')
      setHistoryList([])
    }
  }

  const formatDateTime = (item: any) => {
    if (item.time && item.date) {
        return `${item.time} - ${item.date}`;
    }
    if (item.completedAt) {
      try {
          const date = new Date(item.completedAt)
          if(!isNaN(date.getTime())) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN')
          }
      } catch {
          return 'Không rõ thời gian';
      }
    }
    return 'Không rõ thời gian';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/practice" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition">
            <ArrowLeft className="w-5 h-5" /> Về phòng luyện thi
          </Link>
          <div className="flex items-center gap-2 text-xl font-black text-slate-800">
            <History className="w-6 h-6 text-blue-600" />
            Lịch Sử Làm Bài
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Bài thi đã hoàn thành</h1>
                <p className="text-slate-500">Xem lại kết quả và tiến độ học tập của bạn trên thiết bị này.</p>
            </div>
            {historyList.length > 0 && (
                <button 
                    onClick={clearHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition border border-red-200"
                >
                    <Trash2 className="w-4 h-4" /> Xóa lịch sử
                </button>
            )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : historyList.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-solid border-slate-300 shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có dữ liệu</h3>
            <p className="text-slate-500 font-medium mb-6">Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu luyện tập ngay nhé!</p>
            <Link href="/practice" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition">
                Tới phòng luyện thi
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {historyList.map((item, index) => (
                <div key={index} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-lg">
                                Lớp {item.gradeLevel}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                <CalendarDays className="w-3.5 h-3.5" /> {formatDateTime(item)}
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Bạn đã trả lời đúng <strong className="text-slate-800">{item.correctAnswers ?? 0}</strong> trên tổng số <strong className="text-slate-800">{item.totalQuestions ?? 0}</strong> câu hỏi.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 md:border-l md:border-slate-100 md:pl-6">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Điểm số</p>
                            <p className={`text-3xl font-black ${item.score >= 8 ? 'text-emerald-500' : item.score >= 5 ? 'text-blue-500' : 'text-red-500'}`}>
                                {item.score ?? 0}
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            {/* Nút Xem lại được truyền thêm mã định danh bài làm ?attempt=xxx */}
                            <Link 
                                href={`/practice/${item.quiz_id || item.quizId}/review?attempt=${item.attemptId || ''}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-sm rounded-xl transition border border-blue-200"
                            >
                                <Eye className="w-4 h-4" /> Xem lại
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}