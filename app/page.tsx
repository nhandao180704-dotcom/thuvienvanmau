'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header / Navbar */}
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">📚</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Thư Viện Văn Mẫu</h1>
            <p className="text-xs text-gray-500">THCS</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Lưu trữ cá nhân
          </Link>
          <Link href="/contribute" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            Đóng góp bài
          </Link>
        </div>
      </header>

      {/* Banner Màu Tím - Khám phá kho tàng */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-4">
            ✨ Hệ sinh thái học tập toàn diện
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Khám phá kho tàng <br />
            <span className="text-cyan-300">Văn Mẫu Xuất Sắc</span>
          </h2>
          
          {/* Ô tìm kiếm */}
          <div className="mt-6 flex items-center bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <input
              type="text"
              placeholder="Nhập tên bài văn, tác phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent px-4 py-2 text-white placeholder-white/70 focus:outline-none"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-md">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Nội dung danh sách bài viết bên dưới */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🔥 Bài viết mới nhất
          </h3>
          <span className="text-sm text-gray-500">Tìm thấy 4 bài</span>
        </div>

        {/* Danh sách các khối lớp */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm">Tất cả</button>
          <button className="bg-white text-gray-600 px-4 py-2 rounded-xl font-medium border hover:bg-gray-100">Lớp 6</button>
          <button className="bg-white text-gray-600 px-4 py-2 rounded-xl font-medium border hover:bg-gray-100">Lớp 7</button>
          <button className="bg-white text-gray-600 px-4 py-2 rounded-xl font-medium border hover:bg-gray-100">Lớp 8</button>
          <button className="bg-white text-gray-600 px-4 py-2 rounded-xl font-medium border hover:bg-gray-100">Lớp 9</button>
        </div>

        {/* Lưới bài viết mẫu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition">
            <div className="flex gap-2 mb-3">
              <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-semibold">LỚP 9</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md">Văn nghị luận</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Phân tích vẻ đẹp khuất lấp của nhân vật Phương Định...</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-4">(Đoạn mở bài mẫu) "Những ngôi sao xa xôi" của Lê Minh Khuê đã khắc họa thành công...</p>
            <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
              <span>👁️ 4</span>
              <span>📅 8/8/2026</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition">
            <div className="flex gap-2 mb-3">
              <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-semibold">LỚP 7</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md">Văn biểu cảm</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Cảm nghĩ về người mẹ thân yêu của em</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-4">Mẹ là người đã sinh ra và nuôi dưỡng em khôn lớn. Trong ánh mắt mẹ luôn ánh lên sự dịu dàng...</p>
            <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
              <span>👁️ 152</span>
              <span>📅 8/8/2026</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}