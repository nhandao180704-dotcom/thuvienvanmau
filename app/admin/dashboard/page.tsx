'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import DashboardCharts from '@/components/DashboardCharts'
import OverviewCards from '@/components/OverviewCards'
import { Loader2 } from 'lucide-react'

function DashboardContent() {
  const [essays, setEssays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Chỉ tải cột views để tính tổng, giúp trang Dashboard tải cực nhanh
        const { data: essaysData } = await supabase.from('essays').select('views')
        if (essaysData) setEssays(essaysData)
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalViews = essays.reduce((sum, essay) => sum + (essay.views || 0), 0)
  const publishedCount = essays.length
  const draftCount = 0

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <AdminHeader onSearch={() => {}} />

        <main className="flex-1 p-8 overflow-y-auto mt-16">
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
              <p className="text-slate-500">Quản lý số liệu và tổng quan hệ thống thư viện</p>
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <OverviewCards 
                  totalEssays={essays.length} 
                  totalViews={totalViews} 
                  publishedCount={publishedCount} 
                  draftCount={draftCount} 
                />
                <DashboardCharts />
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