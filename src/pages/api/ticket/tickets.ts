import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const { id } = query;

  try {
    switch (method) {
      case 'GET':
        // Get tickets (optionally filter by session_id or id)
        const { session_id: sessionId } = query;
        
        let queryBuilder = supabase
          .from('chatbot_tickets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (sessionId) {
          queryBuilder = queryBuilder.eq('session_id', sessionId);
        } else if (id) {
          // If id is provided, get specific ticket
          queryBuilder = queryBuilder.eq('id', id);
        }
        
        const { data: tickets, error: fetchError } = await queryBuilder;

        if (fetchError) {
          console.error('Error fetching tickets:', fetchError);
          return res.status(500).json({ error: 'Failed to fetch tickets' });
        }

        // If searching by id, return single ticket
        if (id) {
          if (tickets && tickets.length > 0) {
            return res.status(200).json({ ticket: tickets[0] });
          } else {
            return res.status(404).json({ error: 'Ticket not found' });
          }
        }

        return res.status(200).json({ tickets });

      case 'POST':
        // Create new ticket
        const { user_message, session_id: ticketSessionId } = body;
        if (!user_message || !ticketSessionId) {
          return res.status(400).json({ error: 'User message and session ID are required' });
        }

        const { data: newTicket, error: createError } = await supabase
          .from('chatbot_tickets')
          .insert({
            session_id: ticketSessionId,
            user_message,
            status: 'open'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating ticket:', createError);
          return res.status(500).json({ error: 'Failed to create ticket' });
        }

        return res.status(201).json({ ticket: newTicket });

      case 'PUT':
        // Update ticket status
        if (!id) {
          return res.status(400).json({ error: 'Ticket ID is required' });
        }

        const { status } = body;
        if (!status) {
          return res.status(400).json({ error: 'Status is required' });
        }

        const updateData: any = { status };
        
        // If closing ticket, set closed_at timestamp
        if (status === 'closed') {
          updateData.closed_at = new Date().toISOString();
        } else if (status !== 'closed') {
          // If reopening ticket, clear closed_at
          updateData.closed_at = null;
        }

        const { data: updatedTicket, error: updateError } = await supabase
          .from('chatbot_tickets')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating ticket:', updateError);
          return res.status(500).json({ error: 'Failed to update ticket' });
        }

        return res.status(200).json({ ticket: updatedTicket });

      case 'DELETE':
        // Delete ticket
        if (!id) {
          return res.status(400).json({ error: 'Ticket ID is required' });
        }

        const { error: deleteError } = await supabase
          .from('chatbot_tickets')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting ticket:', deleteError);
          return res.status(500).json({ error: 'Failed to delete ticket' });
        }

        return res.status(200).json({ message: 'Ticket deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
