'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { ArrowLeft, Trophy, Clock, ShieldAlert, Users, Award } from 'lucide-react'

export default function AdminQuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (quizId) fetchResults()
  }, [quizId])

  const fetchResults = async () => {
    setLoading(true)
    try {
      // Lấy thông tin đề thi
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()
      if (quizData) setQuiz(quizData)

      // Lấy danh sách kết quả học sinh làm đề này
      const { data: resultsData, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true })

      if (error) throw error
      if (resultsData) setResults(resultsData)
    } catch (err) {
      console.error('Lỗi lấy kết quả:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN')
  }

  if (loading) return <div className="p-8 text-center font-bold text-blue-600">Đang tải kết quả thi...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard?tab=quizzes" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Thống kê kết quả bài thi</h1>
          <p className="text-sm font-semibold text-blue-600">{quiz?.title || 'Đề thi trắc nghiệm'}</p>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Lượt làm bài</p>
            <p className="text-2xl font-black text-slate-800">{results.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Điểm trung bình</p>
            <p className="text-2xl font-black text-slate-800">
              {results.length > 0 ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1).replace('.', ',') : 0} / 10
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Điểm cao nhất</p>
            <p className="text-2xl font-black text-slate-800">
              {results.length > 0 ? Math.max(...results.map(r => r.score)).toString().replace('.', ',') : 0} / 10
            </p>
          </div>
        </div>
      </div>

      {/* Bảng danh sách chi tiết */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Danh sách học sinh đã nộp bài</h2>
        </div>

        <div className="overflow-x-auto hide-scrollbar pb-2">
          {/* Thêm min-w-[900px] để bảng không bị bóp nghẹt trên mobile */}
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                <th className="p-4 pl-6 w-16">Hạng</th>
                <th className="p-4">Họ và tên</th>
                <th className="p-4 w-24">Lớp</th>
                <th className="p-4">Trường</th>
                <th className="p-4 text-center w-28">Điểm số</th>
                <th className="p-4 text-center w-32">Thời gian làm</th>
                <th className="p-4 text-center w-28">Số vi phạm</th>
                <th className="p-4 pr-6 text-right w-36">Nộp lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">Chưa có học sinh nào nộp bài thi này.</td>
                </tr>
              ) : (
                results.map((res, index) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 pl-6 font-black text-slate-400 whitespace-nowrap">
                      {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{res.display_name}</td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">{res.class_name || '—'}</td>
                    <td className="p-4 text-slate-600 truncate max-w-[150px]">{res.school_name || '—'}</td>
                    
                    {/* Cột Điểm số được ép hiển thị trên 1 dòng với whitespace-nowrap và min-w */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 rounded-full font-black text-xs min-w-[70px] ${res.score >= 8 ? 'bg-emerald-100 text-emerald-700' : res.score >= 5 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {res.score.toString().replace('.', ',')} / 10
                      </div>
                    </td>
                    
                    <td className="p-4 text-center font-mono text-slate-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1"><Clock size={14} /> {formatTime(res.time_taken)}</span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {res.cheat_count > 0 ? (
                        <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold min-w-[65px]">
                          <ShieldAlert size={14} /> {res.cheat_count} lần
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Không</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right text-xs text-slate-400 font-medium whitespace-nowrap">{formatDateTime(res.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}