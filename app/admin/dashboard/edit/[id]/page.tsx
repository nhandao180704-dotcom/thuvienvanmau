'use client'

import { useParams } from 'next/navigation'
import EssayForm from '@/components/EssayForm'

export default function EditEssayPage() {
  const { id } = useParams() as { id: string }

  // Việc bảo mật và kiểm tra quyền admin đã được xử lý tự động ở app/admin/layout.tsx
  return <EssayForm essayId={id} />
}