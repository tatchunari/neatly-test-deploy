import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { chatWithGemini, historyType } from '@/lib/chat';
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

    // Check if there's an active ticket with in_progress status AND live chat is enabled
    const { data: activeTickets, error: ticketError } = await supabase
      .from('chatbot_tickets')
      .select('id, status, live_chat_enabled')
      .eq('session_id', sessionId)
      .eq('status', 'in_progress');

    if (!ticketError && activeTickets && activeTickets.length > 0) {
      const ticket = activeTickets[0];
      // Check if live chat is enabled
      if (ticket.live_chat_enabled) {
        console.log('🚫 Bot response blocked - live chat active:', ticket);
        return res.status(200).json({ 
          message: null,
          success: true,
          blocked: true,
          reason: 'Live chat is active'
        });
      }
    }

    // 1. Strict match: JOIN chatbot_faqs + chatbot_faq_aliases
    let botResponse = '';
    interface BotResponseData {
      format: 'message' | 'option_details' | 'room_type';
      message: string;
      options?: Array<{ option: string; detail: string }>;
      rooms?: string[];
      buttonName?: string;
      roomDetails?: { [roomName: string]: { id: number; main_image: string; base_price: number; promo_price?: number; description: string } };
    }
    
    let botResponseData: BotResponseData | null = null;

    // Helper function to fetch room details
    const fetchRoomDetails = async (roomNames: string[]) => {
      if (!roomNames || roomNames.length === 0) return {};
      
      // Filter out undefined/null values
      const validRoomNames = roomNames.filter(name => name && name !== 'undefined');
      if (validRoomNames.length === 0) return {};
      
      const { data: roomTypes, error } = await supabase
        .from('room_types')
        .select('id, name, main_image, base_price, promo_price, description')
        .in('name', validRoomNames);
      
      if (error) {
        console.error('Error fetching room details:', error);
        return {};
      }
      
      const roomDetails: { [roomName: string]: { id: number; main_image: string; base_price: number; promo_price?: number; description: string } } = {};
      roomTypes?.forEach(room => {
        roomDetails[room.name] = {
          id: room.id,
          main_image: room.main_image || '',
          base_price: room.base_price || 0,
          promo_price: room.promo_price,
          description: room.description || ''
        };
      });
      
      return roomDetails;
    };
    try {
      const normalize = (s: string) => s.trim().toLowerCase();
      const userQuery = normalize(userMessage);
      console.log('🔍 STRICT MATCH DEBUG:', { userQuery, originalMessage: userMessage });

      // Check FAQ questions first
      const { data: faqMatches, error: faqError } = await supabase
        .from('chatbot_faqs')
        .select('topic, reply_message, reply_format, reply_payload')
        .neq('topic', '::greeting::')
        .neq('topic', '::fallback::');

      if (!faqError && faqMatches) {
        for (const faq of faqMatches) {
          if (userQuery === normalize(faq.topic)) {
            console.log('🎯 STRICT MATCH by topic:', { 
              userQuery, 
              matchedTopic: faq.topic, 
              replyFormat: faq.reply_format 
            });
            // Set response based on format
            if (faq.reply_format === 'message') {
              botResponse = faq.reply_message;
              botResponseData = {
                format: 'message',
                message: faq.reply_message
              };
            } else if (faq.reply_format === 'option_details') {
              botResponse = faq.reply_message;
              botResponseData = {
                format: 'option_details',
                message: faq.reply_message,
                options: faq.reply_payload
              };
            } else if (faq.reply_format === 'room_type') {
              botResponse = faq.reply_message;
              const rooms = faq.reply_payload?.rooms || [];
              const roomDetails = await fetchRoomDetails(rooms);
              botResponseData = {
                format: 'room_type',
                message: faq.reply_message,
                rooms: rooms,
                buttonName: faq.reply_payload?.buttonName || 'View Details',
                roomDetails: roomDetails
              };
            }
            break;
          }
          
          // Check option_details format for option matching
          if (faq.reply_format === 'option_details' && faq.reply_payload) {
            try {
              const options = Array.isArray(faq.reply_payload) ? faq.reply_payload : JSON.parse(faq.reply_payload);
              if (Array.isArray(options)) {
                for (const option of options) {
                  if (option.option && userQuery === normalize(option.option)) {
                    botResponse = option.detail || option.option;
                    botResponseData = {
                      format: 'message',
                      message: option.detail || option.option
                    };
                    console.log('✅ STRICT MATCH found in option_details:', { option: option.option, detail: option.detail });
                    break;
                  }
                }
              }
            } catch (error) {
              console.error('Error parsing reply_payload for option_details:', error);
            }
            
            if (botResponse) break;
          }
        }
      }

      // If no FAQ match, check aliases
      if (!botResponse) {
        const { data: aliasMatches, error: aliasError } = await supabase
          .from('chatbot_faq_aliases')
          .select('alias, faq_id');

        if (!aliasError && aliasMatches) {
          for (const aliasMatch of aliasMatches) {
            if (userQuery === normalize(aliasMatch.alias)) {
              // Get FAQ answer by faq_id with full data
              const { data: faqData } = await supabase
                .from('chatbot_faqs')
                .select('topic, reply_message, reply_format, reply_payload')
                .eq('id', aliasMatch.faq_id)
                .single();

              if (faqData?.reply_message) {
                console.log('🎯 STRICT MATCH by alias:', { 
                  userQuery, 
                  matchedAlias: aliasMatch.alias,
                  matchedTopic: faqData.topic || 'Unknown',
                  replyFormat: faqData.reply_format 
                });
                // Set response based on format
                if (faqData.reply_format === 'message') {
                  botResponse = faqData.reply_message;
                  botResponseData = {
                    format: 'message',
                    message: faqData.reply_message
                  };
                } else if (faqData.reply_format === 'option_details') {
                  botResponse = faqData.reply_message;
                  botResponseData = {
                    format: 'option_details',
                    message: faqData.reply_message,
                    options: faqData.reply_payload
                  };
                } else if (faqData.reply_format === 'room_type') {
                  botResponse = faqData.reply_message;
                  const rooms = faqData.reply_payload?.rooms || [];
                  const roomDetails = await fetchRoomDetails(rooms);
                  botResponseData = {
                    format: 'room_type',
                    message: faqData.reply_message,
                    rooms: rooms,
                    buttonName: faqData.reply_payload?.buttonName || 'View Details',
                    roomDetails: roomDetails
                  };
                }
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
            botResponse = bestMatch.reply_message;
            
            // Set response data based on format from vector match
            if (bestMatch.reply_format === 'message') {
              botResponseData = {
                format: 'message',
                message: bestMatch.reply_message
              };
            } else if (bestMatch.reply_format === 'option_details') {
              botResponseData = {
                format: 'option_details',
                message: bestMatch.reply_message,
                options: bestMatch.reply_payload
              };
            } else if (bestMatch.reply_format === 'room_type') {
              const rooms = bestMatch.reply_payload?.rooms || [];
              const roomDetails = await fetchRoomDetails(rooms);
              botResponseData = {
                format: 'room_type',
                message: bestMatch.reply_message,
                rooms: rooms,
                buttonName: bestMatch.reply_payload?.buttonName || 'View Details',
                roomDetails: roomDetails
              };
            }
            
            console.log('🔍 VECTOR MATCH found:', {
              source: bestMatch.source,
              similarity: bestMatch.similarity,
              reply_message: bestMatch.reply_message,
              format: bestMatch.reply_format
            });
          }
        } catch (err) {
          console.error('Vector RPC search failed, using fallback:', err);
          const { data: fallbackFaqs } = await supabase
            .from('chatbot_faqs')
            .select('topic,reply_message')
            .eq('topic', '::fallback::');
          if (fallbackFaqs && fallbackFaqs[0]?.reply_message) {
            botResponse = fallbackFaqs[0].reply_message;
            botResponseData = {
              format: 'message',
              message: fallbackFaqs[0].reply_message
            };
          } else {
            throw new Error('No fallback message found in database');
          }
          console.log('⚠️ FALLBACK MESSAGE:', botResponse);
        }
      }
    } catch (error) {
      console.error('Error during strict FAQ matching:', error);
    }

    // 3. Intent Classification + Handle Intent (if no FAQ/alias match found)
    if (!botResponse) {
      try {
        console.log('🎯 Starting intent classification...');
        
        // ดึงประวัติล่าสุดสำหรับ context
        const { data: recentMessages } = await supabase
          .from('chatbot_messages')
          .select('message, is_bot')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(10);

        // Classify Intent
        const intent = await classifyIntent(userMessage, recentMessages?.reverse() || []);
        console.log('🎯 CLASSIFIED INTENT:', intent);

        // Handle Intent
        botResponse = await handleIntent(intent, userMessage, recentMessages?.reverse() || []);
        console.log('🎯 INTENT HANDLED:', { intent, responseLength: botResponse.length });

      } catch (error) {
        console.error('Intent classification/handling failed:', error);
         // Fallback to FAQ table
         try {
           const { data: fallbackContext, error: contextError } = await supabase
             .from('chatbot_faqs')
             .select('reply_message')
             .eq('topic', '::fallback::')
             .single();

          if (!contextError && fallbackContext) {
            botResponse = fallbackContext.reply_message;
          } else {
            throw new Error('No fallback message found in database');
          }
        } catch (fallbackError) {
          console.error('Fallback context failed:', fallbackError);
          throw fallbackError;
        }
        console.log('⚠️ FALLBACK MESSAGE (after intent handling failed):', botResponse);
      }
    }

    // Save bot response to database with retry mechanism
    let botMessage;
    let retryCount = 0;
    const maxRetries = 3;
    
    // Prepare message content - if we have responseData, encode it in the message
    let messageContent = botResponse;
    if (botResponseData && botResponseData.format !== 'message') {
      // For non-message formats, encode the responseData as JSON in the message
      messageContent = JSON.stringify({
        text: botResponse,
        responseData: botResponseData
      });
    }
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('chatbot_messages')
          .insert({
            session_id: sessionId,
            message: messageContent,
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
      responseData: botResponseData,
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

// Intent Classification Function
async function classifyIntent(userQuestion: string, conversationHistory: historyType[]): Promise<string> {
  console.log("🎯 INTENT CLASSIFICATION for:", userQuestion);

  // Build conversation context
  let contextString = "";
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-3); // Last 3 messages
    contextString = recentHistory
      .map(
        (msg: { message: string; is_bot: boolean }) =>
          `${msg.is_bot ? "Bot" : "User"}: ${msg.message}`
      )
      .join("\n");
  }

  const intentPrompt = `You are an intent classification assistant.
Categories: faq, rooms, promo_codes, other.
Answer only with the category name.

${contextString ? `Conversation context:\n${contextString}\n` : ""}
User question: "${userQuestion}"`;

  const intentResponse = await chatWithGemini(intentPrompt);
  const intent = intentResponse.trim().toLowerCase();

  // Validate intent
  const validIntents = ["faq", "rooms", "promo_codes", "other"];
  const classifiedIntent = validIntents.includes(intent) ? intent : "other";

  console.log("🎯 CLASSIFIED INTENT:", classifiedIntent);
  return classifiedIntent;
}

// Handle Intent Function
async function handleIntent(intent: string, userQuestion: string, conversationHistory: historyType[]): Promise<string> {
  console.log("🎯 HANDLING INTENT:", { intent, userQuestion });

  let botResponse = "";

  switch (intent) {
    case "faq":
    case "other":
      botResponse = await handleFAQIntent(userQuestion, conversationHistory);
      break;

    case "rooms":
      botResponse = await handleRoomsIntent(userQuestion, conversationHistory);
      break;

    case "promo_codes":
      botResponse = await handlePromoCodesIntent(userQuestion, conversationHistory);
      break;

    default:
      botResponse = await handleFAQIntent(userQuestion, conversationHistory);
      break;
  }

  console.log("🎯 INTENT HANDLED:", {
    intent,
    responseLength: botResponse.length,
  });

  return botResponse;
}

// FAQ Intent Handler
async function handleFAQIntent(userQuestion: string, conversationHistory?: historyType[]): Promise<string> {
  try {
    console.log("📚 FAQ FALLBACK - Getting all FAQ and context data...");

    // ดึง FAQ ทั้งหมดเป็น context
    const { data: allFAQs, error: faqError } = await supabase
      .from("chatbot_faqs")
      .select("topic, reply_message")
      .neq("topic", "::greeting::")
      .neq("topic", "::fallback::");

    if (faqError) {
      console.error("Error fetching FAQs for context:", faqError);
      throw faqError;
    }

    // ดึง contexts เพิ่มเติม
    const { data: contexts, error: contextError } = await supabase
      .from("chatbot_contexts")
      .select("content")
      .order("created_at", { ascending: true });

    if (contextError) {
      console.error("Error fetching contexts:", contextError);
      // ไม่ throw error เพราะ contexts เป็น optional
    }

    // สร้าง context string จาก FAQ ทั้งหมด
    const faqContext =
      allFAQs
        ?.map((faq) => `Q: ${faq.topic}\nA: ${faq.reply_message}`)
        .join("\n\n") || "";

    // สร้าง context string จาก contexts
    const additionalContext =
      contexts?.map((ctx) => ctx.content).join("\n") || "";

    const faqPrompt = `You are a helpful hotel assistant. Use the following FAQ and additional context to answer the user's question.

FAQ Context:
${faqContext}

Additional Context:
${additionalContext}

User Question: "${userQuestion}"

Answer based on the FAQ and additional context above. If the question doesn't match any FAQ, provide a helpful response or ask for clarification.`;

    const response = await chatWithGemini(faqPrompt, conversationHistory);

    // ตรวจสอบความมั่นใจของคำตอบ
    const confidence = await checkResponseConfidence(response, userQuestion);
    if (confidence < 5) {
      console.log("🤖 FAQ response confidence too low, using fallback");
      return await getFallbackContext();
    }

    return response;
  } catch (error) {
    console.error("FAQ fallback failed:", error);
    // Fallback to context table
    return await getFallbackContext();
  }
}

// Rooms Intent Handler
async function handleRoomsIntent(userQuestion: string, conversationHistory?: historyType[]): Promise<string> {
  try {
    console.log("🏨 ROOMS INTENT - Generating SQL...");

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

    console.log("🏨 GENERATED SQL:", sqlQuery);

    // Execute SQL
    const { data: result, error } = await supabase.from("rooms").select("*");

    if (error) {
      console.error("SQL execution error:", error);
      throw error;
    }

    console.log("🏨 SQL RESULT:", result?.length || 0, "rooms found");

    // Generate response from SQL result
    let responsePrompt = `User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result || [])}
Answer only based on the context.`;

    // Add conversation history context if available
    if (conversationHistory && conversationHistory.length > 0) {
      const historyContext = conversationHistory
        .slice(-5) // Take last 5 messages
        .map((msg) => `${msg.is_bot ? "Bot" : "User"}: ${msg.message}`)
        .join("\n");

      responsePrompt = `Previous conversation:
${historyContext}

Current User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result || [])}
Answer only based on the context and conversation history.`;
    }

    const response = await chatWithGemini(responsePrompt, conversationHistory);

    // ตรวจสอบความมั่นใจของคำตอบ
    const confidence = await checkResponseConfidence(response, userQuestion);
    if (confidence < 5) {
      console.log("🤖 Rooms response confidence too low, using fallback");
      return await getFallbackContext();
    }

    return response;
  } catch (error) {
    console.error("Rooms intent failed:", error);
    return await getFallbackContext();
  }
}

// Promo Codes Intent Handler
async function handlePromoCodesIntent(userQuestion: string, conversationHistory?: historyType[]): Promise<string> {
  try {
    console.log("🎟️ PROMO CODES INTENT - Generating SQL...");

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

    console.log("🎟️ GENERATED SQL:", sqlQuery);

    // Execute SQL (ตัวอย่าง query ที่ Gemini อาจสร้าง)
    const { data: result, error } = await supabase
      .from("promo_codes")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .eq("is_active", true);

    if (error) {
      console.error("SQL execution error:", error);
      throw error;
    }

    console.log("🎟️ SQL RESULT:", result?.length || 0, "promo codes found");

    // Generate response from SQL result
    let responsePrompt = `User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result || [])}
Answer only based on the context.`;

    // Add conversation history context if available
    if (conversationHistory && conversationHistory.length > 0) {
      const historyContext = conversationHistory
        .slice(-5) // Take last 5 messages
        .map((msg) => `${msg.is_bot ? "Bot" : "User"}: ${msg.message}`)
        .join("\n");

      responsePrompt = `Previous conversation:
${historyContext}

Current User Question: "${userQuestion}"
Context from database:
${JSON.stringify(result || [])}
Answer only based on the context and conversation history.`;
    }

    const response = await chatWithGemini(responsePrompt, conversationHistory);

    // ตรวจสอบความมั่นใจของคำตอบ
    const confidence = await checkResponseConfidence(response, userQuestion);
    if (confidence < 5) {
      console.log("🤖 Promo codes response confidence too low, using fallback");
      return await getFallbackContext();
    }

    return response;
  } catch (error) {
    console.error("Promo codes intent failed:", error);
    return await getFallbackContext();
  }
}

// Helper function to check response confidence
async function checkResponseConfidence(response: string, userQuestion: string): Promise<number> {
  try {
    const confidencePrompt = `
Rate the confidence of this response (1-10):
Response: "${response}"
Question: "${userQuestion}"

Consider:
- Does the response directly answer the question?
- Is the response specific and informative?
- Does the response indicate uncertainty or lack of knowledge?
- Is the response based on hotel information/data?
- Does the response provide hotel-specific details?
- If the response says "cannot help" or "not able to", give lower score (1-4)

Answer only with a number from 1-10.`;

    const confidenceText = await chatWithGemini(confidencePrompt);
    const confidence = parseInt(confidenceText.trim());

    // Validate confidence score
    if (isNaN(confidence) || confidence < 1 || confidence > 10) {
      console.log("🤖 Invalid confidence score, defaulting to 5");
      return 5;
    }

    console.log("🤖 Response confidence:", confidence);
    return confidence;
  } catch (error) {
    console.error("Error checking response confidence:", error);
    return 5; // Default to medium confidence
  }
}

// Helper function to get fallback context (จาก chatbot_faqs table)
async function getFallbackContext(): Promise<string> {
  try {
    const { data: fallbackContext, error } = await supabase
      .from("chatbot_faqs")
      .select("reply_message")
      .eq("topic", "::fallback::")
      .single();

    if (!error && fallbackContext) {
      return fallbackContext.reply_message;
    }

    // No fallback message found in database
    throw new Error("No fallback message found in database");
  } catch (error) {
    console.error("Error getting fallback context:", error);
    throw error;
  }
}