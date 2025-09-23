import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  - คุณคือพนักงานโรงแรม Neatly
  - ตอบคำถามด้วยภาษาที่ถามอย่างเป็นมิตรและมืออาชีพ
  - ตอบทุกคำถาม
  - ตอบสั้น ๆ
  - ดูประวัติการสนทนาเพื่อเข้าใจบริบท

  ${context ? `Context: ${context}\n` : ''}
  
  ประวัติการสนทนา:
  ${historyContext}

  Question: ${question}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}