import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test Supabase connection
    console.log('Testing Supabase connection...');
    
    // Try to query chatbot_sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('chatbot_sessions')
      .select('*')
      .limit(1);
    
    console.log('Sessions query result:', { sessions, sessionsError });
    
    // Try to query chatbot_messages table  
    const { data: messages, error: messagesError } = await supabase
      .from('chatbot_messages')
      .select('*')
      .limit(1);
    
    console.log('Messages query result:', { messages, messagesError });
    
    res.status(200).json({
      supabase_connection: 'OK',
      sessions: { data: sessions, error: sessionsError },
      messages: { data: messages, error: messagesError }
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ error: 'Test failed', details: error });
  }
}
