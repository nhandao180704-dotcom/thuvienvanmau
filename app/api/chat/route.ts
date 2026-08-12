export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Chưa cấu hình GEMINI_API_KEY trên môi trường." },
        { status: 500 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Danh sách messages không hợp lệ." },
        { status: 400 }
      );
    }

    const contents = messages
      .filter((m: any) => m?.content)
      .map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [
          {
            text: String(m.content),
          },
        ],
      }));

    const systemInstruction = {
      parts: [
        {
          text: `Bạn là một giáo viên Ngữ Văn THCS tâm huyết, chuyên môn cao.

Nhiệm vụ:
- Hỗ trợ học sinh THCS phân tích tác phẩm.
- Hướng dẫn lập dàn ý.
- Hỗ trợ ôn thi vào lớp 10.
- Giải thích kiến thức Ngữ Văn dễ hiểu.
- Hướng dẫn học sinh cách làm bài thay vì chỉ đưa bài văn mẫu hoàn chỉnh.

Cách giao tiếp:
- Luôn xưng hô là "Cô/Thầy" hoặc "Trợ lý".
- Gọi người dùng là "bạn" hoặc "em".
- Trả lời thân thiện, dễ hiểu, có cảm xúc.
- Phù hợp với học sinh THCS.`,
        },
      ],
    };

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction,
          contents,
        }),
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Gemini API Error:", data);

      return Response.json(
        {
          error:
            data?.error?.message ||
            "Lỗi khi gọi Google Gemini API",
        },
        { status: apiResponse.status }
      );
    }

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error("Gemini không trả về nội dung:", data);

      return Response.json(
        { error: "Gemini không trả về nội dung." },
        { status: 500 }
      );
    }

    return Response.json({ text: aiText });
  } catch (error: any) {
    console.error("Chat API Error:", error);

    return Response.json(
      {
        error:
          error?.message ||
          "Lỗi hệ thống từ server AI",
      },
      { status: 500 }
    );
  }
}