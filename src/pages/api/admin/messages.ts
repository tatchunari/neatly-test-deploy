import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const { data: messages, error } = await supabase
      .from('chatbot_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    return res.status(200).json({ messages: messages || [] });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
