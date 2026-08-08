'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, BookOpen, HelpCircle } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') // Lấy giá trị tab hiện tại trên URL

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      // Dashboard mặc định sáng khi không có tab nào được chọn cụ thể
      isActive: pathname === '/admin/dashboard' && !tab,
    },
    {
      label: 'Quản lý bài viết',
      href: '/admin/dashboard?tab=essays',
      icon: FileText,
      // Sáng lên khi ở tab essays
      isActive: pathname === '/admin/dashboard' && tab === 'essays',
    },
    {
      label: 'Quản lý đề thi',
      href: '/admin/dashboard?tab=quizzes',
      icon: HelpCircle,
      // Sáng lên khi ở tab quizzes
      isActive: pathname === '/admin/dashboard' && tab === 'quizzes',
    },
    {
      label: 'Cài đặt hệ thống',
      href: '/admin/settings',
      icon: Settings,
      // Sáng lên khi ở trang settings
      isActive: pathname.startsWith('/admin/settings'),
    },
  ]

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-200">
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

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon
          
          return (
            <Link
              key={`${item.href}-${idx}`}
              href={item.href}
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
  )
}