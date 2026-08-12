import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "Chưa cấu hình GEMINI_API_KEY trên môi trường." }, { status: 500 });
    }

    // Khởi tạo SDK chính thức của Google
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết, chuyên môn cao. Nhiệm vụ của bạn là hỗ trợ học sinh cấp 2 phân tích tác phẩm, lập dàn ý, và ôn thi vào lớp 10. Luôn xưng hô là 'Cô/Thầy' hoặc 'Trợ lý' và gọi người dùng là 'bạn' hoặc 'em'. Hãy trả lời thân thiện, dễ hiểu, có cảm xúc. Hướng dẫn học sinh cách làm bài thay vì chỉ đưa ra bài văn mẫu giải sẵn."
    });

    const formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const latestMessage = messages[messages.length - 1]?.content || "";

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    return Response.json({ text: responseText });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ error: error.message || "Lỗi hệ thống từ server AI" }, { status: 500 });
  }
}