'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { BrainCircuit, ArrowRight, BookOpen } from 'lucide-react'

export default function PublicPracticeHub() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-blue-600">
            <BookOpen className="w-6 h-6" />
            Thư Viện Văn Mẫu
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600">
            Quay lại trang chủ
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Phòng Luyện Thi Trắc Nghiệm
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Khu vực làm bài kiểm tra, thử sức với các đề thi chuẩn bị cho kì thi vào lớp 10. Hãy chọn một đề thi bên dưới để bắt đầu!
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
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <BrainCircuit className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {quiz.title}
                    </h2>
                    <span className="inline-block mt-2 text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      Dành cho Lớp {quiz.grade_level}
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-500 mb-8 flex-1 line-clamp-3 leading-relaxed text-sm">
                  {quiz.description || 'Đề thi trắc nghiệm kiểm tra kiến thức.'}
                </p>
                
                <Link href={`/practice/${quiz.id}`} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-600 transition-colors shadow-md group-hover:shadow-blue-200">
                  Vào làm bài ngay <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}