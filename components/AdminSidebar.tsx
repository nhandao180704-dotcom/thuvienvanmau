'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, BookOpen, HelpCircle, Menu, X, Database } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()

  // Trạng thái đóng/mở menu trên mobile
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, isActive: pathname === '/admin/dashboard' },
    { label: 'Quản lý bài viết', href: '/admin/essays', icon: FileText, isActive: pathname.startsWith('/admin/essays') },
    { label: 'Ngân hàng câu hỏi', href: '/admin/question-bank', icon: Database, isActive: pathname.startsWith('/admin/question-bank') },
    { label: 'Quản lý đề thi', href: '/admin/quizzes', icon: HelpCircle, isActive: pathname.startsWith('/admin/quizzes') },
    { label: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings, isActive: pathname.startsWith('/admin/settings') },
  ]

  return (
    <>
      {/* NÚT HAMBURGER (Hiển thị trên Mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-4 z-[70] bg-white text-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
      >
        {isOpen ? <X size={24} className="text-red-600" /> : <Menu size={24} className="text-blue-600" />}
      </button>

      {/* LỚP PHỦ ĐEN MỜ (Trên Mobile) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* THANH MENU BÊN TRÁI */}
      <aside 
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Phần Logo Thư Viện (Đã bọc Link dẫn về Dashboard và có hiệu ứng hover) */}
        <Link 
          href="/admin/dashboard"
          onClick={() => setIsOpen(false)}
          className="px-6 py-8 md:py-6 pt-16 md:pt-6 border-b border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0052CC] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#0052CC] leading-tight transition-colors">Thư Viện</h2>
            <p className="text-sm font-medium text-slate-500 leading-tight mt-0.5">Admin</p>
          </div>
        </Link>

        {/* Danh sách Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link
                key={`${item.href}-${idx}`}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 overflow-hidden ${
                  item.isActive
                    ? 'bg-[#F0F5FF] text-[#0052CC]' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {/* Đường viền xanh bo tròn góc bên trái cho Tab đang chọn */}
                {item.isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0052CC] rounded-r-md" />
                )}
                
                <Icon size={20} className={item.isActive ? 'text-[#0052CC]' : 'text-slate-500'} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}