'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function VisitorCounter() {
  const [onlineCount, setOnlineCount] = useState(1)

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: Math.random().toString(),
        },
      },
    })

    // Đăng ký lắng nghe sự kiện TRƯỚC khi gọi subscribe
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const totalOnline = Object.keys(state).length
        setOnlineCount(totalOnline > 0 ? totalOnline : 1)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">
        THỐNG KÊ TRUY CẬP
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-slate-500 font-bold">
          <Users className="w-5 h-5 text-blue-500 animate-pulse" />
          <span>Đang truy cập</span>
        </div>
        <div className="px-4 py-1.5 bg-blue-500 text-white font-black text-lg rounded-xl shadow-md shadow-blue-500/30">
          {onlineCount}
        </div>
      </div>
    </div>
  )
}