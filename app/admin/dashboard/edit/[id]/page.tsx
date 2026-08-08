'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import EssayForm from '@/components/EssayForm'

export default function EditEssayPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/admin/login')
    }
  }, [router])

  return <EssayForm essayId={id} />
}
