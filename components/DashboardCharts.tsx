'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'

// Dữ liệu mẫu hiển thị siêu mượt (Sau này bạn có thể fetch từ Supabase vào đây)
const trafficData = [
  { name: 'T2', views: 120 },
  { name: 'T3', views: 200 },
  { name: 'T4', views: 150 },
  { name: 'T5', views: 280 },
  { name: 'T6', views: 350 },
  { name: 'T7', views: 400 },
  { name: 'CN', views: 595 },
]

const distributionData = [
  { name: 'Lớp 6', count: 4, color: '#8b5cf6' }, // Tím nhạt
  { name: 'Lớp 7', count: 3, color: '#a855f7' }, // Tím
  { name: 'Lớp 8', count: 5, color: '#d946ef' }, // Hồng tím
  { name: 'Lớp 9', count: 8, color: '#ec4899' }, // Hồng
]

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
      
      {/* Biểu đồ Lưu lượng (Area Chart) */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500 group">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={20} />
              Lưu lượng truy cập (Tuần)
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">Lượt xem bài viết 7 ngày qua</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', color: '#1e293b' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ Phân bổ (Bar Chart) */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500 group">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <BarChart3 className="text-purple-500" size={20} />
              Phân bổ Bài viết theo Khối
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">Số lượng bài viết đã soạn mỗi khối</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={45}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" radius={[12, 12, 12, 12]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity duration-300" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}