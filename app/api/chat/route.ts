import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Thêm "as string" để báo cho TypeScript biết API Key chắc chắn tồn tại
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });

    // 2. Nhận tin nhắn từ Client
    const { messages } = await req.json();

    // 3. Gọi model và truyền hướng dẫn đóng vai
    const result = await streamText({
      model: google('gemini-1.5-flash'), // Có thể đổi thành gemini-3.6-flash nếu muốn
      system: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết, chuyên môn cao. Nhiệm vụ của bạn là hỗ trợ học sinh cấp 2 phân tích tác phẩm, lập dàn ý, và ôn thi vào lớp 10. Luôn xưng hô là 'Cô/Thầy' hoặc 'Trợ lý' và gọi người dùng là 'bạn' hoặc 'em'. Hãy trả lời thân thiện, dễ hiểu, có cảm xúc. Hướng dẫn học sinh cách làm bài thay vì chỉ đưa ra bài văn mẫu giải sẵn.",
      messages,
    });

    // 4. Dùng toTextStreamResponse() để đảm bảo tương thích mọi phiên bản thư viện AI
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Lỗi hệ thống", { status: 500 });
  }
}