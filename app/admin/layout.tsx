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
      
      // Kiểm tra email cứng làm Admin
      if (!session || session.user.email !== 'admin@thuvien.edu.vn') {
        router.replace('/login') // Thay 'push' bằng 'replace' để không kẹt lịch sử trình duyệt
      } else {
        setIsAuthorized(true)
      }
    }

    checkAdmin()
  }, [router, pathname]) 

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}