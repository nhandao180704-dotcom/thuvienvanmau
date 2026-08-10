'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Nếu chưa đăng nhập HOẶC không phải là email admin thì "đá" về trang /login
      if (!session || session.user.email !== 'admin@thuvien.edu.vn') {
        router.push('/login')
      } else {
        setIsAuthorized(true)
      }
    }

    checkAdmin()
  }, [router, pathname]) // Kiểm tra lại mỗi khi chuyển trang trong khu vực admin

  // Hiển thị vòng xoay loading trong lúc kiểm tra quyền, tránh lộ giao diện admin
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Nếu là Admin xịn thì cho phép hiển thị nội dung trang
  return <>{children}</>
}