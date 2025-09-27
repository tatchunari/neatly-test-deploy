import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { sessionId, isTyping, userType } = req.body; // userType: 'admin' or 'user'

    if (!sessionId || typeof isTyping !== 'boolean' || !userType) {
      return res.status(400).json({ error: 'Session ID, typing status, and user type are required' });
    }

    try {
      // Store typing status in a simple way - we'll use a custom table or cache
      // For now, we'll use a simple approach with Supabase realtime
      const channel = supabase.channel(`chat:${sessionId}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'typing_status',
        payload: {
          sessionId,
          isTyping,
          userType,
          timestamp: new Date().toISOString()
        }
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('API Error handling typing status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
