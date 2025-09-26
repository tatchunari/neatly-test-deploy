import { VertexAI } from "@google-cloud/vertexai";

const vertex = new VertexAI({
  project: process.env.GCLOUD_PROJECT_ID!,
  location: process.env.GCLOUD_LOCATION!,
});

const model = vertex.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function chatWithGemini(question: string, conversationHistory?: any[], context?: string) {
  let historyContext = '';
  
  if (conversationHistory && conversationHistory.length > 0) {
    // ส่งแค่ 3 ข้อความล่าสุด
    const recentHistory = conversationHistory.slice(-3);
    recentHistory.forEach((msg: any) => {
      const role = msg.is_bot ? 'พนักงาน' : 'ลูกค้า';
      historyContext += `${role}: ${msg.message}\n`;
    });
  } else {
    historyContext = "(ไม่มีข้อมูลเพิ่มเติม)";
  }

  const prompt = `
  - คุณคือพนักงานหญิงโรงแรม Neatly
  - ตอบคำถามด้วยภาษาที่ผู้ใช้ใช้ในข้อความล่าสุด
  - ตอบอย่างเป็นมิตรและมืออาชีพ
  - ตอบทุกคำถาม
  - ตอบสั้น ๆ
  - ดูประวัติการสนทนาเพื่อเข้าใจบริบท

  ${context ? `Context: ${context}\n` : ''}
  
  ประวัติการสนทนา:
  ${historyContext}

  Question: ${question}
  `;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ]
  });
  return result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}