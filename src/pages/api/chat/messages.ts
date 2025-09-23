import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sessionId } = req.query;

  if (req.method === 'GET') {
    try {
      // Check if sessionId exists
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

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
      const { message, isBot } = req.body;

      // Validate required fields
      if (!sessionId || !message) {
        return res.status(400).json({ error: 'Session ID and message are required' });
      }

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

          // Call bot response API asynchronously with better error handling
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
          })
          .catch(error => {
            console.error('Error calling bot response API:', error);
            console.error('Bot response URL:', botResponseUrl);
            console.error('Request body:', { sessionId: sessionId as string, userMessage: message });
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
