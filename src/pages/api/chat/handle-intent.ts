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
    const { intent, userQuestion, conversationHistory } = req.body;

    if (!intent || !userQuestion) {
      return res.status(400).json({ error: 'Intent and user question are required' });
    }

    console.log('🎯 HANDLING INTENT:', { intent, userQuestion });

    let botResponse = '';

    switch (intent) {
      case 'faq':
      case 'other':
        botResponse = await handleFAQIntent(userQuestion, conversationHistory);
        break;
      
      case 'rooms':
        botResponse = await handleRoomsIntent(userQuestion, conversationHistory);
        break;
      
      case 'promo_codes':
        botResponse = await handlePromoCodesIntent(userQuestion, conversationHistory);
        break;
      
      default:
        botResponse = await handleFAQIntent(userQuestion, conversationHistory);
        break;
    }

    console.log('🎯 INTENT HANDLED:', { intent, responseLength: botResponse.length });

    res.status(200).json({ 
      response: botResponse,
      intent: intent
    });

  } catch (error) {
    console.error('Error in handle intent:', error);
    res.status(500).json({ 
      error: 'Failed to handle intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// 4.1 FAQ (ยังไม่เจอใน strict/vector) - Fallback ให้ Gemini ตอบโดยใช้ FAQ context ทั้งหมด
async function handleFAQIntent(userQuestion: string, conversationHistory?: any[]) {
  try {
    console.log('📚 FAQ FALLBACK - Getting all FAQ and context data...');
    
    // ดึง FAQ ทั้งหมดเป็น context
    const { data: allFAQs, error: faqError } = await supabase
      .from('chatbot_faqs')
      .select('question, answer')
      .neq('question', '::greeting::')
      .neq('question', '::fallback::');

    if (faqError) {
      console.error('Error fetching FAQs for context:', faqError);
      throw faqError;
    }

    // ดึง contexts เพิ่มเติม
    const { data: contexts, error: contextError } = await supabase
      .from('chatbot_contexts')
      .select('content')
      .order('created_at', { ascending: true });

    if (contextError) {
      console.error('Error fetching contexts:', contextError);
      // ไม่ throw error เพราะ contexts เป็น optional
    }

    // สร้าง context string จาก FAQ ทั้งหมด
    const faqContext = allFAQs?.map(faq => 
      `Q: ${faq.question}\nA: ${faq.answer}`
    ).join('\n\n') || '';

    // สร้าง context string จาก contexts
    const additionalContext = contexts?.map(ctx => ctx.content).join('\n') || '';

    const faqPrompt = `You are a helpful hotel assistant. Use the following FAQ and additional context to answer the user's question.

FAQ Context:
${faqContext}

Additional Context:
${additionalContext}

User Question: "${userQuestion}"

Answer based on the FAQ and additional context above. If the question doesn't match any FAQ, provide a helpful response or ask for clarification.`;

    const response = await chatWithGemini(faqPrompt, conversationHistory);
    return response;

  } catch (error) {
    console.error('FAQ fallback failed:', error);
    // Fallback to context table
    return await getFallbackContext();
  }
}

// 4.2 Rooms - SQL Generation + Execution + Response Generation
async function handleRoomsIntent(userQuestion: string, conversationHistory?: any[]) {
  try {
    console.log('🏨 ROOMS INTENT - Generating SQL...');
    
    // สร้าง SQL จาก user question
    const roomsSchema = `rooms(id, room_type, price, promotion_price, currency, guests, is_active, room_size, amenities, bed_type, view_type, description, images)`;
    
    const sqlPrompt = `You are a SQL assistant.
Convert the user's question into a SQL query.
Use ONLY the following schema:
${roomsSchema}
User question: "${userQuestion}"
Return only the SQL query.`;

    const sqlResponse = await chatWithGemini(sqlPrompt);
    const sqlQuery = sqlResponse.trim();

    console.log('🏨 GENERATED SQL:', sqlQuery);

    // Execute SQL
    const { data: result, error } = await supabase
      .from('rooms')
      .select('*');

    if (error) {
      console.error('SQL execution error:', error);
      throw error;
    }

    console.log('🏨 SQL RESULT:', result?.length || 0, 'rooms found');

    // Generate response from SQL result
    let responsePrompt = `User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result || [])}
Answer only based on the context.`;

    // Add conversation history context if available
    if (conversationHistory && conversationHistory.length > 0) {
      const historyContext = conversationHistory
        .slice(-5) // Take last 5 messages
        .map(msg => `${msg.is_bot ? 'Bot' : 'User'}: ${msg.message}`)
        .join('\n');
      
      responsePrompt = `Previous conversation:
${historyContext}

Current User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result || [])}
Answer only based on the context and conversation history.`;
    }

    const response = await chatWithGemini(responsePrompt, conversationHistory);
    return response;

  } catch (error) {
    console.error('Rooms intent failed:', error);
    return await getFallbackContext();
  }
}

// 4.3 Promo Codes - เหมือนกับ rooms แต่ใช้ schema promo_codes
async function handlePromoCodesIntent(userQuestion: string, conversationHistory?: any[]) {
  try {
    console.log('🎟️ PROMO CODES INTENT - Generating SQL...');
    
    // สร้าง SQL จาก user question
    const promoSchema = `promo_codes(id, code, discount_percent, discount_amount, expires_at, is_active, usage_limit, used_count, description)`;
    
    const sqlPrompt = `You are a SQL assistant.
Convert the user's question into a SQL query.
Use ONLY the following schema:
${promoSchema}
User question: "${userQuestion}"
Return only the SQL query.`;

    const sqlResponse = await chatWithGemini(sqlPrompt);
    const sqlQuery = sqlResponse.trim();

    console.log('🎟️ GENERATED SQL:', sqlQuery);

    // Execute SQL (ตัวอย่าง query ที่ Gemini อาจสร้าง)
    const { data: result, error } = await supabase
      .from('promo_codes')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .eq('is_active', true);

    if (error) {
      console.error('SQL execution error:', error);
      throw error;
    }

    console.log('🎟️ SQL RESULT:', result?.length || 0, 'promo codes found');

    // Generate response from SQL result
    let responsePrompt = `User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result || [])}
Answer only based on the context.`;

    // Add conversation history context if available
    if (conversationHistory && conversationHistory.length > 0) {
      const historyContext = conversationHistory
        .slice(-5) // Take last 5 messages
        .map(msg => `${msg.is_bot ? 'Bot' : 'User'}: ${msg.message}`)
        .join('\n');
      
      responsePrompt = `Previous conversation:
${historyContext}

Current User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result || [])}
Answer only based on the context and conversation history.`;
    }

    const response = await chatWithGemini(responsePrompt, conversationHistory);
    return response;

  } catch (error) {
    console.error('Promo codes intent failed:', error);
    return await getFallbackContext();
  }
}

// Helper function to get fallback context (จาก chatbot_faqs table)
async function getFallbackContext(): Promise<string> {
  try {
    const { data: fallbackContext, error } = await supabase
      .from('chatbot_faqs')
      .select('answer')
      .eq('question', '::fallback::')
      .single();

    if (!error && fallbackContext) {
      return fallbackContext.answer;
    }

    // Ultimate fallback
    return 'ขอบคุณสำหรับข้อความครับ หากต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อเราได้ครับ';
  } catch (error) {
    console.error('Error getting fallback context:', error);
    return 'ขอบคุณสำหรับข้อความครับ หากต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อเราได้ครับ';
  }
}