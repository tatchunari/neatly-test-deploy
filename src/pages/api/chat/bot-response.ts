import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { chatWithGemini } from '@/lib/chat';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { sessionId, userMessage } = req.body;

    if (!sessionId || !userMessage) {
      return res.status(400).json({ error: 'Session ID and user message are required' });
    }

    // Generate immediate response first (for fast UI feedback)
    let botResponse = '';
    
    // Quick response for first message or simple queries
    if (userMessage.toLowerCase().includes('สวัสดี') || userMessage.toLowerCase().includes('hello')) {
      botResponse = 'สวัสดีครับ! ยินดีต้อนรับสู่โรงแรม Neatly ครับ มีอะไรให้ช่วยเหลือไหมครับ?';
    } else if (userMessage.toLowerCase().includes('ห้อง') || userMessage.toLowerCase().includes('room')) {
      botResponse = 'เรามีห้องพักหลากหลายประเภทครับ เช่น Superior, Deluxe, Suite และ Premier Sea View ครับ สนใจห้องประเภทไหนเป็นพิเศษไหมครับ?';
    } else if (userMessage.toLowerCase().includes('ราคา') || userMessage.toLowerCase().includes('price')) {
      botResponse = 'ราคาห้องพักขึ้นอยู่กับประเภทห้องและช่วงเวลา ครับ สามารถดูรายละเอียดและราคาได้ในหน้าจองห้องพักครับ';
    } else if (userMessage.toLowerCase().includes('จอง') || userMessage.toLowerCase().includes('booking')) {
      botResponse = 'สามารถจองห้องพักได้ผ่านเว็บไซต์ของเราเลยครับ หรือโทรมาที่หมายเลข 02-123-4567 ครับ';
    } else {
      // For complex queries, try Gemini AI with timeout
      try {
        const context = `
        - คุณคือพนักงานโรงแรม Neatly
        - ตอบคำถามด้วยภาษาที่ถามอย่างเป็นมิตรและมืออาชีพ
        - ตอบทุกคำถาม
        - ตอบสั้น ๆ
        `;
        
        // Add timeout for Gemini API call (3 seconds)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API timeout')), 3000)
        );
        
        const geminiPromise = chatWithGemini(userMessage, context);
        botResponse = await Promise.race([geminiPromise, timeoutPromise]) as string;
        
      } catch (error) {
        console.log('Gemini API failed, using fallback response:', error);
        botResponse = 'ขอบคุณสำหรับข้อความครับ หากต้องการความช่วยเหลือเพิ่มเติม สามารถโทรมาที่หมายเลข 02-123-4567 หรือส่งอีเมลมาที่ info@neatlyhotel.com ครับ';
      }
    }

    // Save bot response to database with retry mechanism
    let botMessage;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('chatbot_messages')
          .insert({
            session_id: sessionId,
            message: botResponse,
            is_bot: true
          })
          .select()
          .single();

        if (error) {
          console.error(`Error saving bot message (attempt ${retryCount + 1}):`, error);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          continue;
        }

        botMessage = data;
        console.log('Bot response saved successfully:', botMessage);
        break;
        
      } catch (err) {
        console.error(`Database error (attempt ${retryCount + 1}):`, err);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw err;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }


    res.status(201).json({ 
      message: botMessage,
      success: true 
    });

  } catch (error) {
    console.error('Error in bot response:', error);
    res.status(500).json({ 
      error: 'Failed to generate bot response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
