export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "Chưa cấu hình GEMINI_API_KEY." }, { status: 500 });
    }

    // 1. TỰ ĐỘNG HỎI GOOGLE DANH SÁCH MODEL ĐƯỢC PHÉP DÙNG
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();

    if (!listRes.ok) {
       throw new Error("Lỗi khi lấy danh sách API: " + (listData.error?.message || "Unknown error"));
    }

    // Lọc ra các model có hỗ trợ nhắn tin (generateContent)
    const validModels = listData.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
        ?.map((m: any) => m.name.split('/')[1]); 

    if (!validModels || validModels.length === 0) {
        throw new Error("Tài khoản của bạn không có quyền truy cập model nào.");
    }

    // Tự động chọn model Flash (ưu tiên) hoặc lấy model đầu tiên trong danh sách
    const selectedModel = validModels.find((m: string) => m.includes("flash")) || validModels[0];

    // 2. GỌI API CHAT BẰNG MODEL VỪA TÌM ĐƯỢC
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const chatRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: "Bạn là một giáo viên Ngữ Văn THCS tâm huyết. Hãy trả lời thân thiện, dễ hiểu, có cảm xúc." }]
        }
      })
    });

    const chatData = await chatRes.json();

    if (!chatRes.ok) {
        throw new Error(`Lỗi với model ${selectedModel}: ` + (chatData.error?.message || "Lỗi vô danh"));
    }

    const aiText = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi.";

    // Trả kết quả kèm theo tên model để bạn biết hệ thống đã tự động chọn cái nào
    return Response.json({ text: `*[Đã tự động kết nối bằng model: ${selectedModel}]*\n\n${aiText}` });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ error: error.message || "Lỗi hệ thống từ server AI" }, { status: 500 });
  }
}