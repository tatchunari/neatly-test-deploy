import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      console.log('Creating new chat session...');
      
      // Create new chat session
      const { data: session, error } = await supabase
        .from('chatbot_sessions')
        .insert({
          status: 'active'
        })
        .select()
        .single();

      console.log('Supabase session result:', { session, error });

      if (error) {
        console.error('Supabase session error:', error);
        throw error;
      }

      res.status(201).json({ session });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ 
        error: 'Failed to create session', 
        details: error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
