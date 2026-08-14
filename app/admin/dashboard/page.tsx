'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import DashboardCharts from '@/components/DashboardCharts'
import OverviewCards from '@/components/OverviewCards' // Đã import Component thẻ thống kê
import { Plus, Edit, Trash2, BarChart2 } from 'lucide-react'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentTab = searchParams.get('tab') || 'overview'

  const [essays, setEssays] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: essaysData } = await supabase.from('essays').select('*').order('created_at', { ascending: false })
      if (essaysData) setEssays(essaysData)

      const { data: quizzesData } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false })
      if (quizzesData) setQuizzes(quizzesData)
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEssay = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài văn này? Hành động này không thể hoàn tác!')) return;
    
    try {
      const { error } = await supabase.from('essays').delete().eq('id', id);
      if (error) throw error;
      setEssays(essays.filter(essay => essay.id !== id));
      alert('Đã xóa bài văn thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa bài văn:', error);
      alert('Có lỗi xảy ra khi xóa bài văn.');
    }
  }

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này? Toàn bộ câu hỏi bên trong sẽ bị xóa theo!')) return;
    
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) throw error;
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      alert('Đã xóa đề thi thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa đề thi:', error);
      alert('Có lỗi xảy ra khi xóa đề thi.');
    }
  }

  // Helper format thể loại văn (ánh xạ từ mã Database)
  const formatCategory = (cat: string) => {
    const map: Record<string, string> = {
      'văn_tự_sự': 'Văn tự sự',
      'văn_miêu_tả': 'Văn miêu tả',
      'văn_biểu_cảm': 'Văn biểu cảm',
      'văn_nghị_luận': 'Văn nghị luận',
      'văn_thuyết_minh': 'Văn thuyết minh',
      'phân_tích_tác_phẩm': 'Phân tích tác phẩm'
    }
    return map[cat] || cat || '---'
  }

  // Tính toán số liệu thống kê
  const totalViews = essays.reduce((sum, essay) => sum + (essay.views || 0), 0)
  const publishedCount = essays.length
  const draftCount = 0

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <AdminHeader onSearch={() => {}} />

        <main className="flex-1 p-8 overflow-y-auto mt-16">

          {/* TAB: TỔNG QUAN */}
          {currentTab === 'overview' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
                <p className="text-slate-500">Quản lý số liệu và tổng quan hệ thống thư viện</p>
              </div>

              {/* Sử dụng Component OverviewCards siêu xịn */}
              <OverviewCards 
                totalEssays={essays.length} 
                totalViews={totalViews} 
                publishedCount={publishedCount} 
                draftCount={draftCount} 
              />

              {/* Biểu đồ Real-time */}
              <DashboardCharts />
            </div>
          )}

          {/* TAB: QUẢN LÝ BÀI VĂN */}
          {currentTab === 'essays' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Quản lý bài viết</h1>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Danh sách Bài Văn ({essays.length})</h2>
                  <Link href="/admin/essays/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">
                    <Plus className="w-4 h-4" /> Thêm bài văn
                  </Link>
                </div>
                
                {loading ? (
                  <p className="text-center py-10 text-slate-500">Đang tải dữ liệu...</p>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="pb-3 font-medium">Tiêu đề</th>
                        <th className="pb-3 font-medium">Khối lớp</th>
                        <th className="pb-3 font-medium">Thể loại</th>
                        <th className="pb-3 font-medium text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {essays.map(essay => (
                        <tr key={essay.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 font-bold text-slate-900 max-w-xs truncate pr-4">{essay.title}</td>
                          <td className="py-4 text-blue-600 font-medium">
                            {essay.class_level ? (essay.class_level === 10 ? 'Ôn thi vào 10' : `Lớp ${essay.class_level}`) : '---'}
                          </td>
                          <td className="py-4 text-slate-600">{formatCategory(essay.category)}</td>
                          <td className="py-4 text-right space-x-4">
                            <Link href={`/admin/essays/edit/${essay.id}`} className="text-blue-500 hover:text-blue-700">
                              <Edit className="w-5 h-5 inline" />
                            </Link>
                            <button onClick={() => handleDeleteEssay(essay.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-5 h-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB: QUẢN LÝ ĐỀ THI */}
          {currentTab === 'quizzes' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Quản lý đề thi</h1>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Danh sách Đề Thi ({quizzes.length})</h2>
                  <Link href="/admin/quizzes/new" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition shadow-sm">
                    <Plus className="w-4 h-4" /> Tạo đề trắc nghiệm
                  </Link>
                </div>

                {loading ? (
                  <p className="text-center py-10 text-slate-500">Đang tải dữ liệu...</p>
                ) : quizzes.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-2">Chưa có đề thi nào.</p>
                    <Link href="/admin/quizzes/new" className="text-blue-600 font-medium hover:underline">Tạo đề thi đầu tiên ngay</Link>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="pb-3 font-medium">Tên đề thi</th>
                        <th className="pb-3 font-medium">Dành cho</th>
                        <th className="pb-3 font-medium">Thời gian</th>
                        <th className="pb-3 font-medium text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.map(quiz => (
                        <tr key={quiz.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 font-bold text-slate-900 pr-4">{quiz.title}</td>
                          <td className="py-4 text-emerald-600 font-medium">{quiz.grade || '---'}</td>
                          <td className="py-4 text-slate-600 truncate max-w-xs pr-4">{quiz.duration ? `${quiz.duration} phút` : '---'}</td>
                          <td className="py-4 text-right space-x-3">
                            <Link href={`/admin/quizzes/${quiz.id}/results`} className="text-amber-500 hover:text-amber-700 transition" title="Xem kết quả">
                              <BarChart2 className="w-5 h-5 inline" />
                            </Link>
                            <Link href={`/admin/quizzes/edit/${quiz.id}`} className="text-blue-500 hover:text-blue-700 transition" title="Sửa đề thi">
                              <Edit className="w-5 h-5 inline" />
                            </Link>
                            <button onClick={() => handleDeleteQuiz(quiz.id)} className="text-red-500 hover:text-red-700" title="Xóa đề thi">
                              <Trash2 className="w-5 h-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Đang tải trang quản trị...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}