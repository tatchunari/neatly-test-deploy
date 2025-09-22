import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const prompt = `
    Context:
    ${context || "(ไม่มีข้อมูลเพิ่มเติม)"}

    Question: ${question}
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error("Gemini error:", err);
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
