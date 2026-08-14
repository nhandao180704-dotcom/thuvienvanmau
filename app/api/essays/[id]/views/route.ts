import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Khởi tạo Supabase client dùng chung cho API (không cần dính dáng đến Cookie để tăng tốc độ phản hồi)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const essayId = params.id

    // 1. Lấy số lượt xem hiện tại của bài viết
    const { data: essay, error: fetchError } = await supabase
      .from('essays')
      .select('views')
      .eq('id', essayId)
      .single()

    if (fetchError) throw fetchError

    // 2. Cộng dồn 1 đơn vị
    const newViews = (essay.views || 0) + 1

    // 3. Cập nhật lại vào Database
    const { error: updateError } = await supabase
      .from('essays')
      .update({ views: newViews })
      .eq('id', essayId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, views: newViews })
  } catch (error: any) {
    console.error("Lỗi cập nhật view:", error)
    return NextResponse.json(
      { success: false, message: 'Không thể cập nhật lượt xem' }, 
      { status: 500 }
    )
  }
}