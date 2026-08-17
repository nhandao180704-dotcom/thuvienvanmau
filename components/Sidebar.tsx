'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Zap, BookOpen, ChevronRight, TrendingUp, Trophy, ArrowRight, PenTool, LayoutDashboard } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import VisitorCounter from '@/components/VisitorCounter'

export default function Sidebar() {
  const [hotEssays, setHotEssays] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchHotEssays = async () => {
      try {
        const { data } = await supabase
          .from('essays')
          .select('id, title, genre, grade, views')
          .order('views', { ascending: false })
          .limit(4)
        
        if (data && data.length > 0) {
          setHotEssays(data)
        }
      } catch (error) {
        console.error('Lỗi tải bài hot:', error)
      }
    }

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

  // ĐÃ TỐI ƯU: Đa dạng hóa các mục ôn tập cho toàn khối THCS
  const examPrepItems = [
    { id: 1, title: 'Ôn thi trắc nghiệm', badge: 'Hot', href: '/practice' },
    { id: 2, title: 'Các mẫu lập dàn ý chi tiết', badge: 'Mới', href: '/category/dan-y' },
    { id: 3, title: 'Đề thi thử & Đề minh họa', badge: 'Quan trọng', href: '/category/de-thi-thu' },
    { id: 4, title: 'Bí kíp đạt điểm cao môn Văn', badge: 'Hay', href: '/category/bi-kip' },
  ]

  return (
    <aside className="space-y-6 sm:space-y-8">
      
      {/* KHỐI QUẢN TRỊ */}
      {isAdmin && (
        <div className="bg-white rounded-[24px] border border-blue-100 shadow-lg shadow-blue-900/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900 p-5 flex items-center gap-3 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="p-2.5 bg-blue-500/20 rounded-xl relative z-10 border border-blue-500/30">
              <LayoutDashboard size={20} className="text-blue-400" />
            </div>
            <div className="relative z-10">
              <h3 className="font-extrabold text-lg tracking-tight">Khu vực Quản trị</h3>
              <p className="text-xs text-blue-200 font-medium mt-0.5">Dành riêng cho Admin</p>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <Link href="/admin/dashboard" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold transition-all">
              <div className="p-2 bg-slate-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                <LayoutDashboard size={16} className="text-slate-500 group-hover:text-blue-600" />
              </div>
              <span className="group-hover:translate-x-1 transition-transform">Tổng quan (Dashboard)</span>
            </Link>
            <Link href="/admin/essays" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold transition-all">
              <div className="p-2 bg-slate-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                <PenTool size={16} className="text-slate-500 group-hover:text-blue-600" />
              </div>
              <span className="group-hover:translate-x-1 transition-transform">Quản lý bài viết</span>
            </Link>
          </div>
        </div>
      )}

      {/* Khối Hot Tuần Này */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
        <div className="bg-slate-900 p-5 flex items-center gap-3 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 relative z-10">
            <Zap size={20} className="text-yellow-400 animate-pulse" />
          </div>
          <div className="relative z-10">
            <h3 className="font-extrabold text-lg tracking-tight">Hot Tuần Này</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Được đọc nhiều nhất</p>
          </div>
        </div>
        <div className="p-3">
          {hotEssays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-50">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-bold text-slate-500">Đang tải...</p>
            </div>
          ) : (
            hotEssays.map((item, index) => (
              <Link key={item.id} href={`/essay/${item.id}`} className="group flex gap-4 p-3 hover:bg-blue-50/50 rounded-2xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-50 group-hover:from-blue-500 group-hover:to-indigo-600 text-slate-400 group-hover:text-white rounded-xl flex items-center justify-center font-black text-base shrink-0 transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-blue-500/30">
                  0{index + 1}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">{item.title}</p>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 group-hover:text-blue-500/70 transition-colors">
                    {item.genre || 'Văn mẫu'} • {item.grade || 'THCS'}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Khối Góc Ôn Thi */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-100 transition-all duration-500 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 flex items-center gap-3 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
          <div className="p-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl relative z-10">
            <BookOpen size={20} className="text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="font-extrabold text-lg tracking-tight">Góc Ôn Thi Ngữ Văn</h3>
            <p className="text-xs text-orange-100 font-medium mt-0.5">Hệ thống toàn diện cấp THCS</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {examPrepItems.map((item) => (
            <Link key={item.id} href={item.href} className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
              <p className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors line-clamp-2 flex-1 pr-2">{item.title}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg whitespace-nowrap shadow-sm ${item.badge === 'Hot' ? 'bg-red-100 text-red-600' : item.badge === 'Mới' ? 'bg-emerald-100 text-emerald-700' : item.badge === 'Quan trọng' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.badge}
                </span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Thống kê thư viện */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[24px] p-6 md:p-7 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
        <Star className="absolute -right-4 -top-4 w-32 h-32 text-white opacity-5 transform rotate-12 group-hover:rotate-45 group-hover:scale-110 transition-all duration-700 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/50 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Tổng bài văn</p>
              <p className="text-4xl font-black tracking-tight drop-shadow-md">5,200+</p>
            </div>
            <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm bg-black/10 p-4.5 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="p-2">
              <p className="text-blue-200 text-[11px] font-bold uppercase tracking-wider mb-1">Học sinh</p>
              <p className="font-black text-xl tracking-tight">15K+</p>
            </div>
            <div className="p-2 border-l border-white/10">
              <p className="text-blue-200 text-[11px] font-bold uppercase tracking-wider mb-1">Lượt đọc</p>
              <p className="font-black text-xl tracking-tight">200K+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thử Thách Tuần Này */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-[24px] p-6 md:p-7 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md mb-5 border border-white/30 shadow-inner">
            <Trophy className="w-7 h-7 text-yellow-300 animate-[bounce_3s_infinite]" />
          </div>
          <h3 className="text-2xl font-black mb-3 tracking-tight">Thử Thách Tuần Này</h3>
          <p className="text-purple-50 text-sm mb-7 leading-relaxed font-medium">
            Viết một đoạn văn (khoảng 200 chữ) miêu tả cảm xúc của em trong ngày khai trường. Bài viết xuất sắc nhất sẽ được vinh danh!
          </p>
          <Link href="/contribute" className="group/btn inline-flex items-center justify-center w-full bg-white text-purple-700 font-black py-3.5 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Tham gia ngay <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <VisitorCounter />
    </aside>
  )
}