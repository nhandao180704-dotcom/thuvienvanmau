'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Zap, BookOpen, ChevronRight, TrendingUp, Trophy, ArrowRight, PenTool, LayoutDashboard } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import VisitorCounter from '@/components/VisitorCounter'

export default function Sidebar() {
  const [hotEssays, setHotEssays] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false) // Thêm state kiểm tra Admin

  useEffect(() => {
    // 1. Tải danh sách bài viết Hot
    const fetchHotEssays = async () => {
      try {
        const { data } = await supabase
          .from('essays')
          .select('id, title, genre, grade')
          // .eq('status', 'published') // Bỏ comment nếu bạn có cột status
          .order('created_at', { ascending: false })
          .limit(4)
        
        if (data && data.length > 0) {
          setHotEssays(data)
        }
      } catch (error) {
        console.error('Lỗi tải bài hot:', error)
      }
    }

    // 2. Kiểm tra quyền Admin
    const checkAdminRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile && profile.role === 'admin') {
          setIsAdmin(true)
        }
      }
    }

    fetchHotEssays()
    checkAdminRole()
  }, [])

  const examPrepItems = [
    { id: 1, title: 'Ôn thi trắc nghiệm', badge: 'Hot', href: '/practice' },
    { id: 2, title: 'Đề thi mẫu vào lớp 10', badge: 'Mới', href: '/category/de-thi-10' },
    { id: 3, title: 'Bí kíp đạt điểm cao môn Ngữ Văn', badge: 'Hay', href: '/category/bi-kip' },
  ]

  return (
    <aside className="space-y-6">
      
      {/* KHỐI QUẢN TRỊ - CHỈ HIỂN THỊ KHI LÀ ADMIN */}
      {isAdmin && (
        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="bg-slate-900 p-5 flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <LayoutDashboard size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Khu vực Quản trị</h3>
              <p className="text-xs text-slate-400 font-medium">Dành riêng cho Admin</p>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold transition-all border border-transparent hover:border-slate-100">
              <LayoutDashboard size={18} />
              <span>Tổng quan (Dashboard)</span>
            </Link>
            <Link href="/admin/essays" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold transition-all border border-transparent hover:border-slate-100">
              <PenTool size={18} />
              <span>Quản lý bài viết</span>
            </Link>
          </div>
        </div>
      )}

      {/* Khối 1: Hot Tuần Này */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-slate-900 p-5 flex items-center gap-3 text-white">
          <div className="p-2 bg-white/10 rounded-lg">
            <Zap size={20} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg tracking-tight">Hot Tuần Này</h3>
            <p className="text-xs text-slate-400 font-medium">Được đọc nhiều nhất</p>
          </div>
        </div>
        <div className="p-2">
          {hotEssays.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-4">Đang cập nhật bài viết...</p>
          ) : (
            hotEssays.map((item, index) => (
              <Link key={item.id} href={`/essay/${item.id}`} className="group flex gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-base shrink-0 group-hover:scale-110 transition-all">
                  0{index + 1}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">{item.title}</p>
                  <span className="text-xs font-medium text-slate-400 mt-1">{item.genre || 'Văn mẫu'} • {item.grade || 'THCS'}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Khối 2: Góc Ôn Thi */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 flex items-center gap-3 text-white">
          <div className="p-2 bg-white/20 rounded-lg">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg tracking-tight">Góc Ôn Thi Ngữ Văn</h3>
            <p className="text-xs text-orange-100 font-medium">Tự tin bứt phá điểm số Văn 9</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {examPrepItems.map((item) => (
            <Link key={item.id} href={item.href} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all">
              <p className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors line-clamp-2 flex-1 pr-2">{item.title}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1.5 rounded-md whitespace-nowrap ${item.badge === 'Hot' ? 'bg-red-100 text-red-600' : item.badge === 'Mới' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.badge}
                </span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Khối 3: Thống kê thư viện */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <Star className="absolute -right-4 -top-4 w-32 h-32 text-white opacity-5 transform rotate-12 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">Tổng bài văn</p>
              <p className="text-4xl font-black tracking-tight">5,200+</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <TrendingUp className="w-6 h-6 text-blue-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div>
              <p className="text-blue-200 text-xs font-medium mb-1">Học sinh</p>
              <p className="font-extrabold text-lg">15K+</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs font-medium mb-1">Lượt đọc</p>
              <p className="font-extrabold text-lg">200K+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Khối 4: Thử Thách Tuần Này */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md mb-4 border border-white/30 shadow-inner">
            <Trophy className="w-6 h-6 text-yellow-300" />
          </div>
          <h3 className="text-xl font-extrabold mb-2 tracking-tight">Thử Thách Tuần Này</h3>
          <p className="text-indigo-50 text-sm mb-6 leading-relaxed font-medium">
            Viết một đoạn văn (khoảng 200 chữ) miêu tả cảm xúc của em trong ngày khai trường. Bài viết xuất sắc nhất sẽ được vinh danh!
          </p>
          <Link href="/contribute" className="inline-flex items-center justify-center w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
            Tham gia ngay <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Khối 5: Thống kê truy cập thời gian thực (Nằm ở cuối Sidebar) */}
      <VisitorCounter />
      
    </aside>
  )
}