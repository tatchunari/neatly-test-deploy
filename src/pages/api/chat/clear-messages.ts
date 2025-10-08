import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      console.log('❌ Clear messages API: Missing sessionId');
      return res.status(400).json({ error: 'Session ID is required' });
    }

    console.log('🗑️ Clear messages API called for session:', sessionId);
    console.log('🔄 Starting Supabase delete operation...');

    // Count messages before deletion for logging
    const { count: messageCount, error: countError } = await supabase
      .from('chatbot_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (countError) {
      console.error('❌ Error counting messages:', countError);
    } else {
      console.log('📊 Messages count before deletion:', messageCount);
    }

    // Check for active tickets in this session
    const { data: activeTickets, error: ticketError } = await supabase
      .from('chatbot_tickets')
      .select('id, status')
      .eq('session_id', sessionId)
      .in('status', ['open', 'in_progress']);

    if (ticketError) {
      console.error('❌ Error checking tickets:', ticketError);
    } else {
      console.log('🎫 Active tickets found:', activeTickets?.length || 0);
    }

    // Delete all messages in session
    const { error: deleteError } = await supabase
      .from('chatbot_messages')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) {
      console.error('❌ Supabase delete error:', deleteError);
      console.error('❌ Delete error details:', JSON.stringify(deleteError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to clear messages',
        details: deleteError 
      });
    }

    console.log('✅ Messages cleared successfully from database');

    // Close active tickets if any
    if (activeTickets && activeTickets.length > 0) {
      console.log('🎫 Closing active tickets...');
      
      const { error: closeTicketError } = await supabase
        .from('chatbot_tickets')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString(),
          close_reason: 'Chat cleared by user'
        })
        .eq('session_id', sessionId)
        .in('status', ['open', 'in_progress']);

      if (closeTicketError) {
        console.error('❌ Error closing tickets:', closeTicketError);
      } else {
        console.log('✅ Active tickets closed successfully');
      }
    }

    console.log('📊 Deleted', messageCount || 0, 'messages');
    console.log('🎫 Closed', activeTickets?.length || 0, 'tickets');

    res.status(200).json({ 
      success: true,
      deletedCount: messageCount || 0,
      closedTicketsCount: activeTickets?.length || 0,
      message: 'Messages and tickets cleared successfully'
    });

  } catch (error) {
    console.error('❌ Clear messages API error:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
