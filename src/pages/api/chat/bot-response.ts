import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { chatWithGemini } from '@/lib/chat';
import { createEmbedding } from '@/lib/embedding';

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

    // 1. Strict match: JOIN chatbot_faqs + chatbot_faq_aliases
    let botResponse = '';
    try {
      const normalize = (s: string) => s.trim().toLowerCase().replace(/[^\w\s]/g, '');
      const userQuery = normalize(userMessage);
      console.log('🔍 STRICT MATCH DEBUG:', { userQuery, originalMessage: userMessage });

      // Check FAQ questions first
      const { data: faqMatches, error: faqError } = await supabase
        .from('chatbot_faqs')
        .select('question, answer')
        .neq('question', '::greeting::')
        .neq('question', '::fallback::');

      if (!faqError && faqMatches) {
        for (const faq of faqMatches) {
          if (userQuery === normalize(faq.question)) {
            botResponse = faq.answer;
            break;
          }
        }
      }

      // If no FAQ match, check aliases
      if (!botResponse) {
        const { data: aliasMatches, error: aliasError } = await supabase
          .from('chatbot_faq_aliases')
          .select('alias, faq_id');

        if (!aliasError && aliasMatches) {
          console.log('🔍 ALIASES DEBUG:', aliasMatches.map(a => ({
            alias: a.alias,
            normalized: normalize(a.alias),
            faq_id: a.faq_id
          })));

          for (const aliasMatch of aliasMatches) {
            if (userQuery === normalize(aliasMatch.alias)) {
              // Get FAQ answer by faq_id
              const { data: faqData } = await supabase
                .from('chatbot_faqs')
                .select('answer')
                .eq('id', aliasMatch.faq_id)
                .single();

              if (faqData?.answer) {
                botResponse = faqData.answer;
                break;
              }
            }
          }
        }
      }

      if (botResponse) {
        console.log('✅ STRICT MATCH found:', botResponse);
      } else {
        // 2. Vector search: JOIN chatbot_faqs + chatbot_faq_aliases
        try {
          const queryEmbedding = await createEmbedding(userMessage);

          const { data: matches, error: rpcError } = await supabase
            .rpc('match_faqs_with_aliases', {
              query_embedding: queryEmbedding,
              match_threshold: 0.6,
              match_count: 5
            });

          if (rpcError) {
            console.error('Vector search error:', rpcError);
          } else if (matches && matches.length > 0) {
            const bestMatch = matches[0];
            botResponse = bestMatch.answer;
            console.log('🔍 VECTOR MATCH found:', {
              source: bestMatch.source,
              similarity: bestMatch.similarity,
              answer: bestMatch.answer
            });
          }
        } catch (err) {
          console.error('Vector RPC search failed, using fallback:', err);
          const { data: fallbackFaqs } = await supabase
            .from('chatbot_faqs')
            .select('question,answer')
            .eq('question', '::fallback::');
          const fallbackMsg = (fallbackFaqs && fallbackFaqs[0]?.answer)
            || 'ขอบคุณสำหรับข้อความครับ หากต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อเราได้ครับ';
          botResponse = fallbackMsg;
          console.log('⚠️ FALLBACK MESSAGE:', fallbackMsg);
        }
      }
    } catch (error) {
      console.error('Error during strict FAQ matching:', error);
    }

    // 3. AI chat by context (if no FAQ/alias match found)
    if (!botResponse) {
      try {
        console.log('🤖 Using Gemini AI for context-based response...');
        // ดึงประวัติล่าสุด (ให้ lib จัดการ slicing)
        const { data: recentMessages } = await supabase
          .from('chatbot_messages')
          .select('message, is_bot')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(10);

        botResponse = await chatWithGemini(userMessage, recentMessages?.reverse() || []);
        console.log('🤖 GEMINI RESPONSE:', botResponse);
      } catch (geminiError) {
        console.error('Gemini AI failed:', geminiError);
        // Fallback to default message
        const { data: fallbackFaqs } = await supabase
          .from('chatbot_faqs')
          .select('question,answer')
          .eq('question', '::fallback::');
        botResponse = (fallbackFaqs && fallbackFaqs[0]?.answer)
          || 'ขอบคุณสำหรับข้อความครับ หากต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อเราได้ครับ';
        console.log('⚠️ FALLBACK MESSAGE (after Gemini failed):', botResponse);
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