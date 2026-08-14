'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { ArrowLeft, Trophy, Clock, ShieldAlert, Users, Award, Search, FileText, Edit, X, CheckCircle2, Loader2 } from 'lucide-react'

function AdminQuizResultsForm() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Trạng thái Modal chấm điểm
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [newScore, setNewScore] = useState<number>(0)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (quizId) fetchResults()
  }, [quizId])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .maybeSingle()
      if (quizData) setQuiz(quizData)

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

  // Mở Modal chấm điểm
  const handleOpenGradeModal = (res: any) => {
    setSelectedResult(res)
    setNewScore(res.score || 0)
  }

  // Lưu điểm
  const handleUpdateScore = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('quiz_results')
        .update({ score: newScore })
        .eq('id', selectedResult.id)

      if (error) throw error

      setResults(results.map(r => r.id === selectedResult.id ? { ...r, score: newScore } : r))
      setSelectedResult(null)
      alert('Đã cập nhật điểm thành công!')
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật điểm.')
    } finally {
      setIsUpdating(false)
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

  const filteredResults = results.filter(r =>
    r.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <AdminHeader onSearch={() => {}} />

        <main className="flex-1 p-6 md:p-8 mt-16 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/quizzes" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Thống kê & Chấm điểm</h1>
              <p className="text-sm font-semibold text-blue-600">{quiz?.title || 'Đề thi trắc nghiệm'}</p>
            </div>
          </div>

          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Lượt làm bài</p>
                <p className="text-2xl font-black text-slate-800">{results.length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Điểm trung bình</p>
                <p className="text-2xl font-black text-slate-800">
                  {results.length > 0 ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length).toFixed(1).replace('.', ',') : 0} <span className="text-sm text-slate-400">/ 10</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Điểm cao nhất</p>
                <p className="text-2xl font-black text-slate-800">
                  {results.length > 0 ? Math.max(...results.map(r => r.score || 0)).toFixed(1).replace('.', ',') : 0} <span className="text-sm text-slate-400">/ 10</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <Search className="text-slate-400 w-5 h-5 ml-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc lớp..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Bảng danh sách chi tiết */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Danh sách bài nộp</h2>
            </div>

            <div className="overflow-x-auto hide-scrollbar pb-2">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100 tracking-wider">
                    <th className="p-4 pl-6 w-16">Hạng</th>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4 w-24">Lớp</th>
                    <th className="p-4">Trường</th>
                    <th className="p-4 text-center w-28">Điểm số</th>
                    <th className="p-4 text-center w-32">Thời gian làm</th>
                    <th className="p-4 text-center w-28">Vi phạm</th>
                    <th className="p-4 text-right w-36">Nộp lúc</th>
                    <th className="p-4 pr-6 text-right w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400 font-medium">Không tìm thấy kết quả nào.</td>
                    </tr>
                  ) : (
                    filteredResults.map((res, index) => (
                      <tr key={res.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 pl-6 font-black text-slate-400 whitespace-nowrap">
                          {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                        </td>
                        <td className="p-4 font-bold text-slate-900">{res.display_name}</td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">{res.class_name || '—'}</td>
                        <td className="p-4 text-slate-600 truncate max-w-[150px]">{res.school_name || '—'}</td>
                        
                        <td className="p-4 text-center whitespace-nowrap">
                          <div className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 rounded-full font-black text-xs min-w-[70px] ${res.score >= 8 ? 'bg-emerald-100 text-emerald-700' : res.score >= 5 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {Number(res.score).toFixed(2).replace('.', ',')} / 10
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
                        <td className="p-4 text-right text-xs text-slate-400 font-medium whitespace-nowrap">
                          {formatDateTime(res.created_at)}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => handleOpenGradeModal(res)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition-colors text-xs whitespace-nowrap"
                          >
                            <FileText size={14} /> Chấm Bài
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL CHẤM ĐIỂM */}
      {selectedResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Edit className="text-blue-600" /> Chấm bài: <span className="text-slate-600">{selectedResult.display_name}</span>
              </h2>
              <button onClick={() => setSelectedResult(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Điểm tự động (Trắc nghiệm)</p>
                  <p className="text-2xl font-black text-blue-600">{Number(selectedResult.score).toFixed(2).replace('.', ',')} đ</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-500 mb-1">Cảnh báo gian lận</p>
                  <p className={`font-black ${selectedResult.cheat_count > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                    {selectedResult.cheat_count} lần thoát trang
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                  <FileText size={18} /> Lịch sử đáp án của thí sinh
                </h3>
                <div className="space-y-3">
                  {selectedResult.answers_detail && Object.keys(selectedResult.answers_detail).length > 0 ? (
                    Object.entries(selectedResult.answers_detail).map(([questionIndex, answerText]: any) => {
                      const isEssay = answerText.length > 3; 
                      return (
                        <div key={questionIndex} className={`p-4 rounded-xl border-2 ${isEssay ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
                          <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                            Câu hỏi số {Number(questionIndex) + 1} {isEssay && '- PHẦN TỰ LUẬN'}
                          </p>
                          <p className={`font-medium ${isEssay ? 'text-amber-900 whitespace-pre-wrap' : 'text-slate-700'}`}>
                            {answerText || '(Học sinh để trống)'}
                          </p>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-slate-500 italic p-4 bg-slate-50 rounded-xl">Học sinh chưa trả lời câu hỏi nào.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-end justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Điểm tổng kết mới (Thang 10)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10"
                    value={newScore}
                    onChange={(e) => setNewScore(parseFloat(e.target.value) || 0)}
                    className="w-32 px-4 py-3 border-2 border-emerald-200 text-emerald-700 focus:border-emerald-500 outline-none rounded-xl font-black text-lg bg-white"
                  />
                  <span className="text-xs text-slate-500 font-medium max-w-[200px]">Bạn hãy đánh giá phần tự luận và sửa điểm vào ô này nhé.</span>
                </div>
              </div>
              <button 
                onClick={handleUpdateScore} 
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all shrink-0"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Lưu Điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminQuizResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Đang tải...</div>}>
      <AdminQuizResultsForm />
    </Suspense>
  )
}