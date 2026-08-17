'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import AdminSidebar from '@/components/AdminSidebar'
import AdminHeader from '@/components/AdminHeader'
import { Search, Trash2, Loader2, Mail, Shield, User, GraduationCap } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = async () => {
    try {
      // Lưu ý: Đảm bảo bạn có bảng 'profiles' hoặc bảng tương đương lưu thông tin user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setUsers(data)
    } catch (error) {
      console.error("Lỗi tải danh sách học sinh:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${name || 'Học sinh'}"?`)) return

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      
      alert('Đã xóa tài khoản thành công!')
      fetchUsers()
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa.')
    }
  }

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminHeader onSearch={() => {}} />

      <main className="fixed top-16 right-0 left-0 md:left-64 bottom-0 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <GraduationCap className="text-blue-600" size={28} /> Quản lý Học sinh
              </h1>
              <p className="text-slate-500 mt-1 font-medium">Tổng số: {users.length} tài khoản</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <Search className="text-slate-400 w-5 h-5 ml-2" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6">Học sinh</th>
                    <th className="p-4 text-center">Vai trò</th>
                    <th className="p-4 text-center">Ngày tham gia</th>
                    <th className="p-4 pr-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" /></td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">Chưa có dữ liệu học sinh.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="text-slate-800 font-bold">{user.full_name || 'Học sinh ẩn danh'}</p>
                              <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                                <Mail size={12} /> {user.email || 'Chưa cập nhật'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                            {user.role === 'admin' ? <Shield size={12} /> : <GraduationCap size={12} />}
                            {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-500 text-sm">
                          {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button onClick={() => handleDelete(user.id, user.full_name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa tài khoản">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}