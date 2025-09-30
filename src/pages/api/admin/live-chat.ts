import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PUT') {
    const { ticketId, liveChatEnabled } = req.body;

    if (!ticketId || typeof liveChatEnabled !== 'boolean') {
      return res.status(400).json({ error: 'Ticket ID and live chat status are required' });
    }

    try {
      const { data, error } = await supabase
        .from('chatbot_tickets')
        .update({ live_chat_enabled: liveChatEnabled })
        .eq('id', ticketId)
        .select();

      if (error) {
        console.error('Error updating live chat status:', error);
        return res.status(500).json({ error: 'Failed to update live chat status' });
      }

      return res.status(200).json({ success: true, ticket: data[0] });
    } catch (error) {
      console.error('API Error updating live chat status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
