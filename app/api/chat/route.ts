export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Lỗi: GEMINI_API_KEY chưa được cấu hình.");
      return Response.json({ error: "Chưa cấu hình khóa API." }, { status: 500 });
    }

    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const systemInstruction = {
      parts: [{ text: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết, chuyên môn cao. Nhiệm vụ của bạn là hỗ trợ học sinh cấp 2 phân tích tác phẩm, lập dàn ý, và ôn thi vào lớp 10. Luôn xưng hô là 'Cô/Thầy' hoặc 'Trợ lý' và gọi người dùng là 'bạn' hoặc 'em'. Hãy trả lời thân thiện, dễ hiểu, có cảm xúc. Hướng dẫn học sinh cách làm bài thay vì chỉ đưa ra bài văn mẫu giải sẵn." }]
    };

    // Sử dụng model gemini-1.5-pro với endpoint v1
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction,
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
        console.error("Lỗi từ Google API:", data);
        throw new Error(data.error?.message || "Lỗi khi gọi Google Gemini API");
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";

    return Response.json({ text: aiText });
  } catch (error: any) {
    console.error("Chat API Error - Backend:", error);
    return Response.json({ error: error.message || "Lỗi hệ thống từ server AI" }, { status: 500 });
  }
}