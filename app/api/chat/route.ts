import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ reply: "Lỗi cấu hình: Vercel không tìm thấy GEMINI_API_KEY." }, { status: 500 });
    }

    const { message, history } = await req.json();
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Cập nhật model thế hệ mới nhất: gemini-3.6-flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
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
    return NextResponse.json({ reply: "Xin lỗi, hệ thống AI đang bận hoặc quá tải. Vui lòng thử lại sau vài giây!" }, { status: 500 });
  }
}