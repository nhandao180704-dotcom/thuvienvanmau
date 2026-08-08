'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EssayForm from '@/components/EssayForm'

export default function NewEssayPage() {
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/admin/login')
    }
  }, [router])

  return <EssayForm />
}
