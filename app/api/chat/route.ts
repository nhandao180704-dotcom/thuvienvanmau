import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Chưa cấu hình OPENAI_API_KEY." }, { status: 500 });
    }

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    // Sử dụng ChatGPT (gpt-4o-mini) thay cho Gemini
    const { text } = await generateText({
      model: openai('gpt-4o-mini'), 
      system: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết, chuyên môn cao. Nhiệm vụ của bạn là hỗ trợ học sinh cấp 2 phân tích tác phẩm, lập dàn ý, và ôn thi vào lớp 10. Luôn xưng hô là 'Cô/Thầy' hoặc 'Trợ lý' và gọi người dùng là 'bạn' hoặc 'em'. Hãy trả lời thân thiện, dễ hiểu, có cảm xúc. Hướng dẫn học sinh cách làm bài thay vì chỉ đưa ra bài văn mẫu giải sẵn.",
      messages: formattedMessages,
    });

    return Response.json({ text });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return Response.json({ error: error.message || "Lỗi kết nối đến ChatGPT" }, { status: 500 });
  }
}