'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { BrainCircuit, ArrowRight, BookOpen, CheckCircle2, Clock, CalendarDays, RotateCcw, Search, Filter, History } from 'lucide-react'

export default function PublicPracticeHub() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quizHistory, setQuizHistory] = useState<Record<string, any>>({})

  const [searchTerm, setSearchText] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('ALL')

  useEffect(() => {
    fetchQuizzes()
    const historyString = localStorage.getItem('quiz_history')
    if (historyString) {
      try {
        const parsedData = JSON.parse(historyString)
        let formattedHistory: Record<string, any> = {}

        if (Array.isArray(parsedData)) {
          // Lấy lịch sử mới nhất của mỗi bài thi
          parsedData.forEach(attempt => {
            const currentRecord = formattedHistory[attempt.quiz_id]
            if (!currentRecord || new Date(attempt.completedAt) > new Date(currentRecord.completedAt)) {
              formattedHistory[attempt.quiz_id] = attempt
            }
          })
        } else if (typeof parsedData === 'object') {
          formattedHistory = parsedData
        }
        
        setQuizHistory(formattedHistory)
      } catch(e) {}
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

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN')
  }

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesGrade = selectedGrade === 'ALL' || String(quiz.grade_level) === String(selectedGrade)
    return matchesSearch && matchesGrade
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-blue-600">
            <BookOpen className="w-6 h-6" />
            <span className="hidden sm:inline">Thư Viện Văn Mẫu</span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/practice/history" className="text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-full transition flex items-center gap-2 shadow-sm">
              <History className="w-4 h-4" /> <span className="hidden sm:inline">Lịch sử làm bài</span>
            </Link>
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-full transition">
              <span className="hidden sm:inline">Trang chủ</span>
              <span className="sm:hidden">Thoát</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Phòng Luyện Thi Trắc Nghiệm
          </h1>
          <p className="text-lg text-slate-600">
            Khu vực làm bài kiểm tra, thử sức với các đề thi bám sát chương trình Ngữ văn THCS. Hệ thống sẽ tự động lưu lại tiến độ của bạn!
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-10 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              id="search-quiz"
              name="search-quiz"
              type="text" 
              placeholder="Tìm kiếm đề thi..." 
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-sm transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="text-slate-400 w-5 h-5" />
            <select 
              id="grade-filter"
              name="grade-filter"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-sm text-slate-700 bg-white transition cursor-pointer"
            >
              <option value="ALL">Tất cả các lớp</option>
              <option value="6">Khối 6</option>
              <option value="7">Khối 7</option>
              <option value="8">Khối 8</option>
              <option value="9">Khối 9</option>
              <option value="10">Luyện thi vào 10</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-solid border-slate-300 shadow-sm">
            <BrainCircuit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">Không tìm thấy đề thi phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredQuizzes.map((quiz) => {
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
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">
                        Lớp {quiz.grade_level || 'Chung'}
                      </span>
                      <span className="inline-block text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                        ⏱️ {quiz.time_limit || 15} phút
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 mb-6 flex-1 line-clamp-2 leading-relaxed text-sm mt-2">
                    {quiz.description || 'Đề thi trắc nghiệm kiểm tra kiến thức và rèn luyện kỹ năng.'}
                  </p>
                  
                  {isCompleted && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Điểm số:</span>
                        <span className="text-lg font-black text-emerald-600">{history.score.toString().replace('.', ',')}</span>
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

                  <div className="flex gap-3 mt-auto">
                    {isCompleted ? (
                      <Link 
                        href={`/practice/${quiz.id}`} 
                        className="w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      >
                        Làm lại bài <RotateCcw className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link 
                        href={`/practice/${quiz.id}`} 
                        className="w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm bg-slate-900 text-white hover:bg-blue-600 group-hover:shadow-blue-200"
                      >
                        Vào làm bài ngay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}