export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "Chưa cấu hình khóa API." }, { status: 500 });
    }

    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // CÚ PHÁP QUYẾT ĐỊNH: Dùng "gemini-1.5-flash-latest" trên "v1beta"
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết. Hướng dẫn học sinh cấp 2 phân tích tác phẩm, lập dàn ý. Luôn xưng hô là 'Cô/Thầy' hoặc 'Trợ lý' và gọi người dùng là 'bạn' hoặc 'em'. Hãy trả lời thân thiện, dễ hiểu." }]
        }
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
        console.error("Chi tiết lỗi từ Google:", data);
        throw new Error(data.error?.message || "Lỗi từ Google API");
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";

    return Response.json({ text: aiText });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ error: error.message || "Lỗi hệ thống từ server AI" }, { status: 500 });
  }
}