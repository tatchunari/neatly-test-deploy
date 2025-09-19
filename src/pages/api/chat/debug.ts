import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('=== SUPABASE DEBUG TEST ===');

    // Test 1: Simple select on sessions
    console.log('1. Testing sessions table select...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('chatbot_sessions')
      .select('*')
      .limit(1);
    
    console.log('Sessions result:', { sessions, sessionsError });

    // Test 2: Simple select on messages  
    console.log('2. Testing messages table select...');
    const { data: messages, error: messagesError } = await supabase
      .from('chatbot_messages')
      .select('*')
      .limit(1);
    
    console.log('Messages result:', { messages, messagesError });

    // Test 3: Try to insert a session
    console.log('3. Testing session insert...');
    const { data: newSession, error: insertSessionError } = await supabase
      .from('chatbot_sessions')
      .insert({
        status: 'test',
        anonymous_id: 'debug_test_' + Date.now()
      })
      .select()
      .single();
    
    console.log('Session insert result:', { newSession, insertSessionError });

    // Test 4: If session created, try to insert a message
    if (newSession && !insertSessionError) {
      console.log('4. Testing message insert...');
      const { data: newMessage, error: insertMessageError } = await supabase
        .from('chatbot_messages')
        .insert({
          session_id: newSession.id,
          sender_id: 'debug_user',
          message: 'Debug test message',
          is_bot: false
        })
        .select()
        .single();
      
      console.log('Message insert result:', { newMessage, insertMessageError });
    }

    res.status(200).json({
      status: 'Debug complete',
      results: {
        sessions: { data: sessions, error: sessionsError },
        messages: { data: messages, error: messagesError },
        sessionInsert: { data: newSession, error: insertSessionError }
      }
    });

  } catch (error) {
    console.error('Debug test error:', error);
    res.status(500).json({ 
      error: 'Debug test failed', 
      details: error,
      message: error.message 
    });
  }
}
