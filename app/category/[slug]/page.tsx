import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ArrowLeft, BookOpen, ArrowRight, Eye, Calendar, PlayCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

// 1. Thêm dòng này ở đầu file để ép Next.js render động khi có yêu cầu, bỏ qua lỗi build tĩnh
export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Xác định tiêu đề và màu sắc nhận diện riêng cho từng danh mục để tránh nhàm chán
  const getCategoryConfig = (currentSlug: string) => {
    switch (currentSlug) {
      case 'on-thi-10': return { title: 'Góc Ôn Thi Vào Lớp 10', style: 'text-orange-600 bg-orange-100' };
      case 'trac-nghiem-10': return { title: 'Phần Trắc Nghiệm Vào Lớp 10', style: 'text-emerald-600 bg-emerald-100' };
      case 'de-thi-10': return { title: 'Đề Thi Mẫu Vào Lớp 10', style: 'text-blue-600 bg-blue-100' };
      case 'bi-kip-10': return { title: 'Bí Kíp Đạt Điểm Cao', style: 'text-purple-600 bg-purple-100' };
      default: return { title: `Danh mục: ${currentSlug.replace(/-/g, ' ')}`, style: 'text-slate-600 bg-slate-100' };
    }
  }

  const config = getCategoryConfig(slug);
  const isQuiz = slug === 'trac-nghiem-10';

  // Tự động kết nối DB lấy danh sách bài đăng hoặc đề thi
  let items: any[] = [];
  try {
    if (isQuiz) {
      const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
      items = data || [];
    } else {
      // Lấy các bài viết thuộc danh mục tương ứng
      const { data } = await supabase.from('essays').select('*').eq('category', slug).order('created_at', { ascending: false });
      items = data || [];
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu chuyên mục:", error);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Nút quay lại bọc Link chuẩn để không bao giờ bị văng sang Login */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8 group">
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Quay lại trang chủ
        </Link>

        {/* Khung Tiêu đề chuyên mục sang trọng */}
        <div className="flex items-center gap-5 mb-10 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-inner ${config.style}`}>
            <BookOpen size={36} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{config.title}</h1>
            <p className="text-slate-500 font-medium mt-2">Khám phá các tài liệu và bài tập hay nhất dành cho bạn</p>
          </div>
        </div>

        {/* Hiển thị Nội Dung */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-5xl shadow-inner">
              📭
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Chưa có tài liệu nào</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              Các tài liệu và đề thi cho chuyên mục này đang được thầy cô tổng hợp. Bạn hãy quay lại sau nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {items.map((item: any) => (
              isQuiz ? (
                /* THẺ HIỂN THỊ ĐỀ THI TRẮC NGHIỆM */
                <Link href={`/quiz/${item.id}`} key={item.id} className="block group h-full">
                  <div className="bg-white h-full rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="mb-4">
                      <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-extrabold border border-emerald-100 tracking-wide uppercase">
                        Lớp {item.grade_level || '10'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-bold text-sm">
                      <span className="flex items-center gap-2"><PlayCircle size={20} /> Bắt đầu làm bài</span>
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                /* THẺ HIỂN THỊ BÀI VĂN/TÀI LIỆU */
                <Link href={`/essay/${item.id}`} key={item.id} className="block group h-full">
                  <div className="bg-white h-full rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                        {item.grade || 'Lớp 9'}
                      </span>
                      <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100 line-clamp-1">
                        {item.genre || 'Tài liệu'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-4 flex-1 line-clamp-3 leading-snug">
                      {item.title}
                    </h3>
                    
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md"><Eye size={14} /> {item.views || 0}</span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md"><Calendar size={14} /> {new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </main>
    </div>
  )
}