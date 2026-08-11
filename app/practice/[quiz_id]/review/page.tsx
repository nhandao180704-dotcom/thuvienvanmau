'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ReviewQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Về Lịch sử làm bài
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Xem lại kết quả</h1>
          </div>
          
          <p className="text-slate-500 mb-8 ml-13">Mã đề thi: {params.id}</p>

          <div className="p-5 bg-blue-50 text-blue-800 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-lg mb-2">Trang xem lại đã hoạt động bình thường! 🎉</h3>
            <p className="text-sm">
              Bạn có thể bấm nút quay lại ở trên để về trang lịch sử bất cứ lúc nào.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}