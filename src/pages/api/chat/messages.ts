import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

// Helper function to verify session access
async function verifySessionAccess(sessionId: string, anonymousId?: string, customerId?: string) {
  console.log('🔍 Verifying session access:', { sessionId, anonymousId, customerId });
  
  // Get session details
  const { data: session, error } = await supabase
    .from('chatbot_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    console.error('❌ Session not found:', { sessionId, error });
    throw new Error('Session not found');
  }

  console.log('📋 Session details:', { 
    id: session.id, 
    customer_id: session.customer_id, 
    anonymous_id: session.anonymous_id 
  });

  // Check access permissions
  if (session.customer_id) {
    // Session belongs to a user
    if (customerId && session.customer_id === customerId) {
      console.log('✅ User owns this session');
      return true; // User owns this session
    }
    console.error('❌ Access denied: Session belongs to another user', { 
      sessionCustomerId: session.customer_id, 
      providedCustomerId: customerId 
    });
    throw new Error('Access denied: Session belongs to another user');
  } else if (session.anonymous_id) {
    // Session belongs to a guest
    if (anonymousId && session.anonymous_id === anonymousId) {
      console.log('✅ Guest owns this session');
      return true; // Guest owns this session
    }
    console.error('❌ Access denied: Session belongs to another guest', { 
      sessionAnonymousId: session.anonymous_id, 
      providedAnonymousId: anonymousId 
    });
    throw new Error('Access denied: Session belongs to another guest');
  }

  console.error('❌ Invalid session state:', session);
  throw new Error('Invalid session state');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sessionId, anonymousId, customerId } = req.query;

  if (req.method === 'GET') {
    try {
      // Check if sessionId exists
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      // Verify session access
      await verifySessionAccess(sessionId as string, anonymousId as string, customerId as string);

      // Fetch messages for session
      const { data: messages, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('session_id', sessionId as string)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      res.status(200).json({ messages: messages || [] });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages', details: error });
    }
  } else if (req.method === 'POST') {
    try {
      const { message, isBot, anonymousId: bodyAnonymousId, customerId: bodyCustomerId } = req.body;

      // Validate required fields
      if (!sessionId || !message) {
        return res.status(400).json({ error: 'Session ID and message are required' });
      }

      // Use body parameters for POST, query parameters for GET
      const authAnonymousId = bodyAnonymousId || anonymousId;
      const authCustomerId = bodyCustomerId || customerId;

      // Verify session access
      await verifySessionAccess(sessionId as string, authAnonymousId as string, authCustomerId as string);

      console.log('Saving message:', { sessionId, message, isBot });
      
      // Save user message
      const { data: newMessage, error: messageError } = await supabase
        .from('chatbot_messages')
        .insert({
          session_id: sessionId as string,
          message,
          is_bot: isBot || false
        })
        .select()
        .single();

      console.log('Supabase message result:', { newMessage, messageError });

      if (messageError) {
        console.error('Supabase message error:', messageError);
        throw messageError;
      }

      // If this is a user message (not bot), trigger bot response
      if (!isBot) {
        console.log('Triggering bot response for user message:', message);
        
        try {
          // Get conversation history for context
          const { data: messagesData } = await supabase
            .from('chatbot_messages')
            .select('*')
            .eq('session_id', sessionId as string)
            .order('created_at', { ascending: true });

          // Call bot response API asynchronously (fire-and-forget)
          // The typing indicator will be hidden when the bot message arrives via Realtime
          const botResponseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat/bot-response`;
          
          fetch(botResponseUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: sessionId as string,
              userMessage: message,
              conversationHistory: messagesData || []
            })
          })
          .then(response => {
            console.log('Bot response API call status:', response.status);
            if (!response.ok) {
              throw new Error(`Bot response API returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('Bot response generated successfully:', data);
            // Note: Typing indicator will be hidden when bot message arrives via Realtime
          })
          .catch(error => {
            console.error('Error calling bot response API:', error);
            console.error('Bot response URL:', botResponseUrl);
            console.error('Request body:', { sessionId: sessionId as string, userMessage: message });
            // Note: Typing indicator will be hidden by safety timeout or fallback check
          });
          
        } catch (error) {
          console.error('Error triggering bot response:', error);
        }
      }

      // Return only the user message
      res.status(201).json({ message: newMessage });
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ 
        error: 'Failed to save message',
        details: error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
