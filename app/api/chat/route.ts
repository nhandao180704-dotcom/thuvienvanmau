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
    
    // Khởi tạo model gemini-pro thuần túy, tuyệt đối KHÔNG chứa systemInstruction để tránh lỗi 404
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro" 
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