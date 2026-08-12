import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Khởi tạo SDK kết nối với biến môi trường GEMINI_API_KEY trên Vercel của bạn
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });

    // 2. Chuyển đổi lịch sử tin nhắn sang định dạng chuẩn của SDK
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    // 3. Sử dụng generateText thay vì fetch thủ công. 
    // SDK sẽ tự động đàm phán endpoint chính xác nhất với Google.
    const { text } = await generateText({
      model: google('gemini-1.5-flash'), 
      system: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết, chuyên môn cao. Nhiệm vụ của bạn là hỗ trợ học sinh cấp 2 phân tích tác phẩm, lập dàn ý, và ôn thi vào lớp 10. Luôn xưng hô là 'Cô/Thầy' hoặc 'Trợ lý' và gọi người dùng là 'bạn' hoặc 'em'. Hãy trả lời thân thiện, dễ hiểu, có cảm xúc. Hướng dẫn học sinh cách làm bài thay vì chỉ đưa ra bài văn mẫu giải sẵn.",
      messages: formattedMessages,
    });

    // 4. Trả kết quả về cho frontend
    return Response.json({ text });
  } catch (error: any) {
    console.error("Lỗi Vercel AI SDK:", error);
    return Response.json({ error: error.message || "Lỗi hệ thống từ server AI" }, { status: 500 });
  }
}