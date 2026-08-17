'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import DashboardCharts from '@/components/DashboardCharts'
import OverviewCards from '@/components/OverviewCards'
import { Loader2, LayoutDashboard, FileText, MessageSquare, ArrowRight, Eye, Clock } from 'lucide-react'
import Link from 'next/link'

function DashboardContent() {
  const [stats, setStats] = useState({
    totalEssays: 0,
    totalViews: 0,
    publishedCount: 0,
    draftCount: 0
  })
  const [recentEssays, setRecentEssays] = useState<any[]>([])
  const [recentComments, setRecentComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // 1. Lấy dữ liệu bài viết
        const { data: essays } = await supabase
          .from('essays')
          .select('id, title, class_level, views, status, created_at')
        
        let totalViews = 0
        let published = 0
        let drafts = 0
        
        if (essays) {
          essays.forEach(essay => {
            totalViews += (essay.views || 0)
            if (essay.status === 'published') published++
            if (essay.status === 'draft') drafts++
          })
          
          // Lấy 5 bài mới nhất
          const sorted = [...essays].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          setRecentEssays(sorted.slice(0, 5))
        }

        // 2. Lấy 5 bình luận gần đây
        const { data: comments } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (comments) setRecentComments(comments)

        // Cập nhật State cho các Cards
        setStats({
          totalEssays: essays?.length || 0,
          totalViews,
          publishedCount: published,
          draftCount: drafts
        })

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <AdminHeader onSearch={() => {}} />

        <main className="flex-1 p-8 overflow-y-auto mt-16">
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-2">
                <LayoutDashboard className="text-blue-600" size={28} /> Dashboard
              </h1>
              <p className="text-slate-500">Quản lý số liệu và tổng quan hệ thống thư viện</p>
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                {/* 4 Thẻ Tổng Quan Của Bạn */}
                <OverviewCards 
                  totalEssays={stats.totalEssays} 
                  totalViews={stats.totalViews} 
                  publishedCount={stats.publishedCount} 
                  draftCount={stats.draftCount} 
                />
                
                {/* Biểu đồ của bạn */}
                <DashboardCharts />

                {/* HAI CỘT: BÀI VIẾT MỚI NHẤT & BÌNH LUẬN GẦN ĐÂY */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  
                  {/* CỘT 1: BÀI VIẾT MỚI NHẤT */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        <FileText size={20} className="text-blue-500" />
                        Bài viết mới cập nhật
                      </h2>
                      <Link href="/admin/essays" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                        Xem tất cả <ArrowRight size={14} />
                      </Link>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {recentEssays.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium italic py-8">
                          Chưa có bài viết nào.
                        </div>
                      ) : (
                        recentEssays.map((essay) => (
                          <div key={essay.id} className="group flex items-start justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                            <div className="flex-1 min-w-0 pr-4">
                              <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                                {essay.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-400">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                  {essay.class_level === 0 ? 'Văn mẫu chung' : `Lớp ${essay.class_level}`}
                                </span>
                                <span className="flex items-center gap-1"><Eye size={12}/> {essay.views || 0}</span>
                                <span className="flex items-center gap-1"><Clock size={12}/> {new Date(essay.created_at).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                essay.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {essay.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* CỘT 2: BÌNH LUẬN GẦN ĐÂY */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        <MessageSquare size={20} className="text-orange-500" />
                        Bình luận gần đây
                      </h2>
                      <Link href="/admin/comments" className="text-sm font-bold text-orange-600 hover:text-orange-800 transition-colors flex items-center gap-1">
                        Quản lý <ArrowRight size={14} />
                      </Link>
                    </div>

                    <div className="flex-1 space-y-4">
                      {recentComments.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium italic py-8">
                          Chưa có bình luận nào.
                        </div>
                      ) : (
                        recentComments.map((comment) => (
                          <div key={comment.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-800 text-sm">{comment.user_name}</span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                              "{comment.content}"
                            </p>
                            <div className="mt-3 flex justify-end">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                comment.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {comment.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Đang tải trang quản trị...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}