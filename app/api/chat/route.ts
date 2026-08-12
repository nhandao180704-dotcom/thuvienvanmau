import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Bắt buộc Vercel luôn chạy code này trên server (tắt Cache)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Nếu vẫn không có key, báo lỗi rõ ràng để dễ nhận biết
    if (!apiKey) {
      return NextResponse.json({ reply: "Lỗi cấu hình: Vercel không tìm thấy GEMINI_API_KEY." }, { status: 500 });
    }

    const { message, history } = await req.json();
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest", 
      systemInstruction: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết, chuyên môn cao. Nhiệm vụ của bạn là hỗ trợ học sinh cấp 2 phân tích tác phẩm, lập dàn ý, và ôn thi vào lớp 10. Luôn xưng hô là 'Cô/Thầy' hoặc 'Trợ lý' và gọi người dùng là 'bạn' hoặc 'em'. Hãy trả lời thân thiện, dễ hiểu, có cảm xúc. Hướng dẫn học sinh cách làm bài thay vì chỉ đưa ra bài văn mẫu giải sẵn."
    });

    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;

    return NextResponse.json({ reply: response.text() });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "Xin lỗi, hệ thống AI đang quá tải hoặc Key không hợp lệ. Vui lòng thử lại sau!" }, { status: 500 });
  }
}