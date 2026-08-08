import { Mail, Shield, Calendar } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Thông tin cá nhân</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            HT
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Hà Thị Thanh</h2>
            <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium text-sm">
              <Shield className="w-4 h-4 text-blue-500" /> Quản trị viên hệ thống (Super Admin)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100">
              <Mail className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Email quản trị</p>
              <p className="font-semibold text-slate-800">admin@gmail.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100">
              <Calendar className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Ngày tham gia hệ thống</p>
              <p className="font-semibold text-slate-800">Tháng 8, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}