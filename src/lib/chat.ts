import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function chatWithGemini(question: string, context?: string) {
  const prompt = `
  Context:
  ${context || "(ไม่มีข้อมูลเพิ่มเติม)"}

  Question: ${question}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
