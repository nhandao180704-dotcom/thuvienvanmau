import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "Hệ thống chưa được cấu hình API Key." }, { status: 500 });
    }

    const { message, history } = await req.json();
    
    // Khởi tạo Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // Thiết lập "Nhân cách" cho AI để phù hợp với App Văn Mẫu
      systemInstruction: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết, chuyên môn cao. Nhiệm vụ của bạn là hỗ trợ học sinh cấp 2 phân tích tác phẩm, lập dàn ý, và ôn thi vào lớp 10. Luôn xưng hô là 'Cô/Thầy' hoặc 'Trợ lý' và gọi người dùng là 'bạn' hoặc 'em'. Hãy trả lời thân thiện, dễ hiểu, có cảm xúc. Hướng dẫn học sinh cách làm bài thay vì chỉ đưa ra bài văn mẫu giải sẵn."
    });

    // Chuyển đổi lịch sử chat sang định dạng của Gemini
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Bắt đầu phiên chat
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;

    return NextResponse.json({ reply: response.text() });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "Xin lỗi, hệ thống AI đang bảo trì hoặc quá tải. Vui lòng thử lại sau ít phút nhé!" }, { status: 500 });
  }
}