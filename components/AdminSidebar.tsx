'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, BookOpen, HelpCircle, Menu, X } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')

  // Trạng thái đóng/mở menu trên mobile
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, isActive: pathname === '/admin/dashboard' && !tab },
    { label: 'Quản lý bài viết', href: '/admin/dashboard?tab=essays', icon: FileText, isActive: pathname === '/admin/dashboard' && tab === 'essays' },
    { label: 'Quản lý đề thi', href: '/admin/dashboard?tab=quizzes', icon: HelpCircle, isActive: pathname === '/admin/dashboard' && tab === 'quizzes' },
    { label: 'Cài đặt hệ thống', href: '/admin/settings', icon: Settings, isActive: pathname.startsWith('/admin/settings') },
  ]

  return (
    <>
      {/* 1. NÚT HAMBURGER (Góc trên cùng bên trái, ngang hàng thanh tìm kiếm) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-4 z-[70] bg-white text-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
      >
        {isOpen ? <X size={24} className="text-red-600" /> : <Menu size={24} className="text-blue-600" />}
      </button>

      {/* 2. LỚP PHỦ ĐEN MỜ */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 3. THANH MENU BÊN TRÁI (Trượt đè lên trên, không xô đẩy Dashboard) */}
      <div 
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo (Thêm khoảng trống pt-16 để không đè vào nút Tắt) */}
        <div className="px-6 py-6 pt-16 md:pt-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Thư Viện</h2>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link
                key={`${item.href}-${idx}`}
                href={item.href}
                onClick={() => setIsOpen(false)} // Tự đóng khi chọn xong
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  item.isActive
                    ? 'bg-blue-50 text-primary border-l-4 border-primary pl-3'
                    : 'text-foreground hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}