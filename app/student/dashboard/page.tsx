'use client'

import Link from 'next/link'
import { BookOpen, Trophy, Target, ArrowRight, BookMarked, PlayCircle, Clock } from 'lucide-react'

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            V
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Thư Viện Văn Mẫu</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-slate-500 hover:text-blue-600 font-medium transition">Trang chủ</Link>
          <Link href="/" className="text-slate-500 hover:text-blue-600 font-medium transition">Thư viện</Link>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">Học Sinh 01</p>
              <p className="text-xs text-slate-500">Lớp 9</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold border-2 border-indigo-200">
              HS
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg mb-8 flex justify-between items-center relative overflow-hidden">
          {/* Họa tiết trang trí */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 right-32 w-32 h-32 bg-white opacity-10 rounded-full translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Chào mừng trở lại! 👋</h1>
            <p className="text-blue-100 text-lg max-w-lg">Bạn đã hoàn thành <span className="font-bold text-white">80%</span> mục tiêu ôn tập của tuần này. Hãy tiếp tục duy trì phong độ nhé!</p>
          </div>
          <div className="hidden md:flex relative z-10 p-6 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
            <Trophy className="w-20 h-20 text-yellow-300" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-5">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl"><BookOpen className="w-7 h-7" /></div>
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Bài văn đã đọc</p>
              <h3 className="text-3xl font-bold text-slate-800">24</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-5">
            <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl"><Target className="w-7 h-7" /></div>
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Điểm trắc nghiệm TB</p>
              <h3 className="text-3xl font-bold text-slate-800">8.5<span className="text-lg text-slate-400">/10</span></h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-5">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl"><BookMarked className="w-7 h-7" /></div>
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Bài viết đã lưu</p>
              <h3 className="text-3xl font-bold text-slate-800">12</h3>
            </div>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Lộ trình học */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Lộ trình của bạn</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-bold transition">Xem tất cả</button>
            </div>
            
            {/* Lộ trình 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full mb-3 inline-block">Khối 9</span>
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition">Chiến dịch ôn thi Ngữ Văn vào 10</h3>
                  <p className="text-sm text-slate-500">Bao gồm các tác phẩm trọng tâm và nghị luận xã hội.</p>
                </div>
                <span className="text-emerald-600 font-bold text-xl">75%</span>
              </div>
              {/* Thanh tiến độ */}
              <div className="w-full bg-slate-100 rounded-full h-3 mb-5 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full relative" style={{ width: '75%' }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <button className="w-full py-3 flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl font-bold transition duration-300">
                <PlayCircle className="w-5 h-5" /> Tiếp tục học bài: Chiếc lược ngà
              </button>
            </div>
          </div>

          {/* Cột phải: Đề thi & Gợi ý */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Bài tập cần làm</h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="pb-5 border-b border-slate-100">
                <h4 className="text-lg font-bold text-slate-800 mb-1">Trắc nghiệm: Đồng chí</h4>
                <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                   <Clock className="w-4 h-4" /> 15 phút • 10 câu hỏi
                </p>
                <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-sm font-bold text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition">
                  Làm bài ngay <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="pt-2">
                <h4 className="text-lg font-bold text-slate-800 mb-1">Kiểm tra 1 tiết Lớp 9</h4>
                <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                   <Clock className="w-4 h-4" /> 45 phút • Tổng hợp
                </p>
                <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-sm font-bold text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition">
                  Làm bài ngay <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}